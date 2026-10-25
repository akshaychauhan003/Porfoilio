/* ═══════════════════════════════════════════════════════════
   GLOW EFFECTS - MOUSE-TRACKING AMBIENT GLOW
   ═══════════════════════════════════════════════════════════ */
window.GlowEffects = (() => {
    const init = () => {
        document.querySelectorAll('.ambient-section').forEach(sec => {
            sec.addEventListener('mousemove', (e) => {
                const rect = sec.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                sec.style.setProperty('--ax', x + '%');
                sec.style.setProperty('--ay', y + '%');
            });
        });
    };

    return {
        init
    };
})();
