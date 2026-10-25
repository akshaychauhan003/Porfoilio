/* ═══════════════════════════════════════════════════════════
   HEADER SECTION - CONTROLLER
   Navbar, Scroll Progress, & Section Dots
   ═══════════════════════════════════════════════════════════ */
window.HeaderSystem = (() => {
    const init = () => {
        initScrollProgress();
        initNavScroll();
    };

    const initScrollProgress = () => {
        const fill = document.getElementById('scroll-progress-fill');
        const dots = document.getElementById('section-dots');
        const sections = ['hero', 'about', 'skills', 'projects', 'experience', 'credentials', 'reviews', 'contact'];

        const updateProgress = () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = maxScroll > 0 ? (window.pageYOffset / maxScroll) * 100 : 0;
            if (fill) fill.style.width = scrollPercent + '%';

            // Active dot
            const scrollPos = window.pageYOffset + window.innerHeight / 3;
            sections.forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                const dot = dots ? dots.querySelector(`[data-target="${id}"]`) : null;
                const top = el.offsetTop;
                const height = el.offsetHeight;
                if (scrollPos >= top && scrollPos < top + height) {
                    if (dot) dot.classList.add('active');
                } else {
                    if (dot) dot.classList.remove('active');
                }
            });
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    };

    const initNavScroll = () => {
        const nav = document.getElementById('port-nav');
        if (!nav) return;
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 80) nav.classList.add('scrolled');
            else nav.classList.remove('scrolled');
        }, { passive: true });
    };

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return {
        init,
        scrollToSection
    };
})();
