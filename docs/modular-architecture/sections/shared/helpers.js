/* ╔══════════════════════════════════════════════════════════════╗
   ║  SHARED HELPER FUNCTIONS                                    ║
   ╚══════════════════════════════════════════════════════════════╝ */

/**
 * Global Helpers Module
 * Shared utilities for all sections
 */
const Helpers = (() => {
    /**
     * Debounce function - limits how often a function is called
     */
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    /**
     * Throttle function - executes at most once per interval
     */
    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    /**
     * Linear interpolation
     */
    const lerp = (a, b, t) => a + (b - a) * t;

    /**
     * Random number between min and max
     */
    const random = (min, max) => Math.random() * (max - min) + min;

    /**
     * Random integer between min and max
     */
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    /**
     * Clamp value between min and max
     */
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    /**
     * Distance between two points
     */
    const distance = (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    /**
     * Check if element is in viewport
     */
    const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top < window.innerHeight &&
            rect.bottom > 0 &&
            rect.left < window.innerWidth &&
            rect.right > 0
        );
    };

    /**
     * Smooth scroll to element
     */
    const scrollToElement = (element, offset = 0) => {
        const top = element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    };

    /**
     * Add multiple event listeners
     */
    const onMultiple = (element, events, callback) => {
        events.forEach(event => element.addEventListener(event, callback));
    };

    /**
     * Remove multiple event listeners
     */
    const offMultiple = (element, events, callback) => {
        events.forEach(event => element.removeEventListener(event, callback));
    };

    /**
     * Check if device is mobile
     */
    const isMobile = () => window.innerWidth < 768;

    /**
     * Check if device is tablet
     */
    const isTablet = () => window.innerWidth >= 768 && window.innerWidth < 1024;

    /**
     * Get viewport dimensions
     */
    const getViewport = () => ({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    /**
     * Toggle class on element
     */
    const toggleClass = (element, className, force) => {
        element.classList.toggle(className, force);
    };

    /**
     * Add multiple classes
     */
    const addClasses = (element, classes) => {
        element.classList.add(...classes);
    };

    /**
     * Remove multiple classes
     */
    const removeClasses = (element, classes) => {
        element.classList.remove(...classes);
    };

    /**
     * Has class
     */
    const hasClass = (element, className) => {
        return element.classList.contains(className);
    };

    /**
     * Query selector with null check
     */
    const query = (selector, parent = document) => {
        return parent.querySelector(selector);
    };

    /**
     * Query all selector
     */
    const queryAll = (selector, parent = document) => {
        return Array.from(parent.querySelectorAll(selector));
    };

    /**
     * Create element with classes
     */
    const createElement = (tag, classes = [], attributes = {}) => {
        const element = document.createElement(tag);
        if (classes.length > 0) element.classList.add(...classes);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    };

    /**
     * Set multiple attributes
     */
    const setAttributes = (element, attributes) => {
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    };

    /**
     * Get data attribute
     */
    const getData = (element, key) => {
        return element.dataset[key];
    };

    /**
     * Set data attribute
     */
    const setData = (element, key, value) => {
        element.dataset[key] = value;
    };

    /**
     * Format number with commas
     */
    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    /**
     * Format date
     */
    const formatDate = (date, format = 'MM/DD/YYYY') => {
        const d = new Date(date);
        const map = {
            MM: String(d.getMonth() + 1).padStart(2, '0'),
            DD: String(d.getDate()).padStart(2, '0'),
            YYYY: d.getFullYear(),
            YY: String(d.getFullYear()).slice(-2),
        };
        return format.replace(/MM|DD|YYYY|YY/g, matched => map[matched]);
    };

    /**
     * Delay promise
     */
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    /**
     * Request animation frame promise
     */
    const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

    /**
     * Fetch with timeout
     */
    const fetchWithTimeout = (url, options = {}, timeout = 10000) => {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), timeout)
            ),
        ]);
    };

    /**
     * Store to localStorage
     */
    const store = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    };

    /**
     * Retrieve from localStorage
     */
    const retrieve = (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage error:', e);
            return defaultValue;
        }
    };

    /**
     * Remove from localStorage
     */
    const removeStore = (key) => {
        localStorage.removeItem(key);
    };

    /**
     * Get computed style value
     */
    const getComputedValue = (element, property) => {
        return window.getComputedStyle(element).getPropertyValue(property);
    };

    return {
        debounce,
        throttle,
        lerp,
        random,
        randomInt,
        clamp,
        distance,
        isInViewport,
        scrollToElement,
        onMultiple,
        offMultiple,
        isMobile,
        isTablet,
        getViewport,
        toggleClass,
        addClasses,
        removeClasses,
        hasClass,
        query,
        queryAll,
        createElement,
        setAttributes,
        getData,
        setData,
        formatNumber,
        formatDate,
        delay,
        nextFrame,
        fetchWithTimeout,
        store,
        retrieve,
        removeStore,
        getComputedValue,
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Helpers;
}
