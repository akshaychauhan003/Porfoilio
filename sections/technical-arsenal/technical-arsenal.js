/* ═══════════════════════════════════════════════════════════
   TECHNICAL ARSENAL (SKILLS) - CONTROLLER
   3D Tilt Cards, Mouse Follow Light, & Rings
   ═══════════════════════════════════════════════════════════ */
window.TechnicalArsenalSystem = (() => {
    const init = () => {
        initTiltCards();
        initSkillRings();
        initSkillCardMouseLight();
    };

    const initTiltCards = () => {
        const cards = document.querySelectorAll('#skills .skill-card, .tilt-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const rotX = ((y - cy) / cy) * -9;
                const rotY = ((x - cx) / cx) * 9;
                card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;

                const shine = card.querySelector('.tilt-shine');
                if (shine) {
                    shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.18), transparent 70%)`;
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                const shine = card.querySelector('.tilt-shine');
                if (shine) shine.style.background = '';
            });
        });
    };

    const initSkillRings = () => {
        const rings = document.querySelectorAll('.skill-ring-fill');
        if (!rings.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const ring = entry.target;
                    const pct = ring.dataset.percent || 85;
                    const circumference = 2 * Math.PI * 18;
                    const offset = circumference - (pct / 100) * circumference;
                    ring.style.strokeDashoffset = offset;
                    observer.unobserve(ring);
                }
            });
        }, { threshold: 0.3 });

        rings.forEach(r => observer.observe(r));
    };

    const initSkillCardMouseLight = () => {
        const cards = document.querySelectorAll('#skills .skill-card');
        cards.forEach(card => {
            let rect = null;
            card.addEventListener('mouseenter', () => { rect = card.getBoundingClientRect(); }, { passive: true });
            card.addEventListener('mousemove', (e) => {
                if (!rect) rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', x + 'px');
                card.style.setProperty('--mouse-y', y + 'px');
            }, { passive: true });
        });
    };

    return {
        init
    };
})();
