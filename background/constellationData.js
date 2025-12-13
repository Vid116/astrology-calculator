// Real constellation data based on actual astronomical patterns
// Coordinates are relative and will be scaled/positioned on canvas
// Brightness: 0 (brightest) to 5 (dimmest) - based on apparent magnitude

export const CONSTELLATIONS = {
    ORION: {
        name: "Orion",
        description: "The Hunter",
        stars: [
            { name: "Betelgeuse", x: 0, y: -100, brightness: 0.5 },      // Red supergiant (shoulder)
            { name: "Bellatrix", x: -80, y: -80, brightness: 1.6 },      // Left shoulder
            { name: "Rigel", x: -60, y: 100, brightness: 0.1 },          // Right foot (brightest)
            { name: "Saiph", x: 60, y: 110, brightness: 2.1 },           // Left foot
            { name: "Alnitak", x: -30, y: 0, brightness: 1.8 },          // Belt star
            { name: "Alnilam", x: 0, y: 0, brightness: 1.7 },            // Belt star (middle)
            { name: "Mintaka", x: 30, y: 0, brightness: 2.2 },           // Belt star
            { name: "Meissa", x: 0, y: -150, brightness: 3.4 }           // Head
        ],
        connections: [
            [0, 1], // Betelgeuse to Bellatrix (shoulders)
            [1, 4], // Bellatrix to Alnitak
            [0, 5], // Betelgeuse to Alnilam
            [4, 5], // Belt stars
            [5, 6], // Belt stars
            [4, 2], // Alnitak to Rigel
            [6, 3], // Mintaka to Saiph
            [2, 3], // Feet
            [5, 7]  // Alnilam to Meissa (head)
        ]
    },

    URSA_MAJOR: {
        name: "Ursa Major",
        description: "The Great Bear (Big Dipper)",
        stars: [
            { name: "Dubhe", x: 0, y: 0, brightness: 1.8 },              // Bowl
            { name: "Merak", x: 40, y: 30, brightness: 2.4 },            // Bowl
            { name: "Phecda", x: 80, y: 60, brightness: 2.4 },           // Bowl
            { name: "Megrez", x: 100, y: 20, brightness: 3.3 },          // Handle connection
            { name: "Alioth", x: 120, y: -20, brightness: 1.8 },         // Handle
            { name: "Mizar", x: 130, y: -50, brightness: 2.2 },          // Handle
            { name: "Alkaid", x: 140, y: -90, brightness: 1.9 }          // Handle end
        ],
        connections: [
            [0, 1], // Bowl
            [1, 2], // Bowl
            [2, 3], // Bowl to handle
            [0, 3], // Bowl
            [3, 4], // Handle
            [4, 5], // Handle
            [5, 6]  // Handle
        ]
    },

    CASSIOPEIA: {
        name: "Cassiopeia",
        description: "The Queen (W shape)",
        stars: [
            { name: "Schedar", x: 0, y: 0, brightness: 2.2 },
            { name: "Caph", x: 60, y: -40, brightness: 2.3 },
            { name: "Gamma Cas", x: 120, y: 0, brightness: 2.2 },
            { name: "Ruchbah", x: 180, y: -30, brightness: 2.7 },
            { name: "Segin", x: 240, y: 10, brightness: 3.4 }
        ],
        connections: [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4]
        ]
    },

    SCORPIUS: {
        name: "Scorpius",
        description: "The Scorpion",
        stars: [
            { name: "Antares", x: 0, y: 0, brightness: 1.0 },            // Heart (red supergiant)
            { name: "Dschubba", x: -80, y: -60, brightness: 2.3 },       // Head
            { name: "Pi Sco", x: -60, y: -40, brightness: 2.9 },         // Head
            { name: "Rho Sco", x: -40, y: -20, brightness: 3.9 },        // Head
            { name: "Tau Sco", x: 40, y: 30, brightness: 2.8 },          // Body
            { name: "Shaula", x: 100, y: 80, brightness: 1.6 },          // Tail
            { name: "Lesath", x: 110, y: 100, brightness: 2.7 }          // Stinger
        ],
        connections: [
            [1, 2],
            [2, 3],
            [3, 0],
            [0, 4],
            [4, 5],
            [5, 6]
        ]
    },

    LEO: {
        name: "Leo",
        description: "The Lion",
        stars: [
            { name: "Regulus", x: 0, y: 0, brightness: 1.4 },            // Heart
            { name: "Denebola", x: 150, y: 40, brightness: 2.1 },        // Tail
            { name: "Algieba", x: -40, y: -60, brightness: 2.0 },        // Mane
            { name: "Zosma", x: 100, y: 20, brightness: 2.6 },           // Back
            { name: "Chertan", x: 60, y: -10, brightness: 3.3 },         // Body
            { name: "Al Minliar", x: -30, y: -30, brightness: 4.5 }      // Head
        ],
        connections: [
            [2, 5],
            [5, 0],
            [0, 4],
            [4, 3],
            [3, 1],
            [3, 0]
        ]
    },

    CYGNUS: {
        name: "Cygnus",
        description: "The Swan (Northern Cross)",
        stars: [
            { name: "Deneb", x: 0, y: -100, brightness: 1.3 },           // Tail (top of cross)
            { name: "Sadr", x: 0, y: 0, brightness: 2.2 },               // Center
            { name: "Gienah", x: -80, y: 20, brightness: 2.5 },          // Wing
            { name: "Delta Cyg", x: 80, y: 20, brightness: 2.9 },        // Wing
            { name: "Albireo", x: 0, y: 100, brightness: 3.1 }           // Head (bottom of cross)
        ],
        connections: [
            [0, 1],
            [1, 2],
            [1, 3],
            [1, 4]
        ]
    },

    GEMINI: {
        name: "Gemini",
        description: "The Twins",
        stars: [
            { name: "Castor", x: 0, y: 0, brightness: 1.6 },
            { name: "Pollux", x: 40, y: 10, brightness: 1.2 },
            { name: "Alhena", x: 60, y: 80, brightness: 1.9 },
            { name: "Mebsuta", x: -20, y: 60, brightness: 3.0 },
            { name: "Tejat", x: -40, y: 90, brightness: 2.9 },
            { name: "Wasat", x: 20, y: 50, brightness: 3.5 }
        ],
        connections: [
            [0, 1],
            [0, 3],
            [3, 4],
            [1, 2],
            [1, 5],
            [5, 3]
        ]
    },

    TAURUS: {
        name: "Taurus",
        description: "The Bull",
        stars: [
            { name: "Aldebaran", x: 0, y: 0, brightness: 0.9 },          // Eye (orange giant)
            { name: "Elnath", x: -100, y: -80, brightness: 1.7 },        // Horn tip
            { name: "Zeta Tau", x: -60, y: -40, brightness: 3.0 },       // Horn
            { name: "Alcyone", x: 80, y: 60, brightness: 2.9 },          // Pleiades (shoulder)
            { name: "Atlas", x: 90, y: 70, brightness: 3.6 },            // Pleiades
            { name: "Theta Tau", x: 40, y: 30, brightness: 3.4 }         // Body
        ],
        connections: [
            [0, 2],
            [2, 1],
            [0, 5],
            [5, 3],
            [3, 4]
        ]
    },

    LYRA: {
        name: "Lyra",
        description: "The Lyre",
        stars: [
            { name: "Vega", x: 0, y: 0, brightness: 0.0 },               // Brightest star
            { name: "Sheliak", x: 40, y: 50, brightness: 3.5 },
            { name: "Sulafat", x: -30, y: 60, brightness: 3.2 },
            { name: "Delta Lyr", x: 20, y: 80, brightness: 4.3 }
        ],
        connections: [
            [0, 1],
            [0, 2],
            [1, 3],
            [2, 3]
        ]
    },

    AQUILA: {
        name: "Aquila",
        description: "The Eagle",
        stars: [
            { name: "Altair", x: 0, y: 0, brightness: 0.8 },             // Brightest
            { name: "Tarazed", x: -20, y: -60, brightness: 2.7 },
            { name: "Alshain", x: 20, y: 60, brightness: 3.7 },
            { name: "Deneb el Okab", x: -80, y: -100, brightness: 2.9 },
            { name: "Zeta Aql", x: 60, y: 40, brightness: 3.0 }
        ],
        connections: [
            [1, 0],
            [0, 2],
            [1, 3],
            [0, 4]
        ]
    }
};

// Helper function to get random constellation
export function getRandomConstellation() {
    const keys = Object.keys(CONSTELLATIONS);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return CONSTELLATIONS[randomKey];
}

// Helper function to get all constellation names
export function getConstellationNames() {
    return Object.keys(CONSTELLATIONS);
}

// Get specific constellation by name
export function getConstellation(name) {
    return CONSTELLATIONS[name];
}
