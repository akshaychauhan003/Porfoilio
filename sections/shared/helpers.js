/* ═══════════════════════════════════════════════════════════
   GLOBAL APPLICATION STATE
   ═══════════════════════════════════════════════════════════ */
window.AppState = window.AppState || {
    introPlayed: false,
    introSkipped: false,
    introDone: false,
    theme: localStorage.getItem('as-theme') || 'dark',
    cartCount: 0,
    mobileActive: false,
    isMobile: window.innerWidth < 768,
    threeScene: null,
    ghostMode: false,
    ghostX: typeof window !== 'undefined' ? window.innerWidth * 0.15 : 100,
    ghostY: typeof window !== 'undefined' ? window.innerHeight * 0.18 : 100
};

window.AppHelpers = {
    lerp: (a, b, t) => a + (b - a) * t,
    clamp: (val, min, max) => Math.min(Math.max(val, min), max),
    throttle: (fn, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    debounce: (fn, delay) => {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }
};
