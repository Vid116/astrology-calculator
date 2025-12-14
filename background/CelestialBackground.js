// Main celestial background controller
import { getColors, observeThemeChanges } from './theme.js';
import { Star } from './Star.js';
import { Planet } from './Planet.js';
import { Constellation } from './Constellation.js';
import { getRandomConstellation, getConstellation, CONSTELLATIONS } from './constellationData.js';

export class CelestialBackground {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas with id "${canvasId}" not found`);
        }

        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.planets = [];
        this.constellations = [];
        this.animationId = null;

        // Mouse tracking for hover effects
        this.mouseX = -1000;
        this.mouseY = -1000;

        // Preloaded silhouette images
        this.silhouettes = {};
        this.silhouettesPath = options.silhouettesPath || 'silhouettes/';

        // Configurable options - now defaults to more constellations from our 88 total
        this.config = {
            starCount: options.starCount || 120,
            planetCount: options.planetCount || 4,
            constellationCount: options.constellationCount || 12,  // Increased from 5 - picks randomly from all 88
            constellationScale: options.constellationScale || 0.7,
            showConstellationNames: options.showConstellationNames !== undefined ? options.showConstellationNames : true,
            showStarNames: options.showStarNames || false,
            specificConstellations: options.specificConstellations || null, // Array of constellation names to use
            showSilhouettes: options.showSilhouettes !== undefined ? options.showSilhouettes : true,
            ...options
        };

        // Preload silhouettes before init
        this.preloadSilhouettes();
        this.init();
        this.setupEventListeners();
    }

    // Preload all silhouette PNGs for better performance
    // Constellation artwork by Johan Meuris | Free Art License | stellarium.org
    preloadSilhouettes() {
        Object.keys(CONSTELLATIONS).forEach(key => {
            const data = CONSTELLATIONS[key];
            if (data.sprite && !CelestialBackground.MISSING_SPRITES.includes(key)) {
                const img = new Image();
                // Convert key to filename: URSA_MAJOR -> ursa-major.png
                const filename = key.toLowerCase().replace(/_/g, '-') + '.png';
                img.src = this.silhouettesPath + filename;
                img.onerror = () => {
                    console.warn(`Silhouette not found: ${filename}`);
                };
                this.silhouettes[key] = img;
            }
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.resizeCanvas();

        // Create stars
        this.stars = [];
        for (let i = 0; i < this.config.starCount; i++) {
            this.stars.push(new Star(this.canvas));
        }

        // Create planets
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        this.planets = [
            new Planet(centerX, centerY, 100,
                { light: '#ffd700', dark: '#b8860b' }, 0.002),
            new Planet(centerX, centerY, 150,
                { light: '#4169e1', dark: '#1e3a8a' }, 0.0015),
            new Planet(centerX, centerY, 200,
                { light: '#ff6347', dark: '#8b0000' }, 0.001),
            new Planet(centerX, centerY, 250,
                { light: '#32cd32', dark: '#006400' }, 0.0008)
        ];

        // Create real constellations
        this.constellations = [];
        this.createConstellations();
    }

    createConstellations() {
        const count = this.config.constellationCount;
        const usedConstellations = new Set();

        // If specific constellations are requested, use those
        if (this.config.specificConstellations && Array.isArray(this.config.specificConstellations)) {
            this.config.specificConstellations.forEach(name => {
                const data = getConstellation(name);
                if (data) {
                    const constellation = this.createNonOverlappingConstellation(data);
                    if (constellation) {
                        this.constellations.push(constellation);
                    }
                }
            });
        } else {
            // Otherwise, pick random constellations
            const constellationKeys = Object.keys(CONSTELLATIONS);

            for (let i = 0; i < count && i < constellationKeys.length; i++) {
                let attempts = 0;
                let constellationData;

                // Try to get a unique constellation
                do {
                    constellationData = getRandomConstellation();
                    attempts++;
                } while (usedConstellations.has(constellationData.name) && attempts < 20);

                if (!usedConstellations.has(constellationData.name)) {
                    usedConstellations.add(constellationData.name);

                    const constellation = this.createNonOverlappingConstellation(constellationData);
                    if (constellation) {
                        this.constellations.push(constellation);
                    }
                }
            }
        }
    }

    // Constellations without silhouette PNGs (checked at runtime)
    static MISSING_SPRITES = ['PUPPIS', 'SERPENS', 'VELA', 'CARINA'];

    // Get the key for a constellation name (reverse lookup)
    getConstellationKey(name) {
        for (const [key, data] of Object.entries(CONSTELLATIONS)) {
            if (data.name === name) return key;
        }
        return null;
    }

    // Create a constellation and try to position it so labels don't overlap
    createNonOverlappingConstellation(constellationData, maxAttempts = 25) {
        // Find the preloaded silhouette for this constellation
        const key = this.getConstellationKey(constellationData.name);
        const silhouetteImage = key ? this.silhouettes[key] : null;
        const hasSilhouette = key && !CelestialBackground.MISSING_SPRITES.includes(key);

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const constellation = new Constellation(this.canvas, constellationData, {
                scale: this.config.constellationScale,
                showName: this.config.showConstellationNames,
                showStarNames: this.config.showStarNames,
                showSilhouette: this.config.showSilhouettes && hasSilhouette,
                silhouetteImage: silhouetteImage,
                silhouettesPath: this.silhouettesPath
            });

            // Check if this constellation's label overlaps with any existing
            let hasOverlap = false;
            for (const existing of this.constellations) {
                if (constellation.labelsOverlap(existing)) {
                    hasOverlap = true;
                    break;
                }
            }

            if (!hasOverlap) {
                return constellation;
            }
        }

        // If we couldn't find a non-overlapping position, skip this constellation
        // rather than placing it with overlap
        return null;
    }

    animate() {
        const colors = getColors();
        this.ctx.fillStyle = colors.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background stars (twinkling)
        this.stars.forEach(star => star.draw(this.ctx));

        // Update hover states before drawing
        this.updateHoverStates();

        // Draw constellations (with real star patterns)
        // Draw non-hovered first, then hovered on top
        this.constellations.filter(c => !c.isHovered).forEach(c => c.draw(this.ctx));
        this.constellations.filter(c => c.isHovered).forEach(c => c.draw(this.ctx));

        // Update and draw planets
        this.planets.forEach(planet => {
            planet.update();
            planet.draw(this.ctx);
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        if (!this.animationId) {
            this.animate();
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    restart() {
        this.stop();
        this.init();
        this.start();
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.restart();
        });

        // Observe theme changes
        observeThemeChanges(() => {
            // Colors will update on next animation frame
        });

        // Mouse tracking for hover effects (document-level since canvas is z-index: -1)
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        document.addEventListener('mouseleave', () => {
            this.mouseX = -1000;
            this.mouseY = -1000;
        });
    }

    // Update hover states for all constellations
    updateHoverStates() {
        for (const constellation of this.constellations) {
            constellation.isHovered = constellation.containsPoint(this.mouseX, this.mouseY);
        }
    }

    // Public API for customization
    addStar() {
        this.stars.push(new Star(this.canvas));
    }

    addPlanet(centerX, centerY, orbitRadius, color, speed) {
        this.planets.push(new Planet(centerX, centerY, orbitRadius, color, speed));
    }

    addConstellation(constellationName, options = {}) {
        const data = getConstellation(constellationName);
        if (data) {
            // Find the preloaded silhouette for this constellation
            const key = this.getConstellationKey(data.name);
            const silhouetteImage = key ? this.silhouettes[key] : null;
            const hasSilhouette = key && !CelestialBackground.MISSING_SPRITES.includes(key);

            const showSil = options.showSilhouette !== undefined
                ? options.showSilhouette
                : (this.config.showSilhouettes && hasSilhouette);

            const constellation = new Constellation(this.canvas, data, {
                scale: options.scale || this.config.constellationScale,
                showName: options.showName !== undefined ? options.showName : this.config.showConstellationNames,
                showStarNames: options.showStarNames || this.config.showStarNames,
                showSilhouette: showSil,
                silhouetteImage: silhouetteImage,
                silhouettesPath: this.silhouettesPath,
                ...options
            });
            this.constellations.push(constellation);
            return constellation;
        }
        return null;
    }

    addRandomConstellation(options = {}) {
        const data = getRandomConstellation();
        return this.addConstellation(data.name, options);
    }

    clearStars() {
        this.stars = [];
    }

    clearPlanets() {
        this.planets = [];
    }

    clearConstellations() {
        this.constellations = [];
    }

    // Get list of available constellations
    getAvailableConstellations() {
        return Object.keys(CONSTELLATIONS);
    }

    // Toggle constellation names
    toggleConstellationNames(show) {
        this.config.showConstellationNames = show;
        this.constellations.forEach(c => c.showName = show);
    }

    // Toggle star names
    toggleStarNames(show) {
        this.config.showStarNames = show;
        this.constellations.forEach(c => c.showStarNames = show);
    }

    // Toggle silhouettes on hover
    toggleSilhouettes(show) {
        this.config.showSilhouettes = show;
        this.constellations.forEach(c => c.showSilhouette = show);
    }

    // Get silhouette loading status (for debugging)
    getSilhouetteStatus() {
        const total = Object.keys(this.silhouettes).length;
        const loaded = Object.values(this.silhouettes).filter(img => img.complete).length;
        return { loaded, total, ready: loaded === total };
    }
}
