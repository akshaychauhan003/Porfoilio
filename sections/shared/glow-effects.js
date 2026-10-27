/* ═══════════════════════════════════════════════════════════
   GLOW EFFECTS - MOUSE-TRACKING AMBIENT GLOW
   ═══════════════════════════════════════════════════════════ */
window.GlowEffects = (() => {
    const init = () => {
        document.querySelectorAll('.ambient-section').forEach(sec => {
            let rect = null;
            let rafId = null;
            const updateRect = () => { rect = sec.getBoundingClientRect(); };
            
            sec.addEventListener('mouseenter', updateRect, { passive: true });
            window.addEventListener('resize', updateRect, { passive: true });

            sec.addEventListener('mousemove', (e) => {
                if (!rect) updateRect();
                if (rafId) return;
                rafId = requestAnimationFrame(() => {
                    rafId = null;
                    if (!rect || rect.width === 0 || rect.height === 0) return;
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    sec.style.setProperty('--ax', x.toFixed(1) + '%');
                    sec.style.setProperty('--ay', y.toFixed(1) + '%');
                });
            }, { passive: true });
        });
    };

    return {
        init
    };
})();
