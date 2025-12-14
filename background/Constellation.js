// Constellation class for real astronomical star patterns
//
// Constellation silhouette artwork by Johan Meuris
// Licensed under the Free Art License 1.3
// https://artlibre.org/licence/lal/en/
// Artwork source: Stellarium (https://stellarium.org/)
//
import { getColors } from './theme.js';

export class Constellation {
    constructor(canvas, constellationData, options = {}) {
        this.canvas = canvas;
        this.data = constellationData;
        this.stars = [];

        // Options for customization
        this.scale = options.scale || 1.0;
        this.showName = options.showName !== undefined ? options.showName : true;
        this.showStarNames = options.showStarNames || false;
        this.opacity = options.opacity || 1.0;
        this.showSilhouette = options.showSilhouette !== undefined ? options.showSilhouette : true;
        this.silhouettesPath = options.silhouettesPath || 'silhouettes/';

        // Silhouette image - can be preloaded or loaded on demand
        this.silhouetteImage = options.silhouetteImage || null;
        // Check complete property directly each frame instead of relying on onload
        this.silhouetteLoaded = false;

        if (!this.silhouetteImage && this.showSilhouette) {
            // No preloaded image, load our own
            this.loadSilhouette();
        }

        // Hover state
        this.isHovered = false;
        this.hoverScale = 1.0; // Animated scale for smooth transition
        this.targetHoverScale = 1.0;

        // Random position on canvas, avoiding center UI zone
        const padding = 100;

        // Define exclusion zone (center area where UI container sits)
        const exclusionZone = {
            left: canvas.width * 0.25,
            right: canvas.width * 0.75,
            top: canvas.height * 0.1,
            bottom: canvas.height * 0.9
        };

        // Place constellations in edge regions only
        const regions = [
            // Left edge
            { x: [padding, exclusionZone.left - 50], y: [padding, canvas.height - padding] },
            // Right edge
            { x: [exclusionZone.right + 50, canvas.width - padding], y: [padding, canvas.height - padding] },
            // Top edge (but not corners already covered)
            { x: [exclusionZone.left, exclusionZone.right], y: [padding, exclusionZone.top - 30] },
            // Bottom edge
            { x: [exclusionZone.left, exclusionZone.right], y: [exclusionZone.bottom + 30, canvas.height - padding] }
        ];

        // Pick a random valid region
        const region = regions[Math.floor(Math.random() * regions.length)];
        this.baseX = region.x[0] + Math.random() * (region.x[1] - region.x[0]);
        this.baseY = region.y[0] + Math.random() * (region.y[1] - region.y[0]);

        // Convert constellation data to canvas coordinates
        this.initStars();

        // Calculate label bounds for collision detection
        this.updateLabelBounds();
    }

    // Calculate the bounding box for this constellation's label
    updateLabelBounds() {
        const getX = s => Array.isArray(s) ? s[0] : s.x;
        const getY = s => Array.isArray(s) ? s[1] : s.y;
        const minY = Math.min(...this.data.stars.map(s => this.baseY + getY(s) * this.scale));
        const maxY = Math.max(...this.data.stars.map(s => this.baseY + getY(s) * this.scale));
        const minX = Math.min(...this.data.stars.map(s => this.baseX + getX(s) * this.scale));
        const maxX = Math.max(...this.data.stars.map(s => this.baseX + getX(s) * this.scale));

        // Larger bounds with more padding to prevent overlap
        const labelWidth = Math.max(this.data.name.length * 14 + 80, maxX - minX + 60);
        const labelHeight = 80; // More vertical space

        this.labelBounds = {
            x: this.baseX - labelWidth / 2,
            y: minY - 60,
            width: labelWidth,
            height: labelHeight + (maxY - minY) // Include star area too
        };
    }

    // Check if this constellation's label overlaps with another's (with padding)
    labelsOverlap(other, padding = 30) {
        const a = this.labelBounds;
        const b = other.labelBounds;

        // Add padding to create more separation
        return !(a.x + a.width + padding < b.x ||
                 b.x + b.width + padding < a.x ||
                 a.y + a.height + padding < b.y ||
                 b.y + b.height + padding < a.y);
    }

