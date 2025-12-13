// Constellation class for real astronomical star patterns
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
        const minY = Math.min(...this.data.stars.map(s => this.baseY + s.y * this.scale));
        const maxY = Math.max(...this.data.stars.map(s => this.baseY + s.y * this.scale));
        const minX = Math.min(...this.data.stars.map(s => this.baseX + s.x * this.scale));
        const maxX = Math.max(...this.data.stars.map(s => this.baseX + s.x * this.scale));

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
        const bounds = this.labelBounds;
        return x >= bounds.x && x <= bounds.x + bounds.width &&
               y >= bounds.y && y <= bounds.y + bounds.height;
    }

    // Update hover animation (call each frame)
    updateHover() {
        this.targetHoverScale = this.isHovered ? 1.15 : 1.0;
        // Smooth interpolation
        this.hoverScale += (this.targetHoverScale - this.hoverScale) * 0.15;
    }

    initStars() {
        this.stars = this.data.stars.map(star => ({
            name: star.name,
            x: this.baseX + (star.x * this.scale),
            y: this.baseY + (star.y * this.scale),
            brightness: star.brightness,
            // Calculate star size based on brightness (lower magnitude = brighter = larger)
            // Magnitude 0 = size 4, Magnitude 5 = size 1
            size: Math.max(1, 5 - star.brightness)
        }));
    }

    draw(ctx) {
        const colors = getColors();

        // Update hover animation
        this.updateHover();

        // Hover multipliers
        const glowMultiplier = this.isHovered ? 2.5 : 1;
        const brightnessBoost = this.isHovered ? 0.4 : 0;
        const lineOpacity = this.isHovered ? 1.0 : 0.7;
        const lineWidth = this.isHovered ? 2.5 : 1.5;

        // Draw connection lines
        ctx.strokeStyle = this.isHovered ? '#d4af37' : colors.line;
        ctx.globalAlpha = this.opacity * lineOpacity;
        ctx.lineWidth = lineWidth;

        if (this.isHovered) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';
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

            // Optional: Draw description
            if (this.data.description) {
                ctx.shadowBlur = this.isHovered ? 10 : 0;
                ctx.globalAlpha = (this.isHovered ? 0.9 : 0.7) * this.opacity;
                ctx.font = `400 ${descFontSize}px "Parisienne", cursive`;
                ctx.textAlign = 'center';
                ctx.fillStyle = this.isHovered ? '#ffd700' : '#d4af37';
                // Fake bold by drawing text twice with slight offset
                ctx.fillText(this.data.description, this.baseX, minY - 6);
                ctx.fillText(this.data.description, this.baseX + 0.5, minY - 6);
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
