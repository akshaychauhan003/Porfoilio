/* ═══════════════════════════════════════════════════════════
   ARCHITECT SECTION - CONTROLLER
   Hero Interactivity & Stat Count-Up Animations
   ═══════════════════════════════════════════════════════════ */
window.ArchitectSystem = (() => {
    const init = () => {
        initCounters();
        initMagneticButtons();
    };

    const initCounters = () => {
        const counters = document.querySelectorAll('.count-up');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.target, 10);
                    const suffix = el.dataset.suffix || '';
                    const prefix = el.dataset.prefix || '';
                    let current = 0;
                    const step = Math.max(1, Math.ceil(target / 40));
                    const timer = setInterval(() => {
                        current = Math.min(current + step, target);
                        el.textContent = prefix + current + suffix;
                        if (current >= target) clearInterval(timer);
                    }, 35);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(c => observer.observe(c));
    };

    const initMagneticButtons = () => {
        const btns = document.querySelectorAll('.hero-section .magnetic, #h-ctas .magnetic');
        btns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    };

    return {
        init
    };
})();
