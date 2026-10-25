/* ═══════════════════════════════════════════════════════════
   PROJECT PORTFOLIO - CONTROLLER
   3D 3-Card Continuous Flow Carousel, Interactive Positioning,
   Video Autoplay & Modal Lightbox
   ═══════════════════════════════════════════════════════════ */
window.ProjectPortfolioSystem = (() => {
    'use strict';

    let currentSlide = 0;
    let isInitialized = false;
    const oldOffsets = new Map();
    let isTransitioning = false;
    let resizeTimer = null;

    const init = async () => {
        if (isInitialized) return;
        isInitialized = true;
        await loadDynamicProjects();
        initProjectShowcase();
        setupProjectVideos();
        initProjectLightbox();
    };

    /**
     * Load & Render Projects dynamically from Supabase Data Provider
     * If dynamic projects exist (>= 3), render them; otherwise fallback to HTML markup
     */
    const loadDynamicProjects = async () => {
        try {
            if (!window.PortfolioData) return;
            const projects = await window.PortfolioData.getProjects();
            if (projects && projects.length >= 3) {
                renderProjectCards(projects);
            }
        } catch (err) {
            console.warn('Using markup fallback for projects:', err);
        }
    };

    const getCardColorStyle = (colorStr) => {
        if (!colorStr) return '';
        const trimmed = colorStr.trim();
        let primary = trimmed;
        if (trimmed.startsWith('linear-gradient') || trimmed.startsWith('radial-gradient')) {
            const match = trimmed.match(/#(?:[0-9a-fA-F]{3}){1,2}|rgba?\([^)]+\)/);
            primary = match ? match[0] : '#3d8bff';
        }
        return `style="--project-accent: ${primary}; --project-card-border: ${primary}; --project-card-glow: ${primary}44; --project-accent-border: ${primary}88; --project-accent-bg: ${primary}22;"`;
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
     * Initialize 3D 3-Card Carousel with smooth transitions and click-to-center
     */
    const initProjectShowcase = () => {
        const stage = document.getElementById('projects-stage');
        const showcase = document.getElementById('projects-showcase');
        if (!stage || !showcase) return;

        const prevBtn = document.querySelector('[data-carousel-action="prev"]');
        const nextBtn = document.querySelector('[data-carousel-action="next"]');

        const updateCarousel = (instant = false) => {
            const cards = Array.from(stage.querySelectorAll('.project-showcase-card'));
            const N = cards.length;
            if (N === 0) return;

            const showcaseWidth = showcase.getBoundingClientRect().width || window.innerWidth;
            const isMobile = showcaseWidth < 680;
            const isTablet = showcaseWidth >= 680 && showcaseWidth < 980;

            // Geometry specs:
            // 1st Card: 45% view on screen, low opacity (0.42), slightly smaller
            // 2nd Card (Main Center): 100% view on screen, 100% opacity, complete size
            // 3rd Card: 45% view on screen, low opacity (0.42), slightly smaller
            const sideScale = isMobile ? 0.88 : 0.86;
            const sidePeek = isMobile ? 0.28 : 0.45; // 45% visible on desktop/tablet

            const minGap = isMobile ? 12 : 24;
            const maxCw = isMobile ? 380 : (isTablet ? 640 : 820);
            const calculatedCw = (showcaseWidth - minGap * 2) / (1 + 2 * sidePeek * sideScale);
            const cardWidth = Math.min(maxCw, Math.max(280, Math.round(calculatedCw)));
            const scaledSideWidth = cardWidth * sideScale;

            // Shift distance from center to side card center
            const shiftX = Math.round((showcaseWidth / 2) + (0.5 - sidePeek) * scaledSideWidth);
            const farShiftX = Math.round(shiftX + cardWidth * 0.7);

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
                    // Center Card: 100% view on screen, 100% opacity, complete size
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
                    // 1st Card (Prev): 45% view on screen, low opacity, slightly smaller
                    card.classList.add('prev');
                    card.style.transform = `translate3d(${-shiftX}px, 0, 0) scale(${sideScale})`;
                    card.style.opacity = '0.42';
                    card.style.zIndex = '5';
                    card.style.filter = 'brightness(0.85)';
                    card.style.pointerEvents = 'auto';
                    card.setAttribute('aria-hidden', 'true');

                    const vid = card.querySelector('.project-preview-video');
                    if (vid) vid.pause();
                } else if (offset === 1) {
                    // 3rd Card (Next): 45% view on screen, low opacity, slightly smaller
                    card.classList.add('next');
                    card.style.transform = `translate3d(${shiftX}px, 0, 0) scale(${sideScale})`;
                    card.style.opacity = '0.42';
                    card.style.zIndex = '5';
                    card.style.filter = 'brightness(0.85)';
                    card.style.pointerEvents = 'auto';
                    card.setAttribute('aria-hidden', 'true');

                    const vid = card.querySelector('.project-preview-video');
                    if (vid) vid.pause();
                } else if (offset < -1) {
                    // Hidden Cards (Left side)
                    card.classList.add('hidden-left');
                    card.style.transform = `translate3d(${-farShiftX}px, 0, 0) scale(0.7)`;
                    card.style.opacity = '0';
                    card.style.zIndex = '1';
                    card.style.filter = 'brightness(0.7)';
                    card.style.pointerEvents = 'none';
                    card.setAttribute('aria-hidden', 'true');

                    const vid = card.querySelector('.project-preview-video');
                    if (vid) vid.pause();
                } else {
                    // Hidden Cards (Right side)
                    card.classList.add('hidden-right');
                    card.style.transform = `translate3d(${farShiftX}px, 0, 0) scale(0.7)`;
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

            // Adjust stage height to fit active card
            if (activeCard && activeCard.offsetHeight > 0) {
                stage.style.height = `${activeCard.offsetHeight}px`;
            }

            // Sync pagination indicator
            updatePagination(N);
        };

        const goToSlide = (targetIndex, instant = false) => {
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

        // Click-on-Side-Card handler:
        // Clicking 1st card (prev) or 3rd card (next) smoothly changes position to center
        stage.addEventListener('click', (e) => {
            const card = e.target.closest('.project-showcase-card');
            if (!card) return;

            if (card.classList.contains('prev')) {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(currentSlide - 1);
            } else if (card.classList.contains('next')) {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(currentSlide + 1);
            }
        });

        // Keyboard Arrow Navigation
        window.addEventListener('keydown', (e) => {
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

        // Responsive Resize Handler
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                updateCarousel(true);
            }, 80);
        });

        // Initial Carousel Layout: position instantly at slide 0
        goToSlide(0, true);
        requestAnimationFrame(() => {
            const cards = stage.querySelectorAll('.project-showcase-card');
            cards.forEach(c => c.classList.remove('teleport'));
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
        loadDynamicProjects
    };
})();
