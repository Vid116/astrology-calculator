# Astrology Spark & True Placement Calculator

A stunning web-based astrology calculator featuring a celestial canvas background with animated constellations and planetary motion.

## Features

### 🌟 Celestial Background Animation
- **Canvas-based celestial animation** with twinkling stars
- **Planetary motion** with visible trails
- **Constellation patterns** connecting stars
- **Dynamic and fluid** animations
- **Theme-aware** colors (light & dark mode)

### 🔮 Calculators

#### 1. Spark Calculator
Calculates which "Spark" sign a planet is in based on its position.
- **Input:** Planet, Sign, Degree (0-29)
- **Output:** Spark sign, Decan, Decan ruling planets

#### 2. True Placement Calculator
Calculates house placements based on planetary positions.
- **Input:** Planet, Sign, Rising Sign (Ascendant)
- **Output:** House placement, interpretations, and detailed analysis

## Files

### Core Files
- `index.html` - Main application page
- `styles.css` - Theme-based styling with glass morphism effects
- `calculator.js` - Calculator logic and theme management
- `background.css` - Celestial canvas background styles
- `background.js` - Animated background with planets and constellations

### Data Files
- `spark_database.json` - 360 entries for Spark lookups
- `true_placement_db1.json` - 1,440 entries for True Placement lookups
- `true_placement_db2.json` - VENUS-specific placements
- `planet_meanings.json` - Interpretation keywords for planets
- `sign_meanings.json` - Interpretation keywords for signs

### Source
- `Spark_converter.xlsx` - Original Excel file with all astrology data

## Design Features

### 🎨 Theme System
- **Light & Dark themes** with smooth transitions
- **Theme persistence** using localStorage
- **Gold accent color** (#d4af37) for celestial authenticity

### ✨ Glass Morphism
- **85% transparency** on all UI elements
- **30px backdrop blur** for frosted glass effect
- **Semi-transparent borders** for subtle definition
- Background animations visible through interface

### 🌌 Visual Effects
- Twinkling stars at multiple depths
- Planets with motion trails
- Constellation line patterns
- Smooth canvas-based animations
- Responsive design for all screen sizes

## How to Use

### Running Locally

1. **Using Python:**
```bash
python -m http.server 8000
# Open: http://localhost:8000
```

2. **Using Node.js:**
```bash
npx http-server
# Open the URL shown in terminal
```

3. **Using VS Code:**
- Install "Live Server" extension
- Right-click `index.html` and select "Open with Live Server"

### Using the Calculators

**Spark Calculator:**
1. Select a planet from dropdown
2. Select the zodiac sign
3. Enter degree (0-29)
4. Click "Calculate Spark"
5. View Spark sign, Decan, and ruling planets

**True Placement Calculator:**
1. Select a planet
2. Select the sign the planet is in
3. Select your rising sign (Ascendant)
4. Click "Calculate True Placement"
5. View house placement and detailed interpretation

## Customization

### Adjusting Transparency
Edit line 9 in `styles.css`:
```css
--glass-opacity: 0.15;  /* Current: 85% transparent */
```

Options:
- `0.10` = 90% transparent (very see-through)
- `0.15` = 85% transparent (current)
- `0.30` = 70% transparent (more visible)
- `0.50` = 50% transparent (balanced)

### Theme Colors
All colors are controlled by CSS variables in `styles.css`.
Main accent color: `--accent-primary: #d4af37` (Gold)

## Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Opera

**Note:** Backdrop blur effects work best on modern browsers. Older browsers will show solid backgrounds as fallback.

## Technical Details

- **No dependencies** - Pure vanilla JavaScript
- **Canvas API** for smooth animations
- **CSS Variables** for theming
- **LocalStorage** for theme persistence
- **Responsive design** with mobile support

## Data Source

All astrological data extracted from `Spark_converter.xlsx` containing:
- 360-degree Spark mappings for all signs
- Complete True Placement lookup tables
- Planet and sign interpretation keywords
- Decan and ruling planet associations

---

Built with ✨ and 🌌 for astrology enthusiasts
