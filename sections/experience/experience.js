/* ═══════════════════════════════════════════════════════════
   EXPERIENCE SECTION - CONTROLLER
   Dynamic Horizontal Timeline Engine & Navigation
   ═══════════════════════════════════════════════════════════ */
window.ExperienceSystem = (() => {
    'use strict';

    let isInitialized = false;
    let hasDraggedRecently = false;
    let dragResetTimer = null;
    let lastClickTime = 0;

    let cachedFreelanceExps = [];
    let cachedReviews = [];

    const init = () => {
        // Prevent duplicate initialization and duplicate event listeners
        if (isInitialized) {
            loadDynamicExperiences();
            return;
        }
        isInitialized = true;

        loadDynamicExperiences();
        initControls();
        initDragScroll();
        initCardToggle();
        initDashboardSync();

        const track = document.getElementById('experience-track');
        if (track) {
            track.scrollLeft = 0;
        }
    };

    /**
     * Load & Render Experiences from Supabase Data Provider
     * Dynamically updates whenever a new role is added in the Admin Dashboard!
     */
    const loadDynamicExperiences = async () => {
        try {
            let experiences = [];
            if (window.PortfolioData && typeof window.PortfolioData.getExperiences === 'function') {
                experiences = await window.PortfolioData.getExperiences();
            }
            if ((!experiences || !experiences.length) && typeof DEFAULT_FALLBACK_DATA !== 'undefined' && DEFAULT_FALLBACK_DATA.experiences) {
                experiences = DEFAULT_FALLBACK_DATA.experiences;
            }
            let approvedReviews = [];
            try {
                if (window.PortfolioData && typeof window.PortfolioData.getApprovedReviews === 'function') {
                    approvedReviews = (await window.PortfolioData.getApprovedReviews()) || [];
                }
            } catch (_) {}
            if ((!approvedReviews || !approvedReviews.length) && typeof DEFAULT_FALLBACK_DATA !== 'undefined' && DEFAULT_FALLBACK_DATA.reviews) {
                approvedReviews = DEFAULT_FALLBACK_DATA.reviews;
            }
            cachedReviews = approvedReviews;
            renderTimeline(experiences || [], approvedReviews);
        } catch (err) {
            console.warn('Error loading experiences:', err);
            if (typeof DEFAULT_FALLBACK_DATA !== 'undefined' && DEFAULT_FALLBACK_DATA.experiences) {
                renderTimeline(DEFAULT_FALLBACK_DATA.experiences, DEFAULT_FALLBACK_DATA.reviews || []);
            }
        }
    };

    /**
     * Listen for storage updates, tab focus, and BroadcastChannel to instantly reflect dashboard additions
     */
    const initDashboardSync = () => {
        // Cross-tab localStorage updates
        window.addEventListener('storage', (e) => {
            if (e.key === 'portfolio_experiences' || e.key === 'portfolio_reviews') {
                loadDynamicExperiences();
            }
        });

        // In-page custom events dispatched by dashboard
        window.addEventListener('portfolio-experience-saved', () => {
            loadDynamicExperiences();
        });
        window.addEventListener('portfolio-review-saved', () => {
            loadDynamicExperiences();
        });

        // High-speed BroadcastChannel sync across all open tabs
        try {
            if (typeof BroadcastChannel !== 'undefined') {
                const bc = new BroadcastChannel('portfolio_sync');
                bc.onmessage = (msg) => {
                    const t = msg?.data?.type;
                    if (
                        t === 'experience-saved' || t === 'experience-deleted' || t === 'experience-reordered' ||
                        t === 'review-saved' || t === 'review-deleted'
                    ) {
                        loadDynamicExperiences();
                    }
                };
            }
        } catch (_) {}

        // When switching back to the portfolio tab from dashboard
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                loadDynamicExperiences();
            }
        });

        // Tab focus sync
        window.addEventListener('focus', () => {
            loadDynamicExperiences();
        });
    };

    const getCleanLocation = (loc) => {
        if (!loc) return '';
        return String(loc).replace(/\s*\[(freelance|office)\]\s*/gi, '').trim();
    };

    /**
     * Metadata Normalizer: Extracts real DB attributes and synthesizes rich metrics
     */
    const getFreelanceItemMeta = (exp, reviews = []) => {
        const comp = (exp.company || '').toLowerCase();
        const isTravoqix = comp.includes('travoqix');
        const isKrisha = comp.includes('krisha');

        const videoSrc = exp.video_url || (isTravoqix ? 'assets/videos/Travoqix.mp4' : '');
        const liveUrl = exp.live_url || (isTravoqix ? 'https://travoqix.in/' : '');
        const domain = isTravoqix ? 'travoqix.in' : (isKrisha ? 'krishaevents.com' : 'client-portal.app');

        // Monogram (e.g. TX, KE)
        const words = (exp.company || 'Contract').split(/\s+/).filter(Boolean);
        const monogram = words.length >= 2 
            ? (words[0][0] + words[1][0]).toUpperCase()
            : (exp.company || 'CO').slice(0, 2).toUpperCase();

        // Dynamic tech stack tags
        let techList = [];
        if (isTravoqix) {
            techList = ['React 19', 'TypeScript', 'Node.js', 'REST APIs', 'Vercel Edge'];
        } else if (isKrisha) {
            techList = ['Electron Architecture', 'React', 'Financial Logic', 'SQLite Engine', 'Cross-Platform'];
        } else {
            const desc = (exp.description || '').toLowerCase();
            if (desc.includes('python')) techList.push('Python');
            if (desc.includes('react')) techList.push('React');
            if (desc.includes('api')) techList.push('REST APIs');
            if (desc.includes('sql') || desc.includes('database')) techList.push('SQL/Database');
            if (desc.includes('full stack') || desc.includes('frontend')) techList.push('Production Architecture');
            if (!techList.length) techList = ['Production Engineering', 'System Architecture', 'High Scalability', 'Client Delivery'];
        }

        // Dynamic delivery metrics
        let metrics = [];
        if (isTravoqix) {
            metrics = [
                { label: 'Turnaround', value: '2 Weeks' },
                { label: 'Client Trust', value: '5.0 ★' },
                { label: 'Deployment', value: 'Live Prod' }
            ];
        } else if (isKrisha) {
            metrics = [
                { label: 'Architecture', value: 'Desktop + Mobile' },
                { label: 'Database', value: 'Offline SQLite' },
                { label: 'Platform Scope', value: 'Finance & ERP' }
            ];
        } else {
            metrics = [
                { label: 'Delivery Pace', value: 'High Velocity' },
                { label: 'Quality SLA', value: 'Production' },
                { label: 'Engagement', value: 'Independent' }
            ];
        }

        // Matching verified review quote from database
        let quote = null;
        if (reviews && reviews.length > 0) {
            const matchedRev = reviews.find(r => 
                (r.client_company && r.client_company.toLowerCase().includes(comp)) ||
                (comp.includes((r.client_company || '').toLowerCase()) && r.client_company)
            );
            if (matchedRev) {
                quote = {
                    text: matchedRev.review_text,
                    author: `${matchedRev.client_name || 'Client'} · ${matchedRev.client_title || 'Executive'}, ${matchedRev.client_company || exp.company}`
                };
            }
        }
        if (!quote && isTravoqix) {
            quote = {
                text: 'The website turned out far better and more beautiful than we expected. Completed in just 2 weeks while expected timeline was 30 days.',
                author: 'Mr. Satyajit Nanda · CEO, Travoqix'
            };
        } else if (!quote && isKrisha) {
            quote = {
                text: 'Architected unified cross-platform event & finance management application with centralized budget tracking and offline SQLite durability.',
                author: 'Executive Leadership · Krisha Events'
            };
        }

        return {
            company: exp.company || 'Enterprise Client',
            role: exp.role || 'Contract Engineer',
            duration: exp.duration || 'Contract',
            location: getCleanLocation(exp.location),
            description: exp.description || '',
            videoSrc,
            liveUrl,
            domain,
            monogram,
            techList,
            metrics,
            quote,
            isTravoqix,
            isKrisha
        };
    };

    /**
     * Render the whole timeline: office + freelance Split-Stage Dossier
     */
    const renderTimeline = (experiences, reviews = []) => {
        const officeTrack = document.getElementById('experience-track-office') || document.getElementById('experience-track');
        if (!experiences || !experiences.length) {
            if (officeTrack) officeTrack.innerHTML = `<p class="exp-empty" style="color:var(--text-muted, #888);padding:24px;">No in-office experiences listed.</p>`;
            renderFreelanceEmpty();
            return;
        }

        // Ensure chronological order based on order_index
        const sorted = [...experiences].sort((a, b) => {
            const orderA = a.order_index != null ? Number(a.order_index) : 999;
            const orderB = b.order_index != null ? Number(b.order_index) : 999;
            return orderA - orderB;
        });

        const isFreelanceExp = (exp) => {
            if (exp.category === 'freelance' || exp.type === 'freelance') return true;
            if (exp.category === 'office' || exp.type === 'office') return false;
            const rawLoc = String(exp.location || '').toLowerCase();
            if (rawLoc.includes('[freelance]')) return true;
            if (rawLoc.includes('[office]')) return false;
            const role = (exp.role || '').toLowerCase();
            const company = (exp.company || '').toLowerCase();
            return role.includes('freelance') || company.includes('travoqix') || company.includes('krisha events');
        };

        let officeExps = sorted.filter(e => !isFreelanceExp(e));
        let freelanceExps = sorted.filter(e => isFreelanceExp(e));

        if (!officeExps.length && typeof DEFAULT_FALLBACK_DATA !== 'undefined' && DEFAULT_FALLBACK_DATA.experiences) {
            officeExps = DEFAULT_FALLBACK_DATA.experiences.filter(e => !isFreelanceExp(e));
        }
        if (!freelanceExps.length && typeof DEFAULT_FALLBACK_DATA !== 'undefined' && DEFAULT_FALLBACK_DATA.experiences) {
            freelanceExps = DEFAULT_FALLBACK_DATA.experiences.filter(e => isFreelanceExp(e));
        }

        cachedFreelanceExps = freelanceExps;

        // 1. Render In-Office Track (Details only, No Video)
        if (officeTrack) {
            if (officeExps.length > 0) {
                officeTrack.innerHTML = officeExps.map(exp => {
                    const loc = getCleanLocation(exp.location);
                    return `
                        <article class="experience-card-horizontal experience-node" role="button" tabindex="0" aria-expanded="false" aria-label="Toggle details for ${escapeHTML(exp.role)} at ${escapeHTML(exp.company)}">
                            <div class="exp-top-bar">
                                <span class="exp-dot"></span>
                                <span class="exp-duration">${escapeHTML(exp.duration)}</span>
                            </div>
                            <h3 class="exp-role">${escapeHTML(exp.role)}</h3>
                            <div class="exp-company">${escapeHTML(exp.company)}${loc ? ' · ' + escapeHTML(loc) : ''}</div>
                            <button type="button" class="exp-toggle-pill" aria-label="Toggle details">
                                <span class="exp-toggle-label">View Details</span>
                                <svg class="exp-toggle-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                            <div class="exp-details-collapse">
                                <p class="exp-desc">${escapeHTML(exp.description)}</p>
                            </div>
                        </article>
                    `;
                }).join('');
                officeTrack.scrollLeft = 0;
            } else {
                officeTrack.innerHTML = `<p class="exp-empty" style="color:var(--text-muted, #888);padding:24px;">No in-office experiences listed.</p>`;
            }
        }

        // 2. Render Freelance Split-Stage Interactive Dossier Live from Database
        if (!freelanceExps.length) {
            renderFreelanceEmpty();
            return;
        }

        const metaItems = freelanceExps.map(exp => getFreelanceItemMeta(exp, reviews));
        renderSplitStageDossier(metaItems);
    };

    const renderFreelanceEmpty = () => {
        const el = document.getElementById('f-dossier-track');
        if (el) {
            el.innerHTML = `<p class="exp-empty" style="color:var(--text-muted, #888);padding:32px;text-align:center;">No freelance engagements currently listed in the database.</p>`;
        }
    };

    /* ─── SPLIT-STAGE INTERACTIVE DOSSIER RENDERER (GREY-SILVER-BLACK LUXURY) ─── */
    let activeDossierIndex = 0;
    const renderSplitStageDossier = (items) => {
        const container = document.getElementById('f-dossier-track');
        if (!container) return;

        if (activeDossierIndex >= items.length) activeDossierIndex = 0;
        const activeItem = items[activeDossierIndex] || items[0];

        container.innerHTML = `
            <div class="f-dossier-nav" role="tablist" aria-label="Freelance Engagements">
                <div class="f-dossier-nav-title">Client Engagements (${items.length})</div>
                ${items.map((item, idx) => `
                    <button type="button" class="f-dossier-tab ${idx === activeDossierIndex ? 'active' : ''}" data-dossier-idx="${idx}" role="tab" aria-selected="${idx === activeDossierIndex}">
                        <div class="f-dossier-tab-monogram">${escapeHTML(item.monogram)}</div>
                        <div class="f-dossier-tab-meta">
                            <div class="f-dossier-tab-name">${escapeHTML(item.company)}</div>
                            <div class="f-dossier-tab-role">${escapeHTML(item.role)}</div>
                            <div class="f-dossier-tab-dur">${escapeHTML(item.duration)}</div>
                        </div>
                        <span class="f-dossier-tab-arrow">→</span>
                    </button>
                `).join('')}
            </div>

            <div class="f-dossier-stage-view" id="f-dossier-viewport" role="tabpanel">
                <div class="f-dossier-hero-row">
                    <span class="f-dossier-header-badge">
                        <span class="f-dossier-header-dot"></span>
                        Active Dossier
                    </span>
                    ${activeItem.liveUrl ? `
                        <a href="${activeItem.liveUrl}" target="_blank" rel="noopener noreferrer" class="f-dossier-live-btn">
                            Visit Live Site ↗
                        </a>
                    ` : ''}
                </div>

                <h3 class="f-dossier-title">${escapeHTML(activeItem.role)}</h3>
                <div class="f-dossier-client-line">
                    ${escapeHTML(activeItem.company)}${activeItem.location ? ' · ' + escapeHTML(activeItem.location) : ''} · <em>${escapeHTML(activeItem.duration)}</em>
                </div>

                ${activeItem.videoSrc ? `
                    <div class="f-dossier-media-reel">
                        <div class="f-viewport-chrome">
                            <div class="f-chrome-dots"><span></span><span></span><span></span></div>
                            <div class="f-chrome-address">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/></svg>
                                <span>${escapeHTML(activeItem.domain)}</span>
                            </div>
                            <span class="f-chrome-badge">Live Motion Showcase</span>
                        </div>
                        <video class="f-video-player" muted loop playsinline controls preload="metadata" src="${activeItem.videoSrc}"></video>
                    </div>
                ` : ''}

                <p class="f-glass-desc" style="font-size:15px;">${escapeHTML(activeItem.description)}</p>

                ${activeItem.quote ? `
                    <blockquote class="f-dossier-quote-callout">
                        “${escapeHTML(activeItem.quote.text)}”
                        <div class="f-dossier-quote-author">— ${escapeHTML(activeItem.quote.author)}</div>
                    </blockquote>
                ` : ''}

                <div class="f-metrics-strip" style="margin-top:20px;">
                    ${activeItem.metrics.map(m => `
                        <div class="f-metric-cell">
                            <div class="f-metric-label">${escapeHTML(m.label)}</div>
                            <div class="f-metric-value">${escapeHTML(m.value)}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="f-tech-cloud" style="margin-top:20px;">
                    ${activeItem.techList.map(t => `<span>${escapeHTML(t)}</span>`).join('')}
                </div>
            </div>
        `;

        // Wire up tab switching in Split-Stage Dossier
        container.querySelectorAll('.f-dossier-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const idx = Number(tab.dataset.dossierIdx);
                if (!isNaN(idx) && idx !== activeDossierIndex) {
                    activeDossierIndex = idx;
                    renderSplitStageDossier(items);
                }
            });
        });
    };

    /**
     * Click-to-Expand Interaction
     * Click on any card or toggle pill to reveal detailed description
     */
    const initCardToggle = () => {
        const containers = [
            document.getElementById('experience-track-office'),
            document.getElementById('experience-track')
        ].filter(Boolean);

        containers.forEach(track => {
            track.addEventListener('click', (e) => {
                const now = Date.now();
                if (now - lastClickTime < 90) return;
                if (e.target.closest('.exp-desc')) return;

                const pill = e.target.closest('.exp-toggle-pill');
                const card = e.target.closest('.experience-card-horizontal');
                if (!card) return;

                if (!pill && hasDraggedRecently) return;

                lastClickTime = now;
                toggleCard(card);
            });

            track.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    const card = e.target.closest('.experience-card-horizontal');
                    if (card) {
                        e.preventDefault();
                        toggleCard(card);
                    }
                }
            });
        });
    };

    const toggleCard = (card, forceState) => {
        if (!card) return;
        const willExpand = typeof forceState === 'boolean' 
            ? forceState 
            : !card.classList.contains('expanded');

        if (willExpand) {
            card.classList.add('expanded');
            card.setAttribute('aria-expanded', 'true');
        } else {
            card.classList.remove('expanded');
            card.setAttribute('aria-expanded', 'false');
        }

        const label = card.querySelector('.exp-toggle-label');
        if (label) {
            label.textContent = willExpand ? 'Hide Details' : 'View Details';
        }
    };

    /**
     * Prev / Next Navigation Buttons
     */
    const initControls = () => {
        const prevBtns = [
            document.getElementById('exp-office-prev'),
            document.getElementById('exp-prev-btn')
        ].filter(Boolean);

        const nextBtns = [
            document.getElementById('exp-office-next'),
            document.getElementById('exp-next-btn')
        ].filter(Boolean);

        const officeTrack = document.getElementById('experience-track-office') || document.getElementById('experience-track');

        prevBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (officeTrack) officeTrack.scrollBy({ left: -368, behavior: 'smooth' });
            });
        });

        nextBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (officeTrack) officeTrack.scrollBy({ left: 368, behavior: 'smooth' });
            });
        });
    };

    /**
     * Mouse Drag-to-Scroll Support on Desktop
     */
    const initDragScroll = () => {
        const track = document.getElementById('experience-track-office') || document.getElementById('experience-track');
        if (!track) return;

        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;
        let totalDragDistance = 0;

        track.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
            totalDragDistance = 0;
            hasDraggedRecently = false;
        });

        track.addEventListener('mouseleave', () => {
            isDown = false;
        });

        track.addEventListener('mouseup', () => {
            isDown = false;
            if (totalDragDistance > 12) {
                hasDraggedRecently = true;
                if (dragResetTimer) clearTimeout(dragResetTimer);
                dragResetTimer = setTimeout(() => {
                    hasDraggedRecently = false;
                }, 120);
            } else {
                hasDraggedRecently = false;
            }
        });

        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX);
            totalDragDistance = Math.abs(walk);
            if (totalDragDistance > 12) {
                e.preventDefault();
                track.scrollLeft = scrollLeft - (walk * 1.5);
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
        loadDynamicExperiences,
        toggleCard
    };
})();
