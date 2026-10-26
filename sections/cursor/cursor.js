/* ═══════════════════════════════════════════════════════════
   CURSOR SECTION - CONTROLLER
   Dual-mode: Ghost cinematic cursor & Real responsive mouse
   ═══════════════════════════════════════════════════════════ */
window.CursorSystem = (() => {
    let dot, ring;
    let ringX = window.innerWidth / 2, ringY = window.innerHeight / 2;
    let dotX = window.innerWidth / 2, dotY = window.innerHeight / 2;
    let animId = null;

    const lerp = (a, b, t) => a + (b - a) * t;

    const init = () => {
        dot = document.getElementById('cursor-dot');
        ring = document.getElementById('cursor-ring');
        if (!dot || !ring) return;

        ringX = window.innerWidth / 2;
        ringY = window.innerHeight / 2;
        dotX = window.innerWidth / 2;
        dotY = window.innerHeight / 2;

        // Real mouse tracking (only outside ghost mode)
        document.addEventListener('mousemove', (e) => {
            if (!window.AppState.ghostMode) {
                dotX = e.clientX;
                dotY = e.clientY;
                // Instant 0ms response on dot position
                if (dot) {
                    dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
                }
                // Show real cursor once portfolio is active
                if (window.AppState.introPlayed || window.AppState.introDone) {
                    dot.classList.add('active');
                    ring.classList.add('active');
                }
            }
        }, { passive: true });

        const loop = () => {
            const sx = window.AppState.ghostMode ? window.AppState.ghostX : dotX;
            const sy = window.AppState.ghostMode ? window.AppState.ghostY : dotY;

            // In ghost mode, update dot through loop
            if (window.AppState.ghostMode && dot) {
                dot.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -50%)`;
            }

            // Ring tracks with buttery smooth, crisp ease (0.32 for instant response)
            const ringEase = window.AppState.ghostMode ? 0.16 : 0.32;
            ringX = lerp(ringX, sx, ringEase);
            ringY = lerp(ringY, sy, ringEase);

            if (ring) {
                ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
            }

            animId = requestAnimationFrame(loop);
        };
        loop();

        // Interactive element hover
        const clickables = 'a, button, input, select, textarea, .p-card, .s-dot, .filter-chip, [data-tilt], [data-lightbox-close], .project-preview-btn, [role="button"], [tabindex]';
        document.addEventListener('mouseover', (e) => {
            if (!window.AppState.ghostMode && e.target.closest(clickables)) {
                document.body.classList.add('cursor-hover');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (!window.AppState.ghostMode && e.target.closest(clickables)) {
                document.body.classList.remove('cursor-hover');
            }
        });

        document.addEventListener('mousedown', () => {
            if (!window.AppState.ghostMode) document.body.classList.add('cursor-click');
        });
        document.addEventListener('mouseup', () => {
            if (!window.AppState.ghostMode) document.body.classList.remove('cursor-click');
        });
    };

    const setGhostMode = (val) => {
        window.AppState.ghostMode = val;
    };

    const setGhostPos = (x, y) => {
        window.AppState.ghostX = x;
        window.AppState.ghostY = y;
        if (dot) {
            dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        }
    };

    return {
        init,
        setGhostMode,
        setGhostPos
    };
})();
