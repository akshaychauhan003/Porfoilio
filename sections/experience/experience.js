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
            if (!window.PortfolioData) return;
            const experiences = await window.PortfolioData.getExperiences();
            renderTimeline(experiences || []);
        } catch (err) {
            console.warn('Error loading experiences:', err);
        }
    };

    /**
     * Listen for storage updates and tab focus to instantly reflect dashboard additions
     */
    const initDashboardSync = () => {
        // Cross-tab localStorage updates
        window.addEventListener('storage', (e) => {
            if (e.key === 'portfolio_experiences') {
                loadDynamicExperiences();
            }
        });

        // In-page custom event dispatched by dashboard
        window.addEventListener('portfolio-experience-saved', () => {
            loadDynamicExperiences();
        });

        // When switching back to the portfolio tab from dashboard
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                loadDynamicExperiences();
            }
        });
    };

    const renderTimeline = (experiences) => {
        const officeTrack = document.getElementById('experience-track-office') || document.getElementById('experience-track');
        const freelanceTrack = document.getElementById('experience-track-freelance');
        if (!experiences || !experiences.length) return;

        // Ensure chronological order
        const sorted = [...experiences].sort((a, b) => {
            const orderA = a.order_index != null ? Number(a.order_index) : 999;
            const orderB = b.order_index != null ? Number(b.order_index) : 999;
            return orderA - orderB;
        });

        const isFreelanceExp = (exp) => {
            const role = (exp.role || '').toLowerCase();
            const company = (exp.company || '').toLowerCase();
            return company.includes('travoqix') || company.includes('krisha') || role.includes('freelance') || exp.type === 'freelance';
        };

        const officeExps = sorted.filter(e => !isFreelanceExp(e));
        const freelanceExps = sorted.filter(e => isFreelanceExp(e));

        // 1. Render In-Office Track (Details only, No Video)
        if (officeTrack && officeExps.length > 0) {
            officeTrack.innerHTML = officeExps.map(exp => `
                <article class="experience-card-horizontal experience-node" role="button" tabindex="0" aria-expanded="false" aria-label="Toggle details for ${escapeHTML(exp.role)} at ${escapeHTML(exp.company)}">
                    <div class="exp-top-bar">
                        <span class="exp-dot"></span>
                        <span class="exp-duration">${escapeHTML(exp.duration)}</span>
                    </div>
                    <h3 class="exp-role">${escapeHTML(exp.role)}</h3>
                    <div class="exp-company">${escapeHTML(exp.company)}${exp.location ? ' · ' + escapeHTML(exp.location) : ''}</div>
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
            `).join('');
            officeTrack.scrollLeft = 0;
        }

        // 2. Render Freelance Track (With Video Showcase on Travoqix)
        if (freelanceTrack && freelanceExps.length > 0) {
            freelanceTrack.innerHTML = freelanceExps.map(exp => {
                const isTravoqix = (exp.company || '').toLowerCase().includes('travoqix');
                const videoSrc = exp.video_url || (isTravoqix ? 'assets/videos/Travoqix.mp4' : '');
                const liveUrl = exp.live_url || (isTravoqix ? 'https://travoqix.in/' : '');
                const techList = isTravoqix ? ['React', 'TypeScript', 'Node.js', 'REST APIs', 'Vercel'] : ['Electron', 'React', 'Node.js', 'Financial APIs', 'SQLite'];

                return `
                    <article class="freelance-card ${isTravoqix ? 'freelance-featured-card' : ''}">
                        ${videoSrc ? `
                            <div class="freelance-video-wrapper">
                                <div class="freelance-video-chrome">
                                    <span></span><span></span><span></span>
                                    <span class="freelance-video-tag">Live Motion Showcase</span>
                                </div>
                                <video class="freelance-video-player" muted loop playsinline controls preload="metadata" src="${videoSrc}"></video>
                            </div>
                        ` : ''}
                        <div class="freelance-card-content">
                            <div class="exp-top-bar">
                                <span class="exp-dot freelance-dot"></span>
                                <span class="exp-duration">${escapeHTML(exp.duration)}</span>
                                <span class="freelance-badge">Client Project</span>
                            </div>
                            <h3 class="exp-role">${escapeHTML(exp.role)}</h3>
                            <div class="exp-company">
                                <span>${escapeHTML(exp.company)}${exp.location ? ' · ' + escapeHTML(exp.location) : ''}</span>
                                ${liveUrl ? `
                                    <a href="${liveUrl}" target="_blank" rel="noopener noreferrer" class="freelance-live-link">
                                        Visit Live Site ↗
                                    </a>
                                ` : ''}
                            </div>
                            <p class="exp-desc">${escapeHTML(exp.description)}</p>
                            <div class="freelance-tech-tags">
                                ${techList.map(t => `<span>${t}</span>`).join('')}
                            </div>
                        </div>
                    </article>
                `;
            }).join('');
        }
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
