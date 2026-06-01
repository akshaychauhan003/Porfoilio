/* ╔══════════════════════════════════════════════════════════════╗
   ║  SCROLL ENGINE - Handles scroll-triggered animations       ║
   ╚══════════════════════════════════════════════════════════════╝ */

const ScrollEngine = (() => {
    const observers = new Map();
    const scrollCallbacks = new Map();

    /**
     * Initialize scroll observation for reveal animations
     */
    const initRevealObserver = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                } else {
                    // Optionally remove class if you want re-trigger on scroll
                    // entry.target.classList.remove('reveal-visible');
                }
            });
        }, {
            threshold: [0.1, 0.5],
            rootMargin: '0px 0px -100px 0px',
        });

        // Observe all elements with reveal class
        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach(el => observer.observe(el));
        observers.set('reveal', observer);
    };

    /**
     * Initialize custom scroll listener
     */
    const onScroll = (callback) => {
        const throttled = Helpers.throttle(callback, 16); // ~60fps
        window.addEventListener('scroll', throttled);
        return () => window.removeEventListener('scroll', throttled);
    };

    /**
     * Get scroll position
     */
    const getScrollPosition = () => {
        return window.scrollY || window.pageYOffset;
    };

    /**
     * Get scroll progress (0 to 1)
     */
    const getScrollProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        return docHeight ? scrollTop / docHeight : 0;
    };

    /**
     * Parallax effect
     */
    const createParallax = (element, speed = 0.5) => {
        const unsubscribe = onScroll(() => {
            const scrollPos = getScrollPosition();
            element.style.transform = `translateY(${scrollPos * speed}px)`;
        });
        return unsubscribe;
    };

    /**
     * Staggered reveal on scroll
     */
    const initStaggerReveal = (selector, delay = 100) => {
        const elements = document.querySelectorAll(selector);
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('reveal-visible');
                    }, index * delay);
                }
            });
        }, {
            threshold: 0.1,
        });

        elements.forEach(el => observer.observe(el));
        return observer;
    };

    /**
     * Counter animation on scroll
     */
    const createCounter = (element, target, duration = 2000) => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !element.dataset.counted) {
                    element.dataset.counted = 'true';
                    animateCounter(element, target, duration);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(element);
        return observer;
    };

    /**
     * Animate counter internally
     */
    const animateCounter = (element, target, duration) => {
        const start = 0;
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (target - start) * progress);
            element.textContent = Helpers.formatNumber(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    };

    /**
     * Progress bar animation
     */
    const createProgressBar = (element, trigger = 'scroll') => {
        if (trigger === 'scroll') {
            onScroll(() => {
                const progress = getScrollProgress();
                element.style.width = `${progress * 100}%`;
            });
        }
    };

    /**
     * Fade in/out on scroll
     */
    const createFadeInOut = (element, options = {}) => {
        const {
            fadeInAt = 0.1,
            fadeOutAt = 0.9,
        } = options;

        onScroll(() => {
            const rect = element.getBoundingClientRect();
            const progress = 1 - (rect.top / window.innerHeight);
            const opacity = Math.min(1, Math.max(0, progress));
            element.style.opacity = opacity;
        });
    };

    /**
     * Sticky element on scroll
     */
    const createSticky = (element, options = {}) => {
        const {
            offset = 0,
            onStick = null,
            onUnstick = null,
        } = options;

        let isStuck = false;
        onScroll(() => {
            const rect = element.getBoundingClientRect();
            const shouldStick = rect.top <= offset;

            if (shouldStick && !isStuck) {
                isStuck = true;
                element.classList.add('is-sticky');
                if (onStick) onStick();
            } else if (!shouldStick && isStuck) {
                isStuck = false;
                element.classList.remove('is-sticky');
                if (onUnstick) onUnstick();
            }
        });
    };

    /**
     * Initialize all scroll effects
     */
    const init = () => {
        initRevealObserver();
    };

    /**
     * Destroy all observers
     */
    const destroy = () => {
        observers.forEach(observer => observer.disconnect());
        observers.clear();
        scrollCallbacks.clear();
    };

    return {
        initRevealObserver,
        onScroll,
        getScrollPosition,
        getScrollProgress,
        createParallax,
        initStaggerReveal,
        createCounter,
        createProgressBar,
        createFadeInOut,
        createSticky,
        init,
        destroy,
    };
})();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ScrollEngine.init());
} else {
    ScrollEngine.init();
}
