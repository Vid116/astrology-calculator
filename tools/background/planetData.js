// Solar System Planet Data
// Real planets with colors based on actual appearance
// Planet images from NASA (public domain)
// Sizes and speeds are relative (not to scale for visual appeal)

export const PLANETS = {
    SUN: {
        name: "Sun",
        symbol: "☉",
        meaning: "Vitality, Self, Identity",
        image: "sun.png",
        colors: {
            light: "#fff7a1",
            dark: "#ffa500",
            glow: "#ffdd44"
        },
        size: 18,
        orbitRadius: 0,  // Center
        orbitSpeed: 0,
        isStar: true
    },
    MERCURY: {
        name: "Mercury",
        symbol: "☿",
        meaning: "Communication, Mind, Travel",
        image: "mercury.png",
        colors: {
            light: "#b5b5b5",
            dark: "#6b6b6b",
            glow: "#9a9a9a"
        },
        size: 4,
        orbitRadius: 60,
        orbitSpeed: 0.025
    },
    VENUS: {
        name: "Venus",
        symbol: "♀",
        meaning: "Love, Beauty, Harmony",
        image: "venus.png",
        colors: {
            light: "#ffe4c4",
            dark: "#daa520",
            glow: "#f5deb3"
        },
        size: 6,
        orbitRadius: 90,
        orbitSpeed: 0.018
    },
    EARTH: {
        name: "Earth",
        symbol: "♁",
        meaning: "Home, Grounding, Life",
        image: "earth.png",
        colors: {
            light: "#87ceeb",
            dark: "#228b22",
            glow: "#4169e1"
        },
        size: 6,
        orbitRadius: 120,
        orbitSpeed: 0.015
    },
    MARS: {
        name: "Mars",
        symbol: "♂",
        meaning: "Action, Energy, Passion",
        image: "mars.png",
        colors: {
            light: "#ff6b4a",
            dark: "#8b0000",
            glow: "#cd5c5c"
        },
        size: 5,
        orbitRadius: 155,
        orbitSpeed: 0.012
    },
    JUPITER: {
        name: "Jupiter",
        symbol: "♃",
        meaning: "Expansion, Luck, Wisdom",
        image: "jupiter.png",
        colors: {
            light: "#f5deb3",
            dark: "#cd853f",
            glow: "#deb887"
        },
        size: 12,
        orbitRadius: 210,
        orbitSpeed: 0.007
    },
    SATURN: {
        name: "Saturn",
        symbol: "♄",
        meaning: "Structure, Discipline, Time",
        image: "saturn.png",
        colors: {
            light: "#f4e4ba",
            dark: "#c9a227",
            glow: "#daa520"
        },
        size: 10,
        orbitRadius: 260,
        orbitSpeed: 0.005,
        hasRings: true,
        ringColor: "rgba(210, 180, 140, 0.4)"
    },
    URANUS: {
        name: "Uranus",
        symbol: "♅",
        meaning: "Innovation, Change, Rebellion",
        image: "uranus.png",
        colors: {
            light: "#b0e0e6",
            dark: "#4682b4",
            glow: "#87ceeb"
        },
        size: 8,
        orbitRadius: 310,
        orbitSpeed: 0.003
    },
    NEPTUNE: {
        name: "Neptune",
        symbol: "♆",
        meaning: "Dreams, Intuition, Mystery",
        image: "neptune.png",
        colors: {
            light: "#6495ed",
            dark: "#00008b",
            glow: "#4169e1"
        },
        size: 8,
        orbitRadius: 360,
        orbitSpeed: 0.002
    },
    PLUTO: {
        name: "Pluto",
        symbol: "♇",
        meaning: "Transformation, Power, Rebirth",
        image: "pluto.png",
        colors: {
            light: "#deb887",
            dark: "#8b7355",
            glow: "#a0826d"
        },
        size: 3,
        orbitRadius: 400,
        orbitSpeed: 0.001
    }
};

// Get planet by name
export function getPlanet(name) {
    return PLANETS[name.toUpperCase()];
}

// Get all planet names
export function getPlanetNames() {
    return Object.keys(PLANETS);
}

// Get orbiting planets only (excludes Sun)
export function getOrbitingPlanets() {
    return Object.entries(PLANETS)
        .filter(([key, planet]) => !planet.isStar)
        .map(([key, planet]) => ({ key, ...planet }));
}
