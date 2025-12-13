# Celestial Background Module

Modular celestial background system for the Astrology Calculator featuring **real astronomical constellations**.

## Structure

```
background/
├── init.js                    - Auto-initialization entry point
├── CelestialBackground.js     - Main background controller
├── Star.js                    - Twinkling star class
├── Planet.js                  - Orbital planet class
├── Constellation.js           - Real constellation renderer
├── constellationData.js       - Real astronomical constellation data
├── theme.js                   - Theme utilities and color management
├── example.html               - Interactive demo with controls
└── README.md                  - This file
```

## Features

- **Real Constellations**: 10 authentic star patterns (Orion, Ursa Major, Cassiopeia, Scorpius, Leo, Cygnus, Gemini, Taurus, Lyra, Aquila)
- **Accurate Star Brightness**: Based on real astronomical magnitude data
- **Named Stars**: Famous stars like Betelgeuse, Rigel, Vega, Altair with accurate relative positions
- **Styled Constellation Labels**:
  - Names in **Cinzel** font (Roman/Latin style) with gold color and glow effect
  - Descriptions in **Parisienne** font (elegant script)
  - Manual letter spacing for professional appearance
- **Smart Positioning**: Constellations avoid center UI zone, placed on edges only
- **Twinkling Background Stars**: 100 animated stars for depth
- **Orbital Planets**: 4 animated planets with trails

**Try it out:** Open `background/example.html` to see an interactive demo with controls!

## Required Fonts

Add these Google Fonts to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Parisienne&display=swap" rel="stylesheet">
```

## Usage

### Basic Usage (Auto-initialization)

The background automatically initializes when you include the module:

```html
<canvas id="celestial-canvas"></canvas>
<script type="module" src="background/init.js"></script>
```

### Advanced Usage

```javascript
import { initCelestialBackground } from './background/init.js';

// Initialize with custom options
const background = initCelestialBackground('celestial-canvas', {
    starCount: 150,
    planetCount: 6,
    constellationCount: 8,
    constellationScale: 1.2,
    showConstellationNames: true,
    showStarNames: false
});

// Use specific constellations
const background = initCelestialBackground('celestial-canvas', {
    specificConstellations: ['ORION', 'URSA_MAJOR', 'CASSIOPEIA']
});
```

## Available Constellations

You can specify which constellations to display:

- `ORION` - The Hunter (Betelgeuse, Rigel, Belt stars)
- `URSA_MAJOR` - The Great Bear / Big Dipper
- `CASSIOPEIA` - The Queen (W shape)
- `SCORPIUS` - The Scorpion (Antares)
- `LEO` - The Lion (Regulus)
- `CYGNUS` - The Swan / Northern Cross (Deneb)
- `GEMINI` - The Twins (Castor, Pollux)
- `TAURUS` - The Bull (Aldebaran, Pleiades)
- `LYRA` - The Lyre (Vega)
- `AQUILA` - The Eagle (Altair)

### Direct Control

```javascript
import { CelestialBackground } from './background/CelestialBackground.js';

const background = new CelestialBackground('celestial-canvas', {
    starCount: 100,
    planetCount: 4,
    constellationCount: 5
});

// Start animation
background.start();

// Stop animation
background.stop();

// Restart with new settings
background.restart();

// Add custom elements
background.addStar();
background.addPlanet(centerX, centerY, 300,
    { light: '#ff00ff', dark: '#800080' }, 0.0005);

// Add specific constellation by name
background.addConstellation('ORION', {
    scale: 1.5,
    showName: true,
    showStarNames: true
});

// Add random constellation
background.addRandomConstellation();

// Toggle constellation names on/off
background.toggleConstellationNames(false);
background.toggleStarNames(true);

// Get list of available constellations
console.log(background.getAvailableConstellations());

// Clear elements
background.clearStars();
background.clearPlanets();
background.clearConstellations();
```

## Module Details

### CelestialBackground.js
Main controller class that manages the canvas and coordinates all background elements.

**Methods:**
- `start()` - Start the animation loop
- `stop()` - Stop the animation loop
- `restart()` - Restart the background with current settings
- `addStar()` - Add a new star
- `addPlanet(x, y, orbit, color, speed)` - Add a custom planet
- `addConstellation()` - Add a new constellation
- `clearStars()` - Remove all stars
- `clearPlanets()` - Remove all planets
- `clearConstellations()` - Remove all constellations

### Star.js
Individual twinkling stars with opacity animation.

**Properties:**
- Position (x, y)
- Size
- Opacity (animated)
- Twinkle speed

### Planet.js
Orbiting planets with trails and glow effects.

**Properties:**
- Orbital center (centerX, centerY)
- Orbit radius
- Angle and speed
- Color gradient (light/dark)
- Motion trail (last 30 positions)

### Constellation.js
Real constellation renderer with styled labels.

**Properties:**
- Real star patterns with accurate positions
- Star brightness based on astronomical magnitude
- Line connections between stars
- Theme-aware colors
- Smart positioning (avoids center UI zone)

**Label Styling:**
- Name: Cinzel font, 14px, gold (#d4af37), letter-spaced, with glow effect
- Description: Parisienne font, 16px, elegant script

### theme.js
Theme utilities for color management.

**Functions:**
- `getTheme()` - Get current theme (light/dark)
- `getColors()` - Get theme-specific color palette
- `observeThemeChanges(callback)` - Watch for theme changes

## Theme Support

The background automatically adapts to light/dark themes:

**Dark Theme:**
- Background: #050810
- Stars: white (#ffffff)
- Constellation lines: rgba(212, 175, 55, 0.3)

**Light Theme:**
- Background: #0a0e1a
- Stars: light gray (#e2e8f0)
- Constellation lines: rgba(212, 175, 55, 0.2)

## Celestial Color Palette

Available CSS variables in `styles.css` for consistent theming:

| Palette | Primary | Glow | Use Case |
|---------|---------|------|----------|
| **Gold** | `--gold-500` #d4af37 | `--gold-glow` | Names, accents, sun |
| **Cyan** | `--cyan-300` #67e8f9 | `--cyan-glow` | Stars, cosmic, cool |
| **Purple** | `--purple-400` #c084fc | `--purple-glow` | Mystical, magic |
| **Silver** | `--silver-300` #d4d4d8 | `--silver-glow` | Moon, elegant |

Each palette has shades 50-900 (e.g., `--gold-50` to `--gold-900`).

## Extending the Background

To add new background elements:

1. Create a new class in its own file (e.g., `Comet.js`)
2. Import it in `CelestialBackground.js`
3. Add initialization and rendering logic
4. Add public methods for customization

Example:

```javascript
// background/Comet.js
export class Comet {
    constructor(canvas) {
        this.canvas = canvas;
        // Initialize comet properties
    }

    update() {
        // Update position
    }

    draw(ctx) {
        // Render comet
    }
}

// Add to CelestialBackground.js
import { Comet } from './Comet.js';

// In constructor:
this.comets = [];

// In init():
this.comets.push(new Comet(this.canvas));

// In animate():
this.comets.forEach(comet => {
    comet.update();
    comet.draw(this.ctx);
});
```

## Performance Notes

- Canvas uses `requestAnimationFrame` for smooth 60fps animation
- Automatic cleanup on window resize
- Efficient rendering with minimal redraws
- Theme changes apply on next animation frame
