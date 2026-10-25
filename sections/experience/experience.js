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
        const track = document.getElementById('experience-track');
        if (!track || !experiences.length) return;

        // Ensure chronological order from oldest to latest (order_index 1..N)
        const sorted = [...experiences].sort((a, b) => {
            const orderA = a.order_index != null ? Number(a.order_index) : 999;
            const orderB = b.order_index != null ? Number(b.order_index) : 999;
            return orderA - orderB;
        });

        track.innerHTML = sorted.map(exp => `
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

        track.scrollLeft = 0;
    };

    /**
     * Click-to-Expand Interaction
     * Click on any card or toggle pill to reveal detailed description
     */
    const initCardToggle = () => {
        const track = document.getElementById('experience-track');
        if (!track) return;

        // Click handler with drag protection & debounce
        track.addEventListener('click', (e) => {
            // Debounce rapid multi-clicks
            const now = Date.now();
            if (now - lastClickTime < 90) return;

            // Do not toggle if clicking or selecting text inside the description
            if (e.target.closest('.exp-desc')) {
                return;
            }

            const pill = e.target.closest('.exp-toggle-pill');
            const card = e.target.closest('.experience-card-horizontal');
            if (!card) return;

            // Clicking the toggle button ALWAYS works; clicking card body works unless actively dragging
            if (!pill && hasDraggedRecently) {
                return;
            }

            lastClickTime = now;
            toggleCard(card);
        });

        // Keyboard accessibility (Enter / Space)
        track.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const card = e.target.closest('.experience-card-horizontal');
                if (card) {
                    e.preventDefault();
                    toggleCard(card);
                }
            }
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
        const prevBtn = document.getElementById('exp-prev-btn');
        const nextBtn = document.getElementById('exp-next-btn');
        const track = document.getElementById('experience-track');

        if (prevBtn && track) {
            prevBtn.addEventListener('click', () => {
                track.scrollBy({ left: -368, behavior: 'smooth' });
            });
        }

        if (nextBtn && track) {
            nextBtn.addEventListener('click', () => {
                track.scrollBy({ left: 368, behavior: 'smooth' });
            });
        }
    };

    /**
     * Mouse Drag-to-Scroll Support on Desktop
     */
    const initDragScroll = () => {
        const track = document.getElementById('experience-track');
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
