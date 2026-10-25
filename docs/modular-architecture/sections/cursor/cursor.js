/* ╔══════════════════════════════════════════════════════════════╗
   ║  CURSOR SECTION - Custom Cursor Controller                 ║
   ╚══════════════════════════════════════════════════════════════╝ */

const CursorSystem = (() => {
    let dot, ring;
    let ringX, ringY;
    let dotX, dotY;
    let ghostMode = false;
    let ghostX, ghostY;

    /**
     * Initialize cursor system
     */
    const init = async () => {
        dot = document.getElementById('cursor-dot');
        ring = document.getElementById('cursor-ring');

        if (!dot || !ring) return;

        // Initialize positions at center
        ringX = window.innerWidth / 2;
        ringY = window.innerHeight / 2;
        dotX = window.innerWidth / 2;
        dotY = window.innerHeight / 2;

        setupEventListeners();
        startAnimationLoop();

        console.log('✓ Cursor system initialized');
    };

    /**
     * Setup all event listeners
     */
    const setupEventListeners = () => {
        // Mouse move tracking
        document.addEventListener('mousemove', handleMouseMove);

        // Hover detection
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);

        // Click animation
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);
    };

    /**
     * Handle mouse move
     */
    const handleMouseMove = (e) => {
        if (!ghostMode) {
            dotX = e.clientX;
            dotY = e.clientY;
        }
    };

    /**
     * Handle mouse over
     */
    const handleMouseOver = (e) => {
        if (ghostMode) return;

        const isInteractive = e.target.closest('button,a,[role="button"],[tabindex]');
        if (isInteractive) {
            document.body.classList.add('cursor-hover');
        }
    };

    /**
     * Handle mouse out
     */
    const handleMouseOut = (e) => {
        if (ghostMode) return;

        const isInteractive = e.target.closest('button,a,[role="button"],[tabindex]');
        if (isInteractive) {
            document.body.classList.remove('cursor-hover');
        }
    };

    /**
     * Handle mouse down
     */
    const handleMouseDown = () => {
        if (!ghostMode) {
            document.body.classList.add('cursor-click');
        }
    };

    /**
     * Handle mouse up
     */
    const handleMouseUp = () => {
        document.body.classList.remove('cursor-click');
    };

    /**
     * Animation loop for smooth cursor tracking
     */
    const startAnimationLoop = () => {
        const loop = () => {
            const sx = ghostMode ? ghostX : dotX;
            const sy = ghostMode ? ghostY : dotY;

            // Update dot position in real-time (not in ghost mode)
            if (!ghostMode) {
                dot.style.left = sx + 'px';
                dot.style.top = sy + 'px';
            }

            // Smooth ring following with lerp
            const lerpFactor = ghostMode ? 0.09 : 0.13;
            ringX = Helpers.lerp(ringX, sx, lerpFactor);
            ringY = Helpers.lerp(ringY, sy, lerpFactor);

            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';

            requestAnimationFrame(loop);
        };
        loop();
    };

    /**
     * Enable ghost mode (automated cursor)
     */
    const enableGhostMode = () => {
        ghostMode = true;
        ghostX = window.innerWidth / 2;
        ghostY = window.innerHeight / 2;
    };

    /**
     * Disable ghost mode
     */
    const disableGhostMode = () => {
        ghostMode = false;
    };

    /**
     * Get ghost mode state
     */
    const isGhostMode = () => ghostMode;

    /**
     * Glide cursor to position (Bézier curve)
     */
    const glide = (x1, y1, duration, cpOffsetX = 0, cpOffsetY = -80) => {
        return new Promise(resolve => {
            const x0 = ghostX || window.innerWidth / 2;
            const y0 = ghostY || window.innerHeight / 2;

            const cpX = (x0 + x1) / 2 + cpOffsetX;
            const cpY = Math.min(y0, y1) + cpOffsetY;

            const t0 = performance.now();

            const step = (now) => {
                const raw = Math.min((now - t0) / duration, 1);

                // Cubic ease-in-out
                const t = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
                const u = 1 - t;

                // Quadratic Bézier
                ghostX = u * u * x0 + 2 * u * t * cpX + t * t * x1;
                ghostY = u * u * y0 + 2 * u * t * cpY + t * t * y1;

                dot.style.left = ghostX + 'px';
                dot.style.top = ghostY + 'px';

                if (raw < 1) {
                    requestAnimationFrame(step);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(step);
        });
    };

    /**
     * Click animation
     */
    const click = () => {
        return new Promise(resolve => {
            document.body.classList.add('cursor-click');
            dot.style.transition = 'transform 0.13s var(--ease-spring)';
            dot.style.transform = 'translate(-50%,-50%) scale(2.8)';

            setTimeout(() => {
                dot.style.transform = 'translate(-50%,-50%) scale(1)';
                document.body.classList.remove('cursor-click');
                setTimeout(resolve, 150);
            }, 150);
        });
    };

    /**
     * Show cursor
     */
    const show = () => {
        dot.classList.add('active');
        ring.classList.add('active');
    };

    /**
     * Hide cursor
     */
    const hide = () => {
        dot.classList.remove('active');
        ring.classList.remove('active');
    };

    /**
     * Set cursor color
     */
    const setColor = (color) => {
        dot.style.background = color;
        dot.style.boxShadow = `0 0 10px ${color}, 0 0 20px rgba(${color},0.5)`;
        ring.style.borderColor = color;
    };

    /**
     * Move cursor to position instantly
     */
    const moveTo = (x, y) => {
        if (ghostMode) {
            ghostX = x;
            ghostY = y;
        } else {
            dotX = x;
            dotY = y;
        }
    };

    /**
     * Get current cursor position
     */
    const getPosition = () => ({
        x: ghostMode ? ghostX : dotX,
        y: ghostMode ? ghostY : dotY,
    });

    return {
        init,
        enableGhostMode,
        disableGhostMode,
        isGhostMode,
        glide,
        click,
        show,
        hide,
        setColor,
        moveTo,
        getPosition,
    };
})();

// Export
window.CursorSystem = CursorSystem;
