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

        // Position update helper - 0ms hardware transform
        const updateCursorPosition = (x, y) => {
            const transformStr = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
            if (dot) dot.style.transform = transformStr;
            if (ring) ring.style.transform = transformStr;
        };

        // Real mouse tracking: 100% direct 0ms instant tracking on both dot and ring
        document.addEventListener('mousemove', (e) => {
            dotX = e.clientX;
            dotY = e.clientY;
            if (!window.AppState.ghostMode) {
                updateCursorPosition(dotX, dotY);
                if (window.AppState.introPlayed || window.AppState.introDone) {
                    dot.classList.add('active');
                    ring.classList.add('active');
                }
            }
        }, { passive: true });

        const loop = () => {
            if (window.AppState.ghostMode) {
                const sx = window.AppState.ghostX ?? dotX;
                const sy = window.AppState.ghostY ?? dotY;
                ringX = lerp(ringX, sx, 0.28);
                ringY = lerp(ringY, sy, 0.28);
                if (dot) dot.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -50%)`;
                if (ring) ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
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
        }, { passive: true });
        document.addEventListener('mouseout', (e) => {
            if (!window.AppState.ghostMode && e.target.closest(clickables)) {
                document.body.classList.remove('cursor-hover');
            }
        }, { passive: true });

        document.addEventListener('mousedown', () => {
            if (!window.AppState.ghostMode) document.body.classList.add('cursor-click');
        }, { passive: true });
        document.addEventListener('mouseup', () => {
            if (!window.AppState.ghostMode) document.body.classList.remove('cursor-click');
        }, { passive: true });
    };

    const setGhostMode = (val) => {
        window.AppState.ghostMode = val;
        if (!val && dot && ring) {
            const transformStr = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
            dot.style.transform = transformStr;
            ring.style.transform = transformStr;
            dot.classList.add('active');
            ring.classList.add('active');
        }
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
