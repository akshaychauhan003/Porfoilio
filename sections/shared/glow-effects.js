/* ╔══════════════════════════════════════════════════════════════╗
   ║  GLOW EFFECTS - Cinematic glow utilities                   ║
   ╚══════════════════════════════════════════════════════════════╝ */

const GlowEffects = (() => {
    /**
     * Apply glow shadow to element
     */
    const applyGlow = (element, color = '#3d8bff', intensity = 0.4) => {
        const colorObj = parseColor(color);
        const r = colorObj.r;
        const g = colorObj.g;
        const b = colorObj.b;
        
        element.style.boxShadow = `
            0 0 20px rgba(${r}, ${g}, ${b}, ${intensity * 0.5}),
            0 0 40px rgba(${r}, ${g}, ${b}, ${intensity * 0.3}),
            0 0 60px rgba(${r}, ${g}, ${b}, ${intensity * 0.1})
        `;
    };

    /**
     * Apply text glow
     */
    const applyTextGlow = (element, color = '#3d8bff', intensity = 0.6) => {
        const colorObj = parseColor(color);
        const r = colorObj.r;
        const g = colorObj.g;
        const b = colorObj.b;
        
        element.style.textShadow = `
            0 0 10px rgba(${r}, ${g}, ${b}, ${intensity}),
            0 0 20px rgba(${r}, ${g}, ${b}, ${intensity * 0.5})
        `;
    };

    /**
     * Parse color hex to RGB
     */
    const parseColor = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : { r: 61, g: 139, b: 255 };
    };

    /**
     * Create animated glow pulse
     */
    const createGlowPulse = (element, color = '#3d8bff', duration = 2000) => {
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = (timestamp - startTime) % duration;
            const progress = elapsed / duration;
            const intensity = 0.2 + Math.sin(progress * Math.PI * 2) * 0.2;
            
            applyGlow(element, color, intensity);
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    };

    /**
     * Apply hover glow
     */
    const applyHoverGlow = (element, color = '#3d8bff') => {
        element.addEventListener('mouseenter', () => {
            applyGlow(element, color, 0.6);
        });
        
        element.addEventListener('mouseleave', () => {
            applyGlow(element, color, 0.3);
        });
    };

    /**
     * Create neon border effect
     */
    const createNeonBorder = (element, color = '#3d8bff', width = 2) => {
        const colorObj = parseColor(color);
        const r = colorObj.r;
        const g = colorObj.g;
        const b = colorObj.b;
        
        element.style.border = `${width}px solid rgba(${r}, ${g}, ${b}, 0.5)`;
        element.style.boxShadow = `
            inset 0 0 20px rgba(${r}, ${g}, ${b}, 0.1),
            0 0 20px rgba(${r}, ${g}, ${b}, 0.3)
        `;
    };

    /**
     * Create glow ring
     */
    const createGlowRing = (element, color = '#3d8bff') => {
        const ring = document.createElement('div');
        ring.className = 'glow-ring';
        ring.style.cssText = `
            position: absolute;
            inset: -8px;
            border: 2px solid ${color};
            border-radius: inherit;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        element.parentElement.style.position = 'relative';
        element.parentElement.appendChild(ring);
        
        element.addEventListener('mouseenter', () => {
            ring.style.opacity = '1';
        });
        
        element.addEventListener('mouseleave', () => {
            ring.style.opacity = '0';
        });
        
        return ring;
    };

    /**
     * Apply glow to all matching elements
     */
    const applyGlowToAll = (selector, color = '#3d8bff') => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => applyGlow(el, color));
    };

    /**
     * Remove glow effect
     */
    const removeGlow = (element) => {
        element.style.boxShadow = '';
        element.style.textShadow = '';
    };

    /**
     * Create glow animation on element entry
     */
    const createGlowOnEntry = (element, color = '#3d8bff') => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    createGlowPulse(element, color);
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(element);
        return observer;
    };

    return {
        applyGlow,
        applyTextGlow,
        parseColor,
        createGlowPulse,
        applyHoverGlow,
        createNeonBorder,
        createGlowRing,
        applyGlowToAll,
        removeGlow,
        createGlowOnEntry,
    };
})();
