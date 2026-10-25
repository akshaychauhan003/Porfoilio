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
                // Show real cursor only once portfolio is active
                if (window.AppState.introPlayed || window.AppState.introDone) {
                    dot.classList.add('active');
                    ring.classList.add('active');
                }
            }
        });

        const loop = () => {
            const sx = window.AppState.ghostMode ? window.AppState.ghostX : dotX;
            const sy = window.AppState.ghostMode ? window.AppState.ghostY : dotY;

            // Dot position (when not ghost mode, dot follows mouse directly)
            if (!window.AppState.ghostMode && dot) {
                dot.style.left = sx + 'px';
                dot.style.top = sy + 'px';
            }

            // Ring lerps smoothly regardless of mode
            const ringEase = window.AppState.ghostMode ? 0.09 : 0.13;
            ringX = lerp(ringX, sx, ringEase);
            ringY = lerp(ringY, sy, ringEase);

            if (ring) {
                ring.style.left = ringX + 'px';
                ring.style.top = ringY + 'px';
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

        initCursorTrail();
    };

    const initCursorTrail = () => {
        let lastTime = 0;
        document.addEventListener('mousemove', (e) => {
            if (window.AppState.ghostMode) return;
            const now = Date.now();
            if (now - lastTime < 45) return;
            lastTime = now;

            const trail = document.createElement('div');
            trail.className = 'cursor-trail-dot';
            trail.style.left = e.clientX + 'px';
            trail.style.top = e.clientY + 'px';
            document.body.appendChild(trail);
            setTimeout(() => trail.remove(), 400);
        });
    };

    const setGhostMode = (val) => {
        window.AppState.ghostMode = val;
    };

    const setGhostPos = (x, y) => {
        window.AppState.ghostX = x;
        window.AppState.ghostY = y;
        if (dot) {
            dot.style.left = x + 'px';
            dot.style.top = y + 'px';
        }
    };

    return {
        init,
        setGhostMode,
        setGhostPos
    };
})();