    // Check if a point (mouse) is over this constellation
    containsPoint(x, y) {
        // First check label bounds (stars + label)
        const bounds = this.labelBounds;
        if (x >= bounds.x && x <= bounds.x + bounds.width &&
            y >= bounds.y && y <= bounds.y + bounds.height) {
            return true;
        }

        // Also check silhouette bounds if we have sprite config
        const silhouetteBounds = this.getSilhouetteBounds();
        if (silhouetteBounds) {
            return x >= silhouetteBounds.x && x <= silhouetteBounds.x + silhouetteBounds.width &&
                   y >= silhouetteBounds.y && y <= silhouetteBounds.y + silhouetteBounds.height;
        }

        return false;
    }

    // Calculate where the silhouette PNG will be drawn
    getSilhouetteBounds() {
        const spriteConfig = this.data.sprite;
        if (!spriteConfig || !spriteConfig.anchors || spriteConfig.anchors.length < 2 || !spriteConfig.imageSize) {
            return null;
        }

        const anchor1 = spriteConfig.anchors[0];
        const anchor2 = spriteConfig.anchors[1];

        const star1 = this.stars[anchor1.starIndex];
        const star2 = this.stars[anchor2.starIndex];
        if (!star1 || !star2) return null;

        // Calculate distances
        const imgDx = anchor2.imgPos[0] - anchor1.imgPos[0];
        const imgDy = anchor2.imgPos[1] - anchor1.imgPos[1];
        const imgDist = Math.sqrt(imgDx * imgDx + imgDy * imgDy);

        const canvasDx = star2.x - star1.x;
        const canvasDy = star2.y - star1.y;
        const canvasDist = Math.sqrt(canvasDx * canvasDx + canvasDy * canvasDy);

        // Calculate scale
        const scale = canvasDist / imgDist;

        // Image dimensions at this scale
        const imgWidth = spriteConfig.imageSize[0] * scale;
        const imgHeight = spriteConfig.imageSize[1] * scale;

        // Position where image will be drawn
        const drawX = star1.x - (anchor1.imgPos[0] * scale);
        const drawY = star1.y - (anchor1.imgPos[1] * scale);

        return {
            x: drawX,
            y: drawY,
            width: imgWidth,
            height: imgHeight
        };
    }

    // Update hover animation (call each frame)
    updateHover() {
        this.targetHoverScale = this.isHovered ? 1.15 : 1.0;
        // Smooth interpolation
        this.hoverScale += (this.targetHoverScale - this.hoverScale) * 0.15;
    }

    initStars() {
        this.stars = this.data.stars.map((star, i) => {
            const isArray = Array.isArray(star);
            const x = isArray ? star[0] : star.x;
            const y = isArray ? star[1] : star.y;
            const brightness = isArray ? 2 : (star.brightness || 2);
            return {
                name: isArray ? 'Star ' + (i + 1) : star.name,
                x: this.baseX + (x * this.scale),
                y: this.baseY + (y * this.scale),
                brightness: brightness,
                size: Math.max(1, 5 - brightness)
            };
        });
    }

    // Load PNG silhouette image (Stellarium artwork by Johan Meuris)
    loadSilhouette() {
        // Generate filename from constellation name (lowercase, replace spaces with dashes)
        // Matches Stellarium naming convention: "Ursa Major" -> "ursa-major.png"
        const filename = this.data.name.toLowerCase().replace(/\s+/g, '-') + '.png';
        const src = this.silhouettesPath + filename;

        this.silhouetteImage = new Image();
        this.silhouetteImage.onload = () => {
            this.silhouetteLoaded = true;
        };
        this.silhouetteImage.onerror = () => {
            // PNG not found - fall back to vector paths if available
            this.silhouetteLoaded = false;
            this.silhouetteImage = null;
        };
        this.silhouetteImage.src = src;
    }

