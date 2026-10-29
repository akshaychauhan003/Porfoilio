/* ═══════════════════════════════════════════════════════════
   CURSOR SECTION - CONTROLLER
   Native System Cursor (Zero latency, Zero CPU load)
   Automated Ghost Cursor for Cinematic Intro Only
   ═══════════════════════════════════════════════════════════ */
window.CursorSystem = (() => {
    let dot = null;
    let ring = null;

    const init = () => {
        dot = document.getElementById('cursor-dot');
        ring = document.getElementById('cursor-ring');
        if (!dot || !ring) return;

        // Ensure custom DOM cursor elements are hidden by default
        // The user interacts using their native OS hardware cursor (0ms latency, zero load)
        if (!window.AppState.ghostMode) {
            dot.style.display = 'none';
            ring.style.display = 'none';
            dot.classList.remove('active');
            ring.classList.remove('active');
        }
    };

    const setGhostMode = (val) => {
        window.AppState.ghostMode = Boolean(val);
        if (!dot || !ring) return;

        if (val) {
            dot.style.display = 'block';
            ring.style.display = 'block';
            dot.classList.add('active');
            ring.classList.add('active');
        } else {
            dot.classList.remove('active');
            ring.classList.remove('active');
            dot.style.display = 'none';
            ring.style.display = 'none';
            document.body.classList.remove('cursor-hover', 'cursor-click');
        }
    };

    const setGhostPos = (x, y) => {
        window.AppState.ghostX = x;
        window.AppState.ghostY = y;
        const transformStr = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        if (dot) dot.style.transform = transformStr;
        if (ring) ring.style.transform = transformStr;
    };

    return {
        init,
        setGhostMode,
        setGhostPos
    };
})();
