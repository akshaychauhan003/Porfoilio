/* ═══════════════════════════════════════════════════════════
   SCROLL ENGINE - INTERSECTION OBSERVER REVEAL LOGIC
   ═══════════════════════════════════════════════════════════ */
window.ScrollEngine = (() => {
    let observer = null;

    const init = () => {
        if (!observer) {
            observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });
        }

        const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        reveals.forEach(r => observer.observe(r));
    };

    const observe = (targets) => {
        if (!observer) init();
        if (!targets) return;
        if (targets.nodeType) {
            observer.observe(targets);
        } else if (targets.forEach) {
            targets.forEach(t => observer.observe(t));
        }
    };

    return {
        init,
        observe
    };
})();
