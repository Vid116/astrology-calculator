'use client';

import { useEffect, useRef, useCallback } from 'react';
import { CONSTELLATIONS, ConstellationData } from '@/data/constellationData';
import { PLANETS, PlanetData, getOrbitingPlanets } from '@/data/planetData';
import { Planet3D } from '@/lib/Planet3D';

// Constellations without silhouette PNGs
const MISSING_SPRITES = ['PUPPIS', 'SERPENS', 'VELA', 'CARINA'];

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
}

interface RenderedStar {
  name: string;
  x: number;
  y: number;
  brightness: number;
  size: number;
}

interface RenderedConstellation {
  data: ConstellationData;
  key: string;
  baseX: number;
  baseY: number;
  scale: number;
  stars: RenderedStar[];
  isHovered: boolean;
  hoverScale: number;
  silhouetteImage: HTMLImageElement | null;
  labelBounds: { x: number; y: number; width: number; height: number };
}

interface RenderedPlanet {
  data: PlanetData;
  centerX: number;
  centerY: number;
  x: number;
  y: number;
  angle: number;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  isHovered: boolean;
  pulsePhase: number;
  planetImage: HTMLImageElement | null;
  planet3D: Planet3D | null;
}

export function CelestialBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const planetsRef = useRef<RenderedPlanet[]>([]);
  const constellationsRef = useRef<RenderedConstellation[]>([]);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const silhouettesRef = useRef<Record<string, HTMLImageElement>>({});

  const getColors = useCallback(() => {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    if (theme === 'dark') {
      return {
        bg: '#050810',
        star: '#ffffff',
        starRgb: '255, 255, 255',
        line: 'rgba(212, 175, 55, 0.3)',
        trail: 'rgba(212, 175, 55, 0.1)',
      };
    }
    return {
      bg: '#0a0e1a',
      star: '#e2e8f0',
      starRgb: '226, 232, 240',
      line: 'rgba(212, 175, 55, 0.2)',
      trail: 'rgba(212, 175, 55, 0.05)',
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Preload silhouette images
    const preloadSilhouettes = () => {
      Object.keys(CONSTELLATIONS).forEach(key => {
        const data = CONSTELLATIONS[key];
        if (data.sprite && !MISSING_SPRITES.includes(key)) {
          const img = new Image();
          const filename = key.toLowerCase().replace(/_/g, '-') + '.png';
          img.src = '/silhouettes/' + filename;
          silhouettesRef.current[key] = img;
        }
      });
    };

    // Preload planet images
    const preloadPlanetImages = () => {
      Object.values(PLANETS).forEach(planet => {
        if (planet.image && !planet.isStar) {
          const img = new Image();
          img.src = '/planets/' + planet.image;
          (planet as PlanetData & { loadedImage?: HTMLImageElement }).loadedImage = img;
        }
      });
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStar = (): Star => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      opacity: Math.random(),
      twinkleSpeed: Math.random() * 0.02,
    });

    const createRenderedConstellation = (
      data: ConstellationData,
      key: string,
      existingConstellations: RenderedConstellation[]
    ): RenderedConstellation | null => {
      const scale = 0.7;
      const padding = 100;

      // Define exclusion zone (center area where UI sits)
      const exclusionZone = {
        left: canvas.width * 0.25,
        right: canvas.width * 0.75,
        top: canvas.height * 0.1,
        bottom: canvas.height * 0.9
      };

      // Place in edge regions only
      const regions = [
        { x: [padding, exclusionZone.left - 50], y: [padding, canvas.height - padding] },
        { x: [exclusionZone.right + 50, canvas.width - padding], y: [padding, canvas.height - padding] },
        { x: [exclusionZone.left, exclusionZone.right], y: [padding, exclusionZone.top - 30] },
        { x: [exclusionZone.left, exclusionZone.right], y: [exclusionZone.bottom + 30, canvas.height - padding] }
      ];

      // Try to find non-overlapping position
      for (let attempt = 0; attempt < 25; attempt++) {
        const region = regions[Math.floor(Math.random() * regions.length)];
        const baseX = region.x[0] + Math.random() * (region.x[1] - region.x[0]);
        const baseY = region.y[0] + Math.random() * (region.y[1] - region.y[0]);

        // Create stars for this constellation
        const stars: RenderedStar[] = data.stars.map((star, i) => {
          const x = star[0];
          const y = star[1];
          const sizeMultiplier = star[2] || 1;
          return {
            name: 'Star ' + (i + 1),
            x: baseX + (x * scale),
            y: baseY + (y * scale),
            brightness: 2,
            size: Math.max(1, 4 - 2) * (1 + (sizeMultiplier - 1) * 0.33)
          };
        });

        // Calculate bounds
        const xs = stars.map(s => s.x);
        const ys = stars.map(s => s.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const labelWidth = Math.max(data.name.length * 14 + 80, maxX - minX + 60);
        const labelHeight = 80 + (maxY - minY);

        const bounds = {
          x: baseX - labelWidth / 2,
          y: minY - 60,
          width: labelWidth,
          height: labelHeight
        };

        // Check overlap with existing
        const overlaps = existingConstellations.some(other => {
          const a = bounds;
          const b = other.labelBounds;
          const pad = 30;
          return !(a.x + a.width + pad < b.x ||
                   b.x + b.width + pad < a.x ||
                   a.y + a.height + pad < b.y ||
                   b.y + b.height + pad < a.y);
        });

        if (!overlaps) {
          return {
            data,
            key,
            baseX,
            baseY,
            scale,
            stars,
            isHovered: false,
            hoverScale: 1.0,
            silhouetteImage: silhouettesRef.current[key] || null,
            labelBounds: bounds
          };
        }
      }
      return null;
    };

    const createRenderedPlanet = (
      planetData: PlanetData,
      centerX: number,
      centerY: number,
      options: { scale: number; orbitScale: number; speedMultiplier: number; orbitTilt: number }
    ): RenderedPlanet => {
      const img = new Image();
      if (planetData.image && !planetData.isStar) {
        img.src = '/planets/' + planetData.image;
      }

      // Create 3D planet for all planets except Sun
      let planet3D: Planet3D | null = null;
      if (!planetData.isStar) {
        try {
          const resolution = planetData.hasRings ? 256 : 128;
          planet3D = new Planet3D(planetData.name, resolution);
        } catch (e) {
          console.error('Failed to create 3D planet:', e);
        }
      }

      return {
        data: planetData,
        centerX,
        centerY,
        x: planetData.isStar ? centerX : 0,
        y: planetData.isStar ? centerY : 0,
        angle: Math.random() * Math.PI * 2,
        size: planetData.size * options.scale,
        orbitRadius: planetData.orbitRadius * options.orbitScale,
        orbitSpeed: planetData.orbitSpeed * options.speedMultiplier,
        isHovered: false,
        pulsePhase: Math.random() * Math.PI * 2,
        planetImage: planetData.image ? img : null,
        planet3D
      };
    };

    const init = () => {
      resizeCanvas();
      preloadSilhouettes();
      preloadPlanetImages();

      // Create stars
      starsRef.current = [];
      for (let i = 0; i < 120; i++) {
        starsRef.current.push(createStar());
      }

      // Create planets
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const planetOptions = {
        scale: 1.0,
        orbitScale: 0.8,
        speedMultiplier: 0.4,
        orbitTilt: 0.6
      };

      planetsRef.current = [];

      // Add Sun
      planetsRef.current.push(createRenderedPlanet(PLANETS.SUN, centerX, centerY, planetOptions));

      // Add all orbiting planets
      getOrbitingPlanets().forEach(planet => {
        planetsRef.current.push(createRenderedPlanet(planet, centerX, centerY, planetOptions));
      });

      // Create constellations (pick 12 random unique ones)
      constellationsRef.current = [];
      const usedKeys = new Set<string>();
      const constellationKeys = Object.keys(CONSTELLATIONS);

      for (let i = 0; i < 12 && i < constellationKeys.length; i++) {
        let attempts = 0;
        let key: string;

        do {
          key = constellationKeys[Math.floor(Math.random() * constellationKeys.length)];
          attempts++;
        } while (usedKeys.has(key) && attempts < 20);

        if (!usedKeys.has(key)) {
          usedKeys.add(key);
          const constellation = createRenderedConstellation(
            CONSTELLATIONS[key],
            key,
            constellationsRef.current
          );
          if (constellation) {
            constellationsRef.current.push(constellation);
          }
        }
      }
    };

    // Check if point is inside constellation bounds
    const constellationContainsPoint = (c: RenderedConstellation, x: number, y: number): boolean => {
      const bounds = c.labelBounds;
      if (x >= bounds.x && x <= bounds.x + bounds.width &&
          y >= bounds.y && y <= bounds.y + bounds.height) {
        return true;
      }

      // Also check silhouette bounds
      const spriteConfig = c.data.sprite;
      if (spriteConfig?.anchors?.length >= 2 && spriteConfig.imageSize) {
        const anchor1 = spriteConfig.anchors[0];
        const anchor2 = spriteConfig.anchors[1];
        const star1 = c.stars[anchor1.starIndex];
        const star2 = c.stars[anchor2.starIndex];

        if (star1 && star2) {
          const imgDx = anchor2.imgPos[0] - anchor1.imgPos[0];
          const imgDy = anchor2.imgPos[1] - anchor1.imgPos[1];
          const imgDist = Math.sqrt(imgDx * imgDx + imgDy * imgDy);
          const canvasDx = star2.x - star1.x;
          const canvasDy = star2.y - star1.y;
          const canvasDist = Math.sqrt(canvasDx * canvasDx + canvasDy * canvasDy);

          const baseScale = canvasDist / imgDist;
          const silhouetteMultiplier = spriteConfig.silhouetteScale || 1.8;
          const scale = baseScale * silhouetteMultiplier;

          const imgWidth = spriteConfig.imageSize[0] * scale;
          const imgHeight = spriteConfig.imageSize[1] * scale;
          const baseDrawX = star1.x - (anchor1.imgPos[0] * baseScale);
          const baseDrawY = star1.y - (anchor1.imgPos[1] * baseScale);
          const baseWidth = spriteConfig.imageSize[0] * baseScale;
          const baseHeight = spriteConfig.imageSize[1] * baseScale;
          const drawX = baseDrawX - (imgWidth - baseWidth) / 2;
          const drawY = baseDrawY - (imgHeight - baseHeight) / 2;

          return x >= drawX && x <= drawX + imgWidth && y >= drawY && y <= drawY + imgHeight;
        }
      }

      return false;
    };

    // Check if point is inside planet
    const planetContainsPoint = (p: RenderedPlanet, x: number, y: number): boolean => {
      const dx = x - p.x;
      const dy = y - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const hitSize = p.data.hasRings ? p.size * 3.5 : p.size * 2;
      return distance <= hitSize;
    };

    const drawStar = (star: Star) => {
      const colors = getColors();
      star.opacity += star.twinkleSpeed;
      if (star.opacity > 1 || star.opacity < 0) {
        star.twinkleSpeed = -star.twinkleSpeed;
      }

      ctx.fillStyle = `rgba(${colors.starRgb}, ${star.opacity})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawConstellationSilhouette = (c: RenderedConstellation) => {
      if (!c.isHovered) return;

      // Always get fresh reference - images load async
      const img = silhouettesRef.current[c.key];
      if (!img || !img.complete || img.naturalHeight === 0) return;

      const spriteConfig = c.data.sprite;
      if (!spriteConfig?.anchors?.length || spriteConfig.anchors.length < 2 || !spriteConfig.imageSize) return;

      const anchor1 = spriteConfig.anchors[0];
      const anchor2 = spriteConfig.anchors[1];
      const star1 = c.stars[anchor1.starIndex];
      const star2 = c.stars[anchor2.starIndex];

      if (!star1 || !star2) return;

      const fadeProgress = (c.hoverScale - 1.0) / 0.15;
      const opacity = Math.min(1, fadeProgress * 2);

      // Calculate scale and position
      const imgDx = anchor2.imgPos[0] - anchor1.imgPos[0];
      const imgDy = anchor2.imgPos[1] - anchor1.imgPos[1];
      const imgDist = Math.sqrt(imgDx * imgDx + imgDy * imgDy);
      const canvasDx = star2.x - star1.x;
      const canvasDy = star2.y - star1.y;
      const canvasDist = Math.sqrt(canvasDx * canvasDx + canvasDy * canvasDy);

      const baseScale = canvasDist / imgDist;
      const silhouetteMultiplier = spriteConfig.silhouetteScale || 1.8;
      const scale = baseScale * silhouetteMultiplier;

      const imgWidth = spriteConfig.imageSize[0] * scale;
      const imgHeight = spriteConfig.imageSize[1] * scale;
      const baseDrawX = star1.x - (anchor1.imgPos[0] * baseScale);
      const baseDrawY = star1.y - (anchor1.imgPos[1] * baseScale);
      const baseWidth = spriteConfig.imageSize[0] * baseScale;
      const baseHeight = spriteConfig.imageSize[1] * baseScale;
      const drawX = baseDrawX - (imgWidth - baseWidth) / 2;
      const drawY = baseDrawY - (imgHeight - baseHeight) / 2;

      ctx.save();
      ctx.shadowBlur = 40;
      ctx.shadowColor = 'rgba(120, 170, 220, 1.0)';
      ctx.globalAlpha = opacity;
      ctx.drawImage(img, drawX, drawY, imgWidth, imgHeight);
      ctx.restore();
    };

    const drawConstellation = (c: RenderedConstellation) => {
      const colors = getColors();

      // Update hover animation
      const targetScale = c.isHovered ? 1.15 : 1.0;
      c.hoverScale += (targetScale - c.hoverScale) * 0.15;

      // Draw silhouette first (behind everything)
      drawConstellationSilhouette(c);

      // Hover multipliers
      const glowMultiplier = c.isHovered ? 2.5 : 1;
      const brightnessBoost = c.isHovered ? 0.4 : 0;
      const lineOpacity = c.isHovered ? 0.35 : 0.7;

      // Draw connection lines
      ctx.strokeStyle = c.isHovered ? '#d4af37' : colors.line;
      ctx.globalAlpha = lineOpacity;
      ctx.lineWidth = 1.5;

      if (c.isHovered) {
        ctx.shadowBlur = 3;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.3)';
      }

      c.data.connections.forEach(([startIdx, endIdx]) => {
        const start = c.stars[startIdx];
        const end = c.stars[endIdx];
        if (start && end) {
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        }
      });

      ctx.shadowBlur = 0;

      // Draw stars
      c.stars.forEach(star => {
        ctx.shadowBlur = star.size * 2 * glowMultiplier;
        ctx.shadowColor = c.isHovered ? '#ffffff' : colors.star;

        const starOpacity = Math.min(1, Math.max(0.4, 1 - (star.brightness / 6) + brightnessBoost));
        ctx.globalAlpha = starOpacity;

        const starSize = star.size * c.hoverScale;
        ctx.fillStyle = c.isHovered ? '#ffffff' : colors.star;
        ctx.beginPath();
        ctx.arc(star.x, star.y, starSize, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 0;

      // Draw name on hover
      if (c.isHovered) {
        const minY = Math.min(...c.stars.map(s => s.y));

        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.9)';
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#ffd700';
        ctx.font = '500 17px "Cinzel", "Times New Roman", serif';
        ctx.textAlign = 'center';

        // Draw name with letter spacing
        const name = c.data.name.toUpperCase();
        const spacing = 5;
        let totalWidth = 0;
        for (let i = 0; i < name.length; i++) {
          totalWidth += ctx.measureText(name[i]).width;
          if (i < name.length - 1) totalWidth += spacing;
        }

        let x = c.baseX - totalWidth / 2;
        ctx.textAlign = 'left';
        for (let i = 0; i < name.length; i++) {
          const charWidth = ctx.measureText(name[i]).width;
          ctx.fillText(name[i], x, minY - 25);
          x += charWidth + spacing;
        }

        // Draw meaning
        if (c.data.meaning) {
          ctx.shadowBlur = 10;
          ctx.globalAlpha = 0.9;
          ctx.font = '400 19px "Parisienne", cursive';
          ctx.textAlign = 'center';
          ctx.fillText(c.data.meaning, c.baseX, minY - 6);
        }

        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1.0;
      ctx.textAlign = 'left';
    };

    const updatePlanet = (p: RenderedPlanet) => {
      if (p.data.isStar) {
        p.pulsePhase += 0.02;
        return;
      }

      p.angle += p.orbitSpeed;
      p.x = p.centerX + Math.cos(p.angle) * p.orbitRadius;
      p.y = p.centerY + Math.sin(p.angle) * p.orbitRadius * 0.4; // Tilt
    };

    const drawOrbitLine = (p: RenderedPlanet) => {
      if (p.data.isStar || p.orbitRadius === 0) return;

      const colors = getColors();

      ctx.save();
      ctx.strokeStyle = p.isHovered
        ? `rgba(${hexToRgb(p.data.colors.glow)}, 0.4)`
        : colors.line;
      ctx.lineWidth = p.isHovered ? 1.5 : 0.5;
      ctx.setLineDash([5, 10]);

      // Draw elliptical orbit
      ctx.beginPath();
      ctx.ellipse(
        p.centerX,
        p.centerY,
        p.orbitRadius,
        p.orbitRadius * 0.4, // Same tilt as planet movement
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    };

    // Helper to convert hex to rgb
    const hexToRgb = (hex: string): string => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
      }
      return '212, 175, 55';
    };

    const drawPlanetLabel = (p: RenderedPlanet) => {
      const labelY = p.y - p.size - 15;

      ctx.font = 'bold 18px serif';
      ctx.fillStyle = p.data.colors.glow;
      ctx.textAlign = 'center';
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.data.colors.glow;
      ctx.fillText(p.data.symbol, p.x, labelY);

      ctx.font = '500 12px "Cinzel", serif';
      ctx.fillStyle = '#d4af37';
      ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
      ctx.fillText(p.data.name.toUpperCase(), p.x, labelY + 16);

      ctx.shadowBlur = 0;
    };

    const drawPlanet = (p: RenderedPlanet) => {
      if (p.data.isStar) {
        // Draw Sun - clean and simple
        const time = p.pulsePhase;
        const pulseAmount = Math.sin(time) * 0.1 + 1;

        // Outer glow
        const glowSize = p.size * 3 * pulseAmount;
        const glow = ctx.createRadialGradient(p.x, p.y, p.size * 0.5, p.x, p.y, glowSize);
        glow.addColorStop(0, 'rgba(255, 200, 80, 0.4)');
        glow.addColorStop(0.5, 'rgba(255, 150, 50, 0.15)');
        glow.addColorStop(1, 'rgba(255, 100, 0, 0)');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Sun surface with limb darkening
        const surfaceSize = p.size * pulseAmount;
        const surface = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, surfaceSize);
        surface.addColorStop(0, '#fffef0');
        surface.addColorStop(0.5, '#ffee88');
        surface.addColorStop(0.8, '#ffaa33');
        surface.addColorStop(1, '#dd6600');

        ctx.fillStyle = surface;
        ctx.beginPath();
        ctx.arc(p.x, p.y, surfaceSize, 0, Math.PI * 2);
        ctx.fill();

        // Bright core highlight
        const core = ctx.createRadialGradient(
          p.x - p.size * 0.2, p.y - p.size * 0.2, 0,
          p.x, p.y, p.size * 0.6
        );
        core.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        core.addColorStop(0.4, 'rgba(255, 255, 200, 0.3)');
        core.addColorStop(1, 'rgba(255, 255, 150, 0)');

        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        if (p.isHovered) {
          drawPlanetLabel(p);
        }
        return;
      }

      // Regular planet
      ctx.shadowBlur = p.isHovered ? 20 : 8;
      ctx.shadowColor = p.data.colors.glow;

      // Try 3D rendering first (preferred)
      if (p.planet3D && !p.planet3D.disabled) {
        const planetCanvas = p.planet3D.getCanvas();
        if (planetCanvas) {
          const sizeMultiplier = p.data.hasRings ? 3.5 : 2;
          const imgSize = p.size * sizeMultiplier;

          ctx.drawImage(planetCanvas, p.x - imgSize, p.y - imgSize, imgSize * 2, imgSize * 2);
          ctx.shadowBlur = 0;

          if (p.isHovered) {
            drawPlanetLabel(p);
          }
          return;
        }
      }

      // Fallback to image
      if (p.planetImage && p.planetImage.complete && p.planetImage.naturalHeight > 0) {
        const sizeMultiplier = p.data.hasRings ? 3.5 : 2;
        const imgSize = p.size * sizeMultiplier;

        if (p.data.hasRings) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(Math.cos(p.angle) * 0.3 + 0.7);
          ctx.drawImage(p.planetImage, -imgSize, -imgSize, imgSize * 2, imgSize * 2);
          ctx.restore();
        } else {
          ctx.drawImage(p.planetImage, p.x - imgSize, p.y - imgSize, imgSize * 2, imgSize * 2);
        }
      } else {
        // Final fallback: gradient circle
        if (p.data.hasRings) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.scale(1, 0.3);
          ctx.strokeStyle = p.data.ringColor || 'rgba(210, 180, 140, 0.4)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 1.8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 1.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        const gradient = ctx.createRadialGradient(
          p.x - p.size / 3, p.y - p.size / 3, 0,
          p.x, p.y, p.size
        );
        gradient.addColorStop(0, p.data.colors.light);
        gradient.addColorStop(1, p.data.colors.dark);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;

      if (p.isHovered) {
        drawPlanetLabel(p);
      }
    };

    const animate = () => {
      const colors = getColors();
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update hover states
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      constellationsRef.current.forEach(c => {
        c.isHovered = constellationContainsPoint(c, mx, my);
      });

      planetsRef.current.forEach(p => {
        p.isHovered = planetContainsPoint(p, mx, my);
      });

      // Draw everything
      starsRef.current.forEach(drawStar);
      constellationsRef.current.forEach(drawConstellation);

      // Draw orbit lines first (behind planets)
      planetsRef.current.forEach(drawOrbitLine);

      // Update all planet positions first
      planetsRef.current.forEach(updatePlanet);

      // Sort planets by depth (y position) - smaller y = further away = draw first
      // Sun (isStar) should be drawn at its y position in the sort order
      const sortedPlanets = [...planetsRef.current].sort((a, b) => {
        // Use y position for depth - planets with smaller y are "behind"
        return a.y - b.y;
      });

      // Draw planets in depth order (back to front)
      sortedPlanets.forEach(drawPlanet);

      animationRef.current = requestAnimationFrame(animate);
    };

    // Mouse tracking - use window level since canvas is z-index: -1
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    init();
    animate();

    // Use window events since canvas is behind other elements
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      init();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationRef.current);

      // Dispose Planet3D instances
      planetsRef.current.forEach(p => {
        if (p.planet3D) {
          p.planet3D.dispose();
        }
      });
    };
  }, [getColors]);

  return <canvas ref={canvasRef} id="celestial-canvas" className="celestial-canvas" />;
}