    // Draw silhouette figure (PNG image or fallback to vector paths)
    drawSilhouette(ctx) {
        if (!this.isHovered) return;

        const fadeProgress = (this.hoverScale - 1.0) / 0.15;
        const opacity = 1.0 * Math.min(1, fadeProgress * 2);  // Full opacity silhouettes
        const bounds = this.getBounds();
        const cx = (bounds.minX + bounds.maxX) / 2;
        const cy = (bounds.minY + bounds.maxY) / 2;

        ctx.save();

        // Try to draw PNG image first (check complete directly to avoid shared image issues)
        if (this.silhouetteImage && this.silhouetteImage.complete && this.silhouetteImage.naturalHeight > 0) {
            const spriteConfig = this.data.sprite || {};

            let drawX, drawY, imgWidth, imgHeight;

            // Use anchor-based alignment if available
            if (spriteConfig.anchors && spriteConfig.anchors.length >= 2 && spriteConfig.imageSize) {
                // Get two anchor points for alignment
                const anchor1 = spriteConfig.anchors[0];
                const anchor2 = spriteConfig.anchors[1];

                // Get actual star positions on canvas - validate indices
                const star1 = this.stars[anchor1.starIndex];
                const star2 = this.stars[anchor2.starIndex];

                // Skip if stars don't exist (invalid anchor config)
                if (!star1 || !star2) {
                    ctx.restore();
                    return;
                }

                // Calculate distances
                const imgDx = anchor2.imgPos[0] - anchor1.imgPos[0];
                const imgDy = anchor2.imgPos[1] - anchor1.imgPos[1];
                const imgDist = Math.sqrt(imgDx * imgDx + imgDy * imgDy);

                const canvasDx = star2.x - star1.x;
                const canvasDy = star2.y - star1.y;
                const canvasDist = Math.sqrt(canvasDx * canvasDx + canvasDy * canvasDy);

                // Calculate scale to match star distances
                const scale = canvasDist / imgDist;

                // Image dimensions at this scale
                imgWidth = spriteConfig.imageSize[0] * scale;
                imgHeight = spriteConfig.imageSize[1] * scale;

                // Position image so anchor1 in image aligns with star1 on canvas
                drawX = star1.x - (anchor1.imgPos[0] * scale);
                drawY = star1.y - (anchor1.imgPos[1] * scale);

            } else {
                // Fallback: center-based positioning
                const constellationWidth = bounds.width || 100;
                const constellationHeight = bounds.height || 100;
                const imgScale = (spriteConfig.scale || 1.2) * this.scale;
                const offsetX = (spriteConfig.offsetX || 0) * this.scale;
                const offsetY = (spriteConfig.offsetY || 0) * this.scale;

                const targetSize = Math.max(constellationWidth, constellationHeight) * imgScale;
                imgWidth = targetSize;
                imgHeight = targetSize;

                drawX = cx - imgWidth / 2 + offsetX;
                drawY = cy - imgHeight / 2 + offsetY;
            }

            // Apply ethereal glow effect
            ctx.shadowBlur = 40;
            ctx.shadowColor = 'rgba(120, 170, 220, 1.0)';

            // Set opacity for the image
            ctx.globalAlpha = this.opacity * opacity;

            // Draw the PNG image (already has transparency and blue tint from preprocessing)
            ctx.drawImage(this.silhouetteImage, drawX, drawY, imgWidth, imgHeight);

            ctx.restore();
            return;
        }

        // Fallback: Draw vector paths if no SVG or SVG failed to load
        if (!this.data.figure || !this.data.figure.paths) {
            ctx.restore();
            return;
        }

        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(150, 180, 220, 0.7)';
        ctx.strokeStyle = 'rgba(150, 180, 220, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        this.data.figure.paths.forEach(path => {
            if (path.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(cx + path[0][0] * this.scale, cy + path[0][1] * this.scale);
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(cx + path[i][0] * this.scale, cy + path[i][1] * this.scale);
            }
            ctx.stroke();
        });
        ctx.restore();
    }

    draw(ctx) {
        const colors = getColors();

        // Update hover animation
        this.updateHover();

        // Draw silhouette behind everything else
        if (this.showSilhouette) {
            this.drawSilhouette(ctx);
        }

        // Hover multipliers
        const glowMultiplier = this.isHovered ? 2.5 : 1;
        const brightnessBoost = this.isHovered ? 0.4 : 0;
        const lineOpacity = this.isHovered ? 0.35 : 0.7;  // Reduced when hovered so silhouette shows through
        const lineWidth = this.isHovered ? 1.5 : 1.5;     // Thinner lines when hovered

        // Draw connection lines
        ctx.strokeStyle = this.isHovered ? '#d4af37' : colors.line;
        ctx.globalAlpha = this.opacity * lineOpacity;
        ctx.lineWidth = lineWidth;

        if (this.isHovered) {
            ctx.shadowBlur = 3;  // Reduced glow so lines don't compete with silhouette
            ctx.shadowColor = 'rgba(212, 175, 55, 0.3)';
        }

        this.data.connections.forEach(([startIdx, endIdx]) => {
            const start = this.stars[startIdx];
            const end = this.stars[endIdx];

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        });

        ctx.shadowBlur = 0;

        // Draw stars
        this.stars.forEach(star => {
            // Star glow - enhanced on hover
            ctx.shadowBlur = star.size * 2 * glowMultiplier;
            ctx.shadowColor = this.isHovered ? '#ffffff' : colors.star;

            // Calculate opacity based on brightness - brighter on hover
            const starOpacity = Math.min(1, Math.max(0.4, 1 - (star.brightness / 6) + brightnessBoost)) * this.opacity;
            ctx.globalAlpha = starOpacity;

            // Star size slightly bigger on hover
            const starSize = star.size * this.hoverScale;

            ctx.fillStyle = this.isHovered ? '#ffffff' : colors.star;
            ctx.beginPath();
            ctx.arc(star.x, star.y, starSize, 0, Math.PI * 2);
            ctx.fill();

            // Draw star names if enabled
            if (this.showStarNames) {
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 0.6 * this.opacity;
                ctx.fillStyle = colors.star;
                ctx.font = '10px monospace';
                ctx.fillText(star.name, star.x + 8, star.y - 8);
            }
        });

        ctx.shadowBlur = 0;

        // Draw constellation name
        if (this.showName) {
            const minY = Math.min(...this.stars.map(s => s.y));

            // Hover-enhanced values
            const fontSize = this.isHovered ? 17 : 14;
            const descFontSize = this.isHovered ? 19 : 16;
            const glowSize = this.isHovered ? 15 : 8;
            const textOpacity = this.isHovered ? 1.0 : 0.9;

            // Add glow effect to text - stronger on hover
            ctx.shadowBlur = glowSize;
            ctx.shadowColor = this.isHovered ? 'rgba(212, 175, 55, 0.9)' : 'rgba(212, 175, 55, 0.6)';

            ctx.globalAlpha = textOpacity * this.opacity;
            ctx.fillStyle = this.isHovered ? '#ffd700' : '#d4af37';
            ctx.font = `500 ${fontSize}px "Cinzel", "Times New Roman", serif`;
            ctx.textAlign = 'left';

            // Add letter spacing manually by drawing each character
            const name = this.data.name.toUpperCase();
            const spacing = this.isHovered ? 5 : 4;

            // Calculate total width first
            let totalWidth = 0;
            for (let i = 0; i < name.length; i++) {
                totalWidth += ctx.measureText(name[i]).width;
                if (i < name.length - 1) totalWidth += spacing;
            }

            // Start position (centered)
            let x = this.baseX - totalWidth / 2;

            // Draw each character
            for (let i = 0; i < name.length; i++) {
                const charWidth = ctx.measureText(name[i]).width;
                ctx.fillText(name[i], x, minY - 25);
                x += charWidth + spacing;
            }

            // Optional: Draw description/meaning
            const subtitle = this.data.description || this.data.meaning;
            if (subtitle) {
                ctx.shadowBlur = this.isHovered ? 10 : 0;
                ctx.globalAlpha = (this.isHovered ? 0.9 : 0.7) * this.opacity;
                ctx.font = `400 ${descFontSize}px "Parisienne", cursive`;
                ctx.textAlign = 'center';
                ctx.fillStyle = this.isHovered ? '#ffd700' : '#d4af37';
                // Fake bold by drawing text twice with slight offset
                ctx.fillText(subtitle, this.baseX, minY - 6);
                ctx.fillText(subtitle, this.baseX + 0.5, minY - 6);
            }

            ctx.shadowBlur = 0;
        }

        // Reset
        ctx.globalAlpha = 1.0;
        ctx.textAlign = 'left';
    }

    // Check if constellation is visible on canvas
    isVisible() {
        return this.stars.some(star =>
            star.x >= 0 && star.x <= this.canvas.width &&
            star.y >= 0 && star.y <= this.canvas.height
        );
    }

    // Reposition constellation (useful for resize)
    reposition(newBaseX, newBaseY) {
        const deltaX = newBaseX - this.baseX;
        const deltaY = newBaseY - this.baseY;

        this.baseX = newBaseX;
        this.baseY = newBaseY;

        this.stars.forEach(star => {
            star.x += deltaX;
            star.y += deltaY;
        });
    }

    // Get bounding box
    getBounds() {
        const xs = this.stars.map(s => s.x);
        const ys = this.stars.map(s => s.y);

        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys),
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys)
        };
    }
}
