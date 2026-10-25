/* ═══════════════════════════════════════════════════════════
   FOOTER SECTION - CONTROLLER
   Theme, Sound, Mobile Simulation & Control Panel
   ═══════════════════════════════════════════════════════════ */
window.FooterSystem = (() => {
    const init = () => {
        // Init theme
        document.documentElement.setAttribute('data-theme', window.AppState.theme);
    };

    const toggleTheme = () => {
        window.AppState.theme = window.AppState.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', window.AppState.theme);
        const icon = document.getElementById('theme-icon');
        if (icon) icon.textContent = window.AppState.theme === 'dark' ? '🌗' : '☀️';
        if (window.BackgroundSystem && typeof window.BackgroundSystem.applyTheme === 'function') {
            window.BackgroundSystem.applyTheme(window.AppState.theme);
        }
    };

    const toggleMobileView = () => {
        const wrap = document.getElementById('device-wrap');
        const screen = document.getElementById('device-screen');
        const main = document.getElementById('portfolio');
        if (!wrap || !screen || !main) return;

        window.AppState.mobileActive = !window.AppState.mobileActive;
        if (window.AppState.mobileActive) {
            wrap.classList.add('active');
            screen.innerHTML = main.innerHTML;
        } else {
            deactivateMobileView();
        }
    };

    const deactivateMobileView = () => {
        const wrap = document.getElementById('device-wrap');
        const screen = document.getElementById('device-screen');
        if (wrap) wrap.classList.remove('active');
        if (screen) screen.innerHTML = '';
        window.AppState.mobileActive = false;
    };

    const hireNow = () => {
        const toast = document.getElementById('cart-toast');
        if (toast) {
            toast.classList.add('visible');
            setTimeout(() => toast.classList.remove('visible'), 3500);
        }
        const contactSec = document.getElementById('contact');
        if (contactSec) contactSec.scrollIntoView({ behavior: 'smooth' });
    };

    return {
        init,
        toggleTheme,
        toggleMobileView,
        deactivateMobileView,
        hireNow
    };
})();
