/* ═══════════════════════════════════════════════════════════
   PROJECT PORTFOLIO - CONTROLLER
   3D 3-Card Continuous Flow Carousel, Interactive Positioning,
   Video Autoplay & Modal Lightbox
   ═══════════════════════════════════════════════════════════ */
window.ProjectPortfolioSystem = (() => {
    'use strict';

    let currentSlide = 0;
    let isInitialized = false;
    let areListenersBound = false;
    const oldOffsets = new Map();
    let isTransitioning = false;
    let resizeTimer = null;
    let syncBroadcastChannel = null;

    /**
     * Public initialize entry point
     */
    const init = async () => {
        if (!isInitialized) {
            isInitialized = true;
            bindCarouselEventListeners();
            initSyncEvents();
        }
        await loadDynamicProjects();
    };

    /**
     * Load & Render Projects dynamically from Supabase Data Provider
     * @param {string} [focusProjectSlugOrId] - Optional slug or id of a newly saved project to immediately center
     */
    const loadDynamicProjects = async (focusProjectSlugOrId = null) => {
        try {
            const projects = await window.PortfolioData.getProjects({ forceCloud: true });
            const validProjects = (projects || []).filter(p => p && p.is_active !== false);

            if (validProjects.length > 0) {
                renderProjectCards(validProjects);

                // If a specific project was just saved or requested, bring it to center!
                if (focusProjectSlugOrId) {
                    const targetIdx = validProjects.findIndex(p => 
                        String(p.slug || '').toLowerCase() === String(focusProjectSlugOrId).toLowerCase() ||
                        String(p.id || '').toLowerCase() === String(focusProjectSlugOrId).toLowerCase()
                    );
                    if (targetIdx >= 0) {
                        currentSlide = targetIdx;
                    } else if (currentSlide >= validProjects.length) {
                        currentSlide = 0;
                    }
                } else if (currentSlide >= validProjects.length) {
                    currentSlide = 0;
                }

                // Immediately calculate and apply 3D positions to the newly rendered cards
                updateCarousel(true);
                setupProjectVideos();
                initProjectLightbox();
            } else {
                const stage = document.getElementById('projects-stage');
                if (stage) {
                    stage.innerHTML = `
                        <div style="grid-column: 1 / -1; width: 100%; text-align: center; padding: 60px 20px; color: var(--text-muted, #94a3b8);">
                            <p style="font-size: 1.1rem; margin-bottom: 8px;">No projects currently available.</p>
                            <p style="font-size: 0.85rem; opacity: 0.7;">Add projects through the Admin Dashboard to showcase your work.</p>
                        </div>
                    `;
                }
                const pagination = document.getElementById('projects-pagination');
                if (pagination) pagination.innerHTML = '';
                carouselItems = [];
                totalSlides = 0;
            }
        } catch (err) {
            console.warn('Error loading dynamic projects:', err);
            updateCarousel(true);
        }
    };

    const initSyncEvents = () => {
        // 1. Same-window custom event from PortfolioData.saveProject
        window.addEventListener('portfolio-project-saved', async (e) => {
            const targetId = e?.detail?.slug || e?.detail?.id || null;
            await loadDynamicProjects(targetId);
        });

        // 2. Inter-tab localStorage sync
        window.addEventListener('storage', async (e) => {
            if (e.key === 'portfolio_projects') {
                await loadDynamicProjects();
            }
        });

        // 3. High-speed BroadcastChannel sync across all open tabs
        try {
            if (typeof BroadcastChannel !== 'undefined' && !syncBroadcastChannel) {
                syncBroadcastChannel = new BroadcastChannel('portfolio_sync');
                syncBroadcastChannel.onmessage = async (msg) => {
                    if (msg?.data?.type === 'project-saved' || msg?.data?.type === 'project-reordered' || msg?.data?.type === 'project-deleted') {
                        const targetId = msg.data.project?.slug || msg.data.project?.id || null;
                        await loadDynamicProjects(targetId);
                    }
                };
            }
        } catch (_) {}

        // 4. Tab visibility change sync (e.g. user switched back from dashboard tab)
        document.addEventListener('visibilitychange', async () => {
            if (document.visibilityState === 'visible') {
                await loadDynamicProjects();
            }
        });
    };

    const getCardColorStyle = (colorStr) => {
        if (!colorStr) return '';
        const trimmed = colorStr.trim();
        let primary = trimmed;
        if (trimmed.startsWith('linear-gradient') || trimmed.startsWith('radial-gradient')) {
            const match = trimmed.match(/#(?:[0-9a-fA-F]{3}){1,2}|rgba?\([^)]+\)/);
            primary = match ? match[0] : '#3d8bff';
        }
        if (/^#[0-9a-fA-F]{3}$/.test(primary)) {
            primary = '#' + primary[1] + primary[1] + primary[2] + primary[2] + primary[3] + primary[3];
        }
        const glow = primary.startsWith('#') && primary.length === 7 ? `${primary}55` : 'rgba(61,139,255,0.35)';
        const border = primary.startsWith('#') && primary.length === 7 ? `${primary}cc` : primary;
        const bg = primary.startsWith('#') && primary.length === 7 ? `${primary}24` : 'rgba(61,139,255,0.12)';
        return `style="--project-accent: ${primary}; --project-card-border: ${border}; --project-card-glow: ${glow}; --project-accent-border: ${border}; --project-accent-bg: ${bg};"`;
    };

    const renderProjectCards = (projects) => {
        const stage = document.getElementById('projects-stage');
        if (!stage) return;

        stage.innerHTML = projects.map((p, idx) => {
            const tags = Array.isArray(p.tech_stack) ? p.tech_stack : (p.tech_stack || '').split(',').map(s => s.trim());
            const hasVideo = Boolean(p.video_url);
            const colorStyle = getCardColorStyle(p.card_color);

            return `
                <article class="project-showcase-card ${idx === 0 ? 'active' : ''}" data-project-id="${p.slug || p.id}"
                    data-project-title="${escapeHTML(p.title)}" data-project-kicker="${escapeHTML(p.category || 'Engineering')}"
                    data-project-url="${escapeHTML(p.live_url || '#')}" data-preview-type="${hasVideo ? 'video' : 'surface'}"
                    ${colorStyle}>
                    <div class="project-showcase-copy">
                        <div class="project-stackline">${escapeHTML(p.category || 'Engineering')}</div>
                        <h3 class="project-showcase-title">
                            ${p.live_url && p.live_url !== '#' ? 
                                `<a href="${p.live_url}" target="_blank" rel="noopener noreferrer">${escapeHTML(p.title)}</a>` : 
                                `${escapeHTML(p.title)}`}
                        </h3>
                        <p class="project-showcase-desc">${escapeHTML(p.description)}</p>
                        <div class="project-showcase-tech">
                            ${tags.filter(Boolean).map(t => `<span class="tech-tag">${escapeHTML(t)}</span>`).join('')}
                        </div>
                        <div class="project-showcase-actions">
                            ${p.live_url && p.live_url !== '#' ? 
                                `<a class="project-link-btn magnetic" href="${p.live_url}" target="_blank" rel="noopener noreferrer">Visit Live Site</a>` : 
                                `<button class="project-link-btn magnetic" type="button" data-project-expand="${p.slug || p.id}">Open Case Study</button>`}
                            <button class="project-preview-btn" type="button" data-project-expand="${p.slug || p.id}">
                                ${hasVideo ? 'Open Video Preview' : 'Expand Preview'}
                            </button>
                        </div>
                    </div>
                    <button class="project-showcase-preview" type="button" data-project-expand="${p.slug || p.id}"
                        aria-label="Open ${escapeHTML(p.title)} preview">
                        <div class="project-preview-frame ${hasVideo ? 'project-preview-frame-video' : (p.preview_color ? `project-preview-frame-${p.preview_color}` : 'project-preview-frame-blue')}" data-tilt>
                            <div class="project-preview-chrome">
                                <span></span><span></span><span></span>
                            </div>
                            ${hasVideo ? `
                                <video class="project-preview-video" muted playsinline preload="none" data-video-src="${p.video_url}"></video>
                                <div class="project-preview-sheen"></div>
                                <span class="project-preview-caption">Live motion preview</span>
                            ` : `
                                <div class="project-preview-surface">
                                    <div class="project-surface-row">
                                        <span class="surface-chip">${tags[0] || 'System'}</span>
                                        <span class="surface-chip">${tags[1] || 'Architecture'}</span>
                                    </div>
                                    <div class="surface-terminal">
                                        <span></span><span></span><span></span><span></span>
                                    </div>
                                    <div class="surface-grid">
                                        <span></span><span></span><span></span><span></span>
                                    </div>
                                </div>
                                <div class="project-preview-sheen"></div>
                                <span class="project-preview-caption">System preview layer</span>
                            `}
                        </div>
                    </button>
                </article>
            `;
        }).join('');
    };

    /**
     * Update 3D continuous flow carousel layout, scaling, offsets, and opacities
     */
    const updateCarousel = (instant = false) => {
        const stage = document.getElementById('projects-stage');
        const showcase = document.getElementById('projects-showcase');
        if (!stage || !showcase) return;

        const cards = Array.from(stage.querySelectorAll('.project-showcase-card'));
        const N = cards.length;
        if (N === 0) return;

        const showcaseWidth = showcase.getBoundingClientRect().width || window.innerWidth;
        const isMobile = showcaseWidth < 680;
        const isTablet = showcaseWidth >= 680 && showcaseWidth < 1024;

        // ZERO-OVERLAP RESPONSIVE ARCHITECTURE:
        // All project shapes/cards have uniform dimensions.
        // Prev and Next project cards maintain identical dimensions and sit beside the center card with a clean gap,
        // guaranteeing ZERO OVERLAP in any case across all device sizes and aspect ratios.
        const cardWidth = isMobile
            ? Math.min(360, Math.max(280, Math.round(showcaseWidth * 0.88)))
            : (isTablet 
                ? Math.min(540, Math.round(showcaseWidth * 0.70)) 
                : Math.min(680, Math.max(500, Math.round(showcaseWidth * 0.52))));

        const cardGap = isMobile ? 18 : (isTablet ? 24 : 32);
        // Clean shift without overlapping: shiftX is exactly cardWidth + cardGap
        const shiftX = Math.round(cardWidth + cardGap);
        const farShiftX = Math.round(shiftX * 2);

        let activeCard = null;

        cards.forEach((card, idx) => {
            // Apply card width and horizontal centering margin
            card.style.width = `${cardWidth}px`;
            card.style.marginLeft = `${-Math.round(cardWidth / 2)}px`;

            // Calculate circular offset relative to currentSlide in range [-floor((N-1)/2), ceil((N-1)/2)]
            let offset = ((idx - currentSlide) % N + N) % N;
            if (offset > N / 2) {
                offset -= N;
            }

            const prevOffset = oldOffsets.get(card) ?? offset;
            oldOffsets.set(card, offset);

            // Detect cards wrapping between hidden left (<= -2) and hidden right (>= 2)
            const isWrapping = Math.abs(offset) >= 2 && Math.abs(prevOffset) >= 2 && Math.sign(offset) !== Math.sign(prevOffset);

            if (instant || isWrapping) {
                card.classList.add('teleport');
            } else {
                card.classList.remove('teleport');
            }

            card.classList.remove('active', 'prev', 'next', 'hidden-left', 'hidden-right');

            if (offset === 0) {
                // Center Active Project Card: 100% visible, fully opaque, complete size & shape
                activeCard = card;
                card.classList.add('active');
                card.style.transform = 'translate3d(0px, 0, 0) scale(1)';
                card.style.opacity = '1';
                card.style.zIndex = '10';
                card.style.filter = 'none';
                card.style.pointerEvents = 'auto';
                card.setAttribute('aria-hidden', 'false');

                const vid = card.querySelector('.project-preview-video');
                if (vid && vid.src) {
                    vid.play().catch(() => {});
                }
            } else if (offset === -1) {
                // Previous Project Card: Same size & shape (scale 1), clicking changes position to center
                card.classList.add('prev');
                card.style.transform = `translate3d(${-shiftX}px, 0, 0) scale(1)`;
                card.style.opacity = '0.50';
                card.style.zIndex = '5';
                card.style.filter = 'brightness(0.85)';
                card.style.pointerEvents = 'auto';
                card.setAttribute('aria-hidden', 'false');

                const vid = card.querySelector('.project-preview-video');
                if (vid) vid.pause();
            } else if (offset === 1) {
                // Next Project Card: Same size & shape (scale 1), clicking changes position to center
                card.classList.add('next');
                card.style.transform = `translate3d(${shiftX}px, 0, 0) scale(1)`;
                card.style.opacity = '0.50';
                card.style.zIndex = '5';
                card.style.filter = 'brightness(0.85)';
                card.style.pointerEvents = 'auto';
                card.setAttribute('aria-hidden', 'false');

                const vid = card.querySelector('.project-preview-video');
                if (vid) vid.pause();
            } else if (offset < -1) {
                // Hidden Cards (Left background)
                card.classList.add('hidden-left');
                card.style.transform = `translate3d(${-farShiftX}px, 0, 0) scale(1)`;
                card.style.opacity = '0';
                card.style.zIndex = '1';
                card.style.filter = 'brightness(0.7)';
                card.style.pointerEvents = 'none';
                card.setAttribute('aria-hidden', 'true');

                const vid = card.querySelector('.project-preview-video');
                if (vid) vid.pause();
            } else {
                // Hidden Cards (Right background)
                card.classList.add('hidden-right');
                card.style.transform = `translate3d(${farShiftX}px, 0, 0) scale(1)`;
                card.style.opacity = '0';
                card.style.zIndex = '1';
                card.style.filter = 'brightness(0.7)';
                card.style.pointerEvents = 'none';
                card.setAttribute('aria-hidden', 'true');

                const vid = card.querySelector('.project-preview-video');
                if (vid) vid.pause();
            }

            if (instant || isWrapping) {
                requestAnimationFrame(() => {
                    card.classList.remove('teleport');
                });
            }
        });

        // Maintain uniform fixed stage height matching card dimensions
        const uniformHeight = isMobile ? (showcaseWidth < 400 ? 550 : 540) : (isTablet ? 530 : 490);
        stage.style.height = `${uniformHeight}px`;

        // Sync pagination indicator
        updatePagination(N);
    };

    /**
     * Transition carousel smoothly or instantly to targetIndex
     */
    const goToSlide = (targetIndex, instant = false) => {
        const stage = document.getElementById('projects-stage');
        if (!stage) return;
        const cards = stage.querySelectorAll('.project-showcase-card');
        const N = cards.length;
        if (N === 0) return;
        if (isTransitioning && !instant) return;

        if (!instant) {
            isTransitioning = true;
            setTimeout(() => {
                isTransitioning = false;
            }, 400);
        }

        currentSlide = ((targetIndex % N) + N) % N;
        updateCarousel(instant);
    };

    /**
     * Sync pagination dot indicators
     */
    const updatePagination = (total) => {
        const pagination = document.getElementById('projects-pagination');
        if (!pagination) return;

        if (pagination.children.length !== total) {
            pagination.innerHTML = '';
            for (let i = 0; i < total; i++) {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'projects-pagination-dot';
                dot.setAttribute('aria-label', `Go to project ${i + 1}`);
                dot.addEventListener('click', (e) => {
                    e.preventDefault();
                    goToSlide(i);
                });
                pagination.appendChild(dot);
            }
        }

        Array.from(pagination.children).forEach((dot, idx) => {
            if (idx === currentSlide) {
                dot.classList.add('active');
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.classList.remove('active');
                dot.removeAttribute('aria-current');
            }
        });
    };

    /**
     * Bind Carousel user interaction listeners (Click, Keys, Swipes, Resize) ONCE
     */
    const bindCarouselEventListeners = () => {
        if (areListenersBound) return;
        areListenersBound = true;

        const stage = document.getElementById('projects-stage');
        const showcase = document.getElementById('projects-showcase');
        const prevBtn = document.querySelector('[data-carousel-action="prev"]');
        const nextBtn = document.querySelector('[data-carousel-action="next"]');

        // Prev and Next Button Handlers
        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.preventDefault();
                goToSlide(currentSlide - 1);
            };
        }

        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.preventDefault();
                goToSlide(currentSlide + 1);
            };
        }

        // Direct Click-on-Project Card handler:
        // Clicking directly on Next, Previous, or ANY non-active project card
        // instead of needing the bottom Next/Prev buttons smoothly slides that project into the center
        if (stage) {
            stage.addEventListener('click', (e) => {
                const card = e.target.closest('.project-showcase-card');
                if (!card) return;

                // If user clicks on any card that is not the active center card,
                // bring that clicked project directly to the center!
                if (!card.classList.contains('active')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const allCards = Array.from(stage.querySelectorAll('.project-showcase-card'));
                    const targetIdx = allCards.indexOf(card);
                    if (targetIdx !== -1 && targetIdx !== currentSlide) {
                        goToSlide(targetIdx);
                    }
                }
            });
        }

        // Keyboard Arrow Navigation
        window.addEventListener('keydown', (e) => {
            if (!showcase) return;
            const rect = showcase.getBoundingClientRect();
            const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
            if (!isInViewport) return;

            if (e.key === 'ArrowLeft') {
                goToSlide(currentSlide - 1);
            } else if (e.key === 'ArrowRight') {
                goToSlide(currentSlide + 1);
            }
        });

        // Touch Swipe Navigation for mobile & tablet
        let touchStartX = 0;
        let touchStartY = 0;
        if (showcase) {
            showcase.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });

            showcase.addEventListener('touchend', (e) => {
                const diffX = e.changedTouches[0].screenX - touchStartX;
                const diffY = e.changedTouches[0].screenY - touchStartY;
                if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX > 0) {
                        goToSlide(currentSlide - 1);
                    } else {
                        goToSlide(currentSlide + 1);
                    }
                }
            }, { passive: true });
        }

        // Responsive Resize Handler
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                updateCarousel(true);
            }, 80);
        });
    };

    /**
     * Setup video autoplay and intersection observing
     */
    const setupProjectVideos = () => {
        const videos = document.querySelectorAll('.project-preview-video');
        videos.forEach(video => {
            const src = (video.dataset && video.dataset.videoSrc) || (video.getAttribute && video.getAttribute('data-video-src'));
            if (src && !video.src) video.src = src;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const card = video.closest('.project-showcase-card');
                    const isActive = card && card.classList.contains('active');
                    if (entry.isIntersecting && isActive) {
                        video.play().catch(() => {});
                    } else {
                        video.pause();
                    }
                });
            }, { threshold: 0.25 });

            observer.observe(video);
        });
    };

    /**
     * Initialize Project Modal Lightbox for previews and case studies
     */
    const initProjectLightbox = () => {
        const triggers = document.querySelectorAll('[data-project-expand]');
        const lightbox = document.getElementById('project-lightbox');
        if (!lightbox) return;

        const closeTriggers = lightbox.querySelectorAll('[data-lightbox-close]');
        const titleEl = document.getElementById('project-lightbox-title');
        const kickerEl = document.getElementById('project-lightbox-kicker');
        const linkEl = document.getElementById('project-lightbox-link');
        const bodyEl = document.getElementById('project-lightbox-body');

        triggers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = btn.closest('.project-showcase-card');
                if (!card) return;

                // If user clicks preview button on a side card, bring it to center first!
                if (!card.classList.contains('active')) {
                    return; // Card click listener handles transition to center
                }

                e.stopPropagation();

                const title = card.dataset.projectTitle || '';
                const kicker = card.dataset.projectKicker || '';
                const url = card.dataset.projectUrl || '#';

                if (titleEl) titleEl.textContent = title;
                if (kickerEl) kickerEl.textContent = kicker;
                if (linkEl) {
                    linkEl.href = url;
                    linkEl.style.display = (url && url !== '#') ? 'inline-flex' : 'none';
                }

                if (bodyEl) {
                    bodyEl.innerHTML = '';
                    const vid = card.querySelector('.project-preview-video');
                    if (vid) {
                        const v = document.createElement('video');
                        v.src = vid.src || vid.dataset.videoSrc;
                        v.controls = true;
                        v.autoplay = true;
                        v.playsInline = true;
                        v.style.width = '100%';
                        v.style.maxHeight = '75vh';
                        v.style.borderRadius = '12px';
                        bodyEl.appendChild(v);
                    } else {
                        const desc = card.querySelector('.project-showcase-desc')?.textContent || '';
                        bodyEl.innerHTML = `
                            <div style="padding:32px 20px;text-align:center;color:var(--text-secondary);font-size:16px;line-height:1.75;max-width:700px;margin:0 auto;">
                                <p>${desc}</p>
                            </div>
                        `;
                    }
                }

                lightbox.classList.add('open');
                lightbox.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (bodyEl) {
                const v = bodyEl.querySelector('video');
                if (v) v.pause();
                bodyEl.innerHTML = '';
            }
        };

        closeTriggers.forEach(c => c.addEventListener('click', closeLightbox));

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('open')) {
                closeLightbox();
            }
        });
    };

    const escapeHTML = (str) => {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag));
    };

    return {
        init,
        loadDynamicProjects,
        goToSlide,
        updateCarousel
    };
})();
