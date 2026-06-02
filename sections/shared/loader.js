/*
  File: sections/shared/loader.js
  Purpose: Lightweight modular loader to dynamically fetch and inject
  section CSS/HTML/JS at runtime. Designed to defer non-critical sections
  and avoid blocking the initial intro orchestration.

  Notes:
  - `autoInit` flags control whether a section is initialized immediately.
  - Keeps ordering: shared styles & scripts must be loaded first.
  - Uses `fetch` for HTML and appends scripts/styles to the document.
*/
/* ╔══════════════════════════════════════════════════════════════╗
    ║  MODULAR LOADER - Dynamically loads all sections           ║
    ╚══════════════════════════════════════════════════════════════╝ */

const ModularLoader = (() => {
    const loadedSections = new Map();
    const basePath = 'sections';

    /**
     * Configuration for all sections
     */
    const sections = [
        { name: 'background', autoInit: true, noContent: true },
        { name: 'cursor', autoInit: true, noContent: true },
        { name: 'intro', autoInit: true },
        { name: 'architect', autoInit: false },
        { name: 'technical-arsenal', autoInit: false },
        { name: 'project-portfolio', autoInit: false },
        { name: 'experience', autoInit: false },
        { name: 'client-review', autoInit: false },
        { name: 'contact', autoInit: false },
        { name: 'footer', autoInit: false },
    ];

    /**
     * Load CSS file
     */
    const loadCSS = (path) => {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = path;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    };

    /**
     * Load JavaScript file
     */
    const loadJS = (path) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = path;
            script.onload = resolve;
            script.onerror = reject;
            script.async = true;
            document.body.appendChild(script);
        });
    };

    /**
     * Load HTML content
     */
    const loadHTML = (path) => {
        return fetch(path)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.text();
            })
            .catch(error => {
                console.error(`Failed to load HTML: ${path}`, error);
                return '';
            });
    };

    /**
     * Load section
     */
    const loadSection = async (sectionName, containerSelector) => {
        try {
            const sectionPath = `${basePath}/${sectionName}`;
            
            // Load CSS
            await loadCSS(`${sectionPath}/${sectionName}.css`);
            
            // Load HTML (if not noContent)
            const section = sections.find(s => s.name === sectionName);
            if (!section.noContent) {
                const html = await loadHTML(`${sectionPath}/${sectionName}.html`);
                const container = document.querySelector(containerSelector);
                if (container) {
                    container.innerHTML = html;
                }
            }
            
            // Load JS
            await loadJS(`${sectionPath}/${sectionName}.js`);
            
            loadedSections.set(sectionName, true);
            console.log(`✓ Loaded section: ${sectionName}`);
            
            return true;
        } catch (error) {
            console.error(`✗ Failed to load section: ${sectionName}`, error);
            return false;
        }
    };

    /**
     * Load all sections
     */
    const loadAllSections = async () => {
        console.log('Loading modular portfolio sections...');
        
        // Load shared styles first
        await loadCSS(`${basePath}/shared/variables.css`);
        await loadCSS(`${basePath}/shared/global.css`);
        await loadCSS(`${basePath}/shared/animations.css`);
        await loadCSS(`${basePath}/shared/utilities.css`);
        await loadCSS(`${basePath}/shared/responsive.css`);
        
        // Load shared JS
        await loadJS(`${basePath}/shared/helpers.js`);
        await loadJS(`${basePath}/shared/glow-effects.js`);
        await loadJS(`${basePath}/shared/scroll-engine.js`);
        
        // Load all sections
        for (const section of sections) {
            if (section.name === 'background' || section.name === 'cursor') {
                await loadSection(section.name, `#${section.name}-root`);
            } else {
                await loadSection(section.name, `#${section.name}-root`);
            }
        }
        
        console.log('✓ All sections loaded successfully');
        dispatchEvent(new CustomEvent('modulesLoaded'));
    };

    /**
     * Load section on demand
     */
    const loadOnDemand = async (sectionName) => {
        if (loadedSections.has(sectionName)) {
            console.log(`Section ${sectionName} already loaded`);
            return true;
        }
        
        return await loadSection(sectionName, `#${sectionName}-root`);
    };

    /**
     * Initialize all loaded sections
     * Only initializes systems marked with autoInit: true
     * Orchestrator handles initialization of other systems
     */
    const initializeAll = async () => {
        // Wait for all sections to be loaded
        if (typeof window !== 'undefined') {
            console.log('⚙ Initializing primary systems...');
            
            // Only auto-initialize background, cursor, and intro
            // Other systems wait for orchestrator signal
            if (window.BackgroundSystem) {
                try {
                    await window.BackgroundSystem.init?.();
                    console.log('✓ Background initialized');
                } catch (e) {
                    console.error('✗ Background init error:', e);
                }
            }
            
            if (window.CursorSystem) {
                try {
                    await window.CursorSystem.init?.();
                    console.log('✓ Cursor initialized');
                } catch (e) {
                    console.error('✗ Cursor init error:', e);
                }
            }
            
            if (window.IntroSystem) {
                try {
                    await window.IntroSystem.init?.();
                    console.log('✓ Intro initialized');
                } catch (e) {
                    console.error('✗ Intro init error:', e);
                }
            }
            
            // Other systems (architect, technical, projects, etc.) 
            // will be initialized by orchestrator when appropriate
        }
    };

    /**
     * Initialize a specific section
     * Used by orchestrator to trigger section initialization on demand
     */
    const initializeSection = async (sectionName) => {
        const systemName = getSectionSystemName(sectionName);
        if (window[systemName]) {
            try {
                await window[systemName].init?.();
                console.log(`✓ ${sectionName} initialized`);
                return true;
            } catch (e) {
                console.error(`✗ ${sectionName} init error:`, e);
                return false;
            }
        }
        return false;
    };

    /**
     * Helper to convert section name to system name
     */
    const getSectionSystemName = (sectionName) => {
        const map = {
            'background': 'BackgroundSystem',
            'cursor': 'CursorSystem',
            'intro': 'IntroSystem',
            'architect': 'ArchitectSystem',
            'technical-arsenal': 'TechnicalArsenalSystem',
            'project-portfolio': 'ProjectPortfolioSystem',
            'experience': 'ExperienceSystem',
            'client-review': 'ClientReviewSystem',
            'contact': 'ContactSystem',
            'footer': 'FooterSystem',
        };
        return map[sectionName] || null;
    };

    /**
     * Get loading progress
     */
    const getProgress = () => {
        const total = sections.length + 3; // +3 for shared files
        return (loadedSections.size / total) * 100;
    };

    /**
     * Get loaded sections
     */
    const getLoadedSections = () => {
        return Array.from(loadedSections.keys());
    };

    return {
        loadCSS,
        loadJS,
        loadHTML,
        loadSection,
        loadAllSections,
        loadOnDemand,
        initializeAll,
        initializeSection,
        getProgress,
        getLoadedSections,
        sections,
    };
})();

// Auto-load on DOM ready
// Orchestrator will handle initialization timing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ModularLoader.loadAllSections().then(() => {
            ModularLoader.initializeAll();
        });
    });
} else {
    ModularLoader.loadAllSections().then(() => {
        ModularLoader.initializeAll();
    });
}
