// Theme utilities for celestial background
export function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
}

export function getColors() {
    const theme = getTheme();
    if (theme === 'dark') {
        return {
            bg: '#050810',
            star: '#ffffff',
            planet: '#d4af37',
            line: 'rgba(212, 175, 55, 0.3)',
            trail: 'rgba(212, 175, 55, 0.1)'
        };
    } else {
        return {
            bg: '#0a0e1a',
            star: '#e2e8f0',
            planet: '#d4af37',
            line: 'rgba(212, 175, 55, 0.2)',
            trail: 'rgba(212, 175, 55, 0.05)'
        };
    }
}

export function observeThemeChanges(callback) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                callback();
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true
    });

    return observer;
}
