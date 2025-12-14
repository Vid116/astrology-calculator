// Simple initialization function for celestial background
import { CelestialBackground } from './CelestialBackground.js';

// Detect the base path for silhouettes based on script location
function getSilhouettesPath() {
    // Get the current script's path to determine base directory
    const scriptUrl = import.meta.url;
    const basePath = scriptUrl.substring(0, scriptUrl.lastIndexOf('/') + 1);
    return basePath + 'silhouettes/';
}

/**
 * Initialize the celestial background
 * @param {string} canvasId - ID of the canvas element (default: 'celestial-canvas')
 * @param {object} options - Configuration options
 * @param {number} options.starCount - Number of stars (default: 100)
 * @param {number} options.planetCount - Number of planets (default: 4)
 * @param {number} options.constellationCount - Number of constellations (default: 5)
 * @returns {CelestialBackground} The background instance
 */
export function initCelestialBackground(canvasId = 'celestial-canvas', options = {}) {
    // Auto-detect silhouettes path if not provided
    const silhouettesPath = options.silhouettesPath || getSilhouettesPath();

    const background = new CelestialBackground(canvasId, {
        silhouettesPath,
        ...options
    });
    background.start();
    return background;
}

// Auto-initialize if canvas exists when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('celestial-canvas')) {
            window.celestialBackground = initCelestialBackground();
        }
    });
} else {
    if (document.getElementById('celestial-canvas')) {
        window.celestialBackground = initCelestialBackground();
    }
}
