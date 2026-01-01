# CelestialBackground Fix Plan

## Problem Summary
After migrating from vanilla JS to Next.js, the celestial background lost:
1. Constellation hover effects (silhouettes not showing)
2. Planet display (only 4 generic vs 10 real planets) and hover effects

## Root Cause
The new `CelestialBackground.tsx` is a simplified rewrite that's missing:
- Mouse event listeners for hover tracking
- Real constellation data (88 constellations with sprite configs)
- Real planet data (Sun + 9 planets with names/symbols/images)
- Hit detection (`containsPoint`) for hover
- Silhouette PNG loading and rendering
- Planet labels on hover

---

## Implementation Tasks

### Phase 1: Data Files
- [ ] Create `src/data/constellationData.ts` - Port 88 constellations with sprite configs
- [ ] Create `src/data/planetData.ts` - Port all planet definitions

### Phase 2: Core Hover System
- [ ] Add mouse position tracking (`mouseX`, `mouseY` refs)
- [ ] Add `mousemove` event listener to canvas
- [ ] Add `mouseleave` event to reset hover state

### Phase 3: Constellation Fixes
- [ ] Update `Constellation` interface with full properties (name, meaning, connections, sprite, isHovered)
- [ ] Create `containsPoint()` function for constellation hit detection
- [ ] Add silhouette image preloading
- [ ] Add `drawSilhouette()` function for hover rendering
- [ ] Add constellation name/meaning label on hover

### Phase 4: Planet Fixes
- [ ] Update `Planet` interface with full properties (name, symbol, meaning, image, hasRings)
- [ ] Use real planet data instead of 4 generic planets
- [ ] Create `containsPoint()` function for planet hit detection
- [ ] Add planet image loading (optional - can use gradients)
- [ ] Add planet label (symbol + name) on hover

### Phase 5: Polish
- [ ] Add smooth hover transitions (scale animation)
- [ ] Test light/dark theme compatibility
- [ ] Verify silhouette paths work in Next.js (`/silhouettes/`)
- [ ] Performance optimization if needed

---

## File Changes

| File | Action | Status |
|------|--------|--------|
| `src/data/constellationData.ts` | CREATE | DONE |
| `src/data/planetData.ts` | CREATE | DONE |
| `src/components/CelestialBackground.tsx` | REWRITE | In Progress |
| `public/silhouettes/*.png` | COPY | DONE (85 files) |
| `public/planets/*.png` | COPY | DONE (9 files) |

---

## Progress Log

### Session 1 - COMPLETED
- [x] Analyzed root cause of both issues
- [x] Compared old vs new implementations
- [x] Created this plan
- [x] Restored `public/silhouettes/` (85 PNG files)
- [x] Restored `public/planets/` (9 PNG files)
- [x] Created `src/data/constellationData.ts` with TypeScript types (88 constellations)
- [x] Created `src/data/planetData.ts` with TypeScript types (10 planets)
- [x] Rewrote `CelestialBackground.tsx` with full hover system
- [x] Fixed TypeScript errors (flexible star tuple types)
- [x] Verified dev server starts successfully

## What Was Fixed

### Constellation Hover + Silhouettes
- Added `mouseRef` for tracking mouse position
- Added `mousemove` and `mouseleave` event listeners on WINDOW (not canvas - canvas has z-index:-1)
- Added `constellationContainsPoint()` hit detection
- Added `silhouettesRef` for preloaded PNG images
- Added `drawConstellationSilhouette()` rendering on hover (gets fresh image ref each frame)
- Shows constellation name + meaning on hover
- Smooth hover scale animation

**Bug Fix:** Canvas has `z-index: -1` so mouse events don't reach it. Changed to window-level mouse tracking.

### Planet Display + Hover
- Now uses real `planetData.ts` with all 10 planets (Sun + 9 orbiting)
- Each planet has: name, symbol, colors, size, orbitRadius, orbitSpeed
- Added `planetContainsPoint()` hit detection
- Added `drawPlanetLabel()` showing symbol + name on hover
- Saturn has ring rotation animation

### 3D Planet Rendering (Session 2)
- Installed `three` and `@types/three` packages
- Created `src/lib/Planet3D.ts` - Three.js based 3D planet renderer
- Features:
  - Rotating spheres with proper lighting
  - Gas giant bands (Jupiter, Saturn, Neptune)
  - Saturn and Uranus rings with texture
  - Earth with procedural continents/oceans
  - Planet-specific tilts
- Fallback chain: 3D → Image → Gradient circle
