/* ╔══════════════════════════════════════════════════════════════╗
   ║  ARCHITECT SECTION - About/Profile Controller             ║
   ╚══════════════════════════════════════════════════════════════╝ */

const ArchitectSystem = (() => {
    let elements = {};
    let observer;

    /**
     * Initialize architect section
     */
    const init = async () => {
        cacheElements();
        setupIntersectionObserver();
        setupEventListeners();
        setupAnimations();

        console.log('✓ Architect system initialized');
    };

    /**
     * Cache DOM elements
     */
    const cacheElements = () => {
        elements.root = document.getElementById('architect-root');
        elements.content = elements.root?.querySelector('.architect-content');
        elements.profile = elements.root?.querySelector('.architect-profile');
        elements.values = elements.root?.querySelectorAll('.value-card');
        elements.tags = elements.root?.querySelectorAll('.tag');
        elements.ctaButtons = elements.root?.querySelectorAll('.cta-primary, .cta-secondary');
    };

    /**
     * Setup intersection observer for reveal
     */
    const setupIntersectionObserver = () => {
        if (!elements.root) return;

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    // Trigger value cards staggered animation
                    animateValueCards();
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '-50px',
        });

        if (elements.content) {
            observer.observe(elements.content);
        }
    };

    /**
     * Animate value cards with stagger
     */
    const animateValueCards = () => {
        if (!elements.values) return;

        elements.values.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
            }, index * 100);
        });
    };

    /**
     * Setup event listeners
     */
    const setupEventListeners = () => {
        // Tag hover effects
        if (elements.tags) {
            elements.tags.forEach(tag => {
                tag.addEventListener('mouseenter', () => {
                    GlowEffects.applyGlow(tag, '#3d8bff', 0.3);
                });

                tag.addEventListener('mouseleave', () => {
                    GlowEffects.removeGlow(tag);
                });
            });
        }

        // CTA button clicks (smooth scroll)
        if (elements.ctaButtons) {
            elements.ctaButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const href = btn.getAttribute('href');
                    if (href?.startsWith('#')) {
                        e.preventDefault();
                        const target = document.querySelector(href);
                        if (target) {
                            Helpers.scrollToElement(target, 80);
                        }
                    }
                });
            });
        }
    };

    /**
     * Setup animations
     */
    const setupAnimations = () => {
        if (!elements.profile) return;

        // Add hover glow to profile image
        const profileImage = elements.profile?.querySelector('.profile-image-wrap');
        if (profileImage) {
            profileImage.addEventListener('mouseenter', () => {
                const glow = profileImage.querySelector('.profile-glow');
                if (glow) {
                    glow.style.boxShadow = `
                        0 0 80px rgba(61, 139, 255, 0.5),
                        inset 0 0 60px rgba(61, 139, 255, 0.15)
                    `;
                }
            });

            profileImage.addEventListener('mouseleave', () => {
                const glow = profileImage.querySelector('.profile-glow');
                if (glow) {
                    glow.style.boxShadow = `
                        0 0 60px rgba(61, 139, 255, 0.3),
                        inset 0 0 40px rgba(61, 139, 255, 0.1)
                    `;
                }
            });
        }
    };

    /**
     * Cleanup
     */
    const destroy = () => {
        if (observer) {
            observer.disconnect();
        }
    };

    return {
        init,
        destroy,
    };
})();

// Export
window.ArchitectSystem = ArchitectSystem;
