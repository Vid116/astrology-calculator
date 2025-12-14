# Celestial Background Module

Modular celestial background system for the Astrology Calculator featuring **all 88 IAU constellations** with silhouettes and a **real solar system**.

## Structure

```
background/
├── init.js                    - Auto-initialization entry point
├── CelestialBackground.js     - Main background controller
├── Star.js                    - Twinkling star class
├── Planet.js                  - Solar system planet class
├── Planet3D.js                - Three.js 3D planet renderer
├── Constellation.js           - Constellation renderer with silhouettes
├── constellationData.js       - All 88 constellation data
├── planetData.js              - Solar system planet data
├── theme.js                   - Theme utilities and color management
├── silhouettes/               - 85 constellation PNG images (Stellarium)
├── planets/                   - Planet PNG images (fallback)
├── example.html               - Interactive demo with controls
├── all-constellations.html    - Gallery of all 88 constellations
├── all-silhouettes.html       - Silhouette showcase
└── README.md                  - This file
```

## Features

### Constellations
- **All 88 IAU Constellations**: Complete set of officially recognized constellations
- **Silhouette Images**: 85 Stellarium constellation artworks by Johan Meuris (Free Art License)
- **Anchor-based Alignment**: Silhouettes align precisely to star positions
- **Hover Effects**: Silhouettes appear on hover with smooth animations
- **Accurate Star Patterns**: Real astronomical positions and connections
- **Smart Positioning**: Avoids center UI zone, prevents label overlap

### Solar System
- **3D Rendered Planets**: All planets rendered in real-time 3D using Three.js
- **Rotating Spheres**: Each planet spins on its axis as it orbits
- **Planet-specific Features**:
  - Gas giant bands (Jupiter, Saturn, Neptune)
  - Saturn's detailed ring system with gaps
  - Uranus tilted on its side with faint rings
  - Earth with procedural continents, oceans, and ice caps
- **Tilted Orbital Plane**: 3D effect with configurable tilt (default 0.6)
- **Astrological Info**: Symbols and meanings shown on hover
- **PNG Fallback**: Falls back to images if Three.js fails

### General
- **Twinkling Background Stars**: 120 animated stars for depth
- **Theme Support**: Adapts to light/dark themes
- **Styled Labels**: Cinzel + Parisienne fonts with gold accents

## Required Fonts

Add these Google Fonts to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Parisienne&display=swap" rel="stylesheet">
```

## Dependencies

### Three.js (Required for 3D planets)

Add Three.js to your HTML `<head>`:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
```

## Usage

### Basic Usage (Auto-initialization)

```html
<canvas id="celestial-canvas"></canvas>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script type="module" src="background/init.js"></script>
```

### Advanced Usage

```javascript
import { initCelestialBackground } from './background/init.js';

const background = initCelestialBackground('celestial-canvas', {
    // Stars
    starCount: 150,

    // Constellations
    constellationCount: 12,
    constellationScale: 0.8,
    showConstellationNames: true,
    showStarNames: false,
    showSilhouettes: true,
    specificConstellations: ['ORION', 'CRUX', 'SCORPIUS'],  // optional

    // Planets
    showPlanets: true,
    showSun: true,
    planetScale: 1.0,
    orbitScale: 0.8,
    orbitTilt: 0.6,           // 0 = face-on, 1 = edge-on
    speedMultiplier: 1.0,
    specificPlanets: null      // null = all, or ['MARS', 'JUPITER']
});
```

## Available Planets

| Planet | Symbol | Meaning |
|--------|--------|---------|
| SUN | ☉ | Vitality, Self, Identity |
| MERCURY | ☿ | Communication, Mind, Travel |
| VENUS | ♀ | Love, Beauty, Harmony |
| EARTH | ♁ | Home, Grounding, Life |
| MARS | ♂ | Action, Energy, Passion |
| JUPITER | ♃ | Expansion, Luck, Wisdom |
| SATURN | ♄ | Structure, Discipline, Time |
| URANUS | ♅ | Innovation, Change, Rebellion |
| NEPTUNE | ♆ | Dreams, Intuition, Mystery |
| PLUTO | ♇ | Transformation, Power, Rebirth |

## Available Constellations

All 88 IAU constellations are available. Examples:

- `ORION` - The Hunter
- `URSA_MAJOR` - Great Bear / Big Dipper
- `CRUX` - Southern Cross
- `SCORPIUS` - The Scorpion
- `LEO` - The Lion
- `CASSIOPEIA` - The Queen
- `CYGNUS` - The Swan
- `PISCES` - The Fishes
- ... and 80 more

Use `background.getAvailableConstellations()` for the full list.

## API Reference

### CelestialBackground

```javascript
// Start/stop animation
background.start();
background.stop();
background.restart();

// Constellations
background.addConstellation('ORION', { scale: 1.2 });
background.addRandomConstellation();
background.clearConstellations();
background.toggleConstellationNames(true/false);
background.toggleStarNames(true/false);
background.toggleSilhouettes(true/false);
background.getAvailableConstellations();

// Planets
background.addPlanet('MARS', { scale: 1.5 });
background.clearPlanets();
background.togglePlanets(true/false);
background.toggleSun(true/false);
background.getAvailablePlanets();

// Stars
background.addStar();
background.clearStars();
```

## Silhouette Attribution

Constellation silhouette artwork by **Johan Meuris**
Licensed under the **Free Art License 1.3**
https://artlibre.org/licence/lal/en/
Artwork source: **Stellarium** (https://stellarium.org/)

## Theme Support

The background automatically adapts to light/dark themes via `data-theme` attribute.

**Dark Theme:**
- Background: #050810
- Stars: white
- Lines: gold with transparency

**Light Theme:**
- Background: #0a0e1a
- Stars: light gray
- Lines: gold with less opacity

## Performance Notes

- Uses `requestAnimationFrame` for smooth 60fps
- Silhouettes are preloaded to prevent flicker
- Planet images load asynchronously with gradient fallback
- Efficient canvas rendering
- Automatic cleanup on resize
