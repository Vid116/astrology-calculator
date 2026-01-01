// Planet class for solar system animation
import { getColors } from './theme.js';
import { Planet3D } from './Planet3D.js';

export class Planet {
    constructor(centerX, centerY, planetData, options = {}) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.data = planetData;

        // Use data or defaults
        this.name = planetData.name;
        this.symbol = planetData.symbol;
        this.colors = planetData.colors;
        this.size = (planetData.size || 6) * (options.scale || 1);
        this.orbitRadius = (planetData.orbitRadius || 100) * (options.orbitScale || 1);
        this.orbitSpeed = (planetData.orbitSpeed || 0.01) * (options.speedMultiplier || 1);
        this.isStar = planetData.isStar || false;
        this.hasRings = planetData.hasRings || false;
        this.ringColor = planetData.ringColor || 'rgba(210, 180, 140, 0.4)';

        // Orbital tilt - makes orbits appear elliptical (0 = face-on, 1 = edge-on)
        this.orbitTilt = options.orbitTilt !== undefined ? options.orbitTilt : 0.6;

        // State
        this.angle = Math.random() * Math.PI * 2;
        this.x = this.isStar ? centerX : 0;
        this.y = this.isStar ? centerY : 0;

        // Trail for orbiting planets (disabled)
        this.trail = [];
        this.maxTrail = 0;

        // Hover state
        this.isHovered = false;

        // Animation for star pulsing
        this.pulsePhase = Math.random() * Math.PI * 2;

        // Planet image (fallback)
        this.planetsPath = options.planetsPath || 'planets/';
        this.planetImage = null;
        this.imageLoaded = false;

        // 3D Planet rendering (for all planets except Sun)
        this.use3D = !this.isStar;
        if (this.use3D) {
            try {
                const resolution = this.hasRings ? 256 : 128;
                this.planet3D = new Planet3D(planetData.name, resolution);
            } catch (e) {
                console.error('Failed to create 3D planet:', e);
                this.planet3D = null;
            }
        }
        // Load image as fallback
        if (planetData.image) {
            this.loadImage(planetData.image);
        }
    }

    loadImage(filename) {
        this.planetImage = new Image();
        this.planetImage.onload = () => {
            this.imageLoaded = true;
        };
        this.planetImage.onerror = () => {
            this.imageLoaded = false;
            this.planetImage = null;
        };
        this.planetImage.src = this.planetsPath + filename;
    }

    update() {
        if (this.isStar) {
            // Sun stays at center, just pulse
            this.pulsePhase += 0.02;
            return;
        }

        this.angle += this.orbitSpeed;
        this.x = this.centerX + Math.cos(this.angle) * this.orbitRadius;
        // Apply tilt to Y axis - creates elliptical orbit appearance
        this.y = this.centerY + Math.sin(this.angle) * this.orbitRadius * (1 - this.orbitTilt);

        // Update trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }
    }

    // Check if point is over this planet
    containsPoint(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Larger hit area for planets with rings
        const hitSize = this.hasRings ? this.size * 3.5 : this.size * 2;
        return distance <= hitSize;
    }

    draw(ctx) {
        if (this.isStar) {
            this.drawStar(ctx);
        } else {
            this.drawPlanet(ctx);
        }
    }

    drawStar(ctx) {
        // Pulsing glow for the sun
        const pulseAmount = Math.sin(this.pulsePhase) * 0.15 + 1;
        const glowSize = this.size * 3 * pulseAmount;

        // Outer glow (always draw for sun effect)
        const outerGlow = ctx.createRadialGradient(
            this.x, this.y, this.size * 0.5,
            this.x, this.y, glowSize
        );
        outerGlow.addColorStop(0, 'rgba(255, 200, 50, 0.4)');
        outerGlow.addColorStop(0.5, 'rgba(255, 150, 0, 0.2)');
        outerGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');

        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw image if available, otherwise gradient
        if (this.planetImage && this.planetImage.complete && this.planetImage.naturalHeight > 0) {
            const imgSize = this.size * 2 * pulseAmount;
            ctx.drawImage(
                this.planetImage,
                this.x - imgSize,
                this.y - imgSize,
                imgSize * 2,
                imgSize * 2
            );
        } else {
            // Fallback: Sun body gradient
            const gradient = ctx.createRadialGradient(
                this.x - this.size / 4,
                this.y - this.size / 4,
                0,
                this.x,
                this.y,
                this.size * pulseAmount
            );
            gradient.addColorStop(0, this.colors.light);
            gradient.addColorStop(0.7, this.colors.dark);
            gradient.addColorStop(1, '#ff6600');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * pulseAmount, 0, Math.PI * 2);
            ctx.fill();

            // Inner bright core
            ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw name if hovered
        if (this.isHovered) {
            this.drawLabel(ctx);
        }
    }

    drawPlanet(ctx) {
        // Glow effect
        ctx.shadowBlur = this.isHovered ? 20 : 8;
        ctx.shadowColor = this.colors.glow;

        // 3D Planet rendering
        if (this.use3D && this.planet3D && !this.planet3D.disabled) {
            const planetCanvas = this.planet3D.getCanvas();
            if (planetCanvas) {
                // Size multiplier: larger for ringed planets
                const sizeMultiplier = this.hasRings ? 3.5 : 2;
                const imgSize = this.size * sizeMultiplier;

                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.drawImage(
                    planetCanvas,
                    -imgSize,
                    -imgSize,
                    imgSize * 2,
                    imgSize * 2
                );
                ctx.restore();

                ctx.shadowBlur = 0;
                if (this.isHovered) {
                    this.drawLabel(ctx);
                }
                return; // Don't fall through to other rendering
            }
        }
        // Draw image if available, otherwise gradient
        else if (this.planetImage && this.planetImage.complete && this.planetImage.naturalHeight > 0) {
            const imgSize = this.hasRings ? this.size * 2 : this.size;

            // For Saturn: rings horizontal when at left/right of orbit, tilted at top/bottom
            if (this.hasRings) {
                ctx.save();
                ctx.translate(this.x, this.y);
                // Smooth rotation - shifted right by adding phase offset
                ctx.rotate(Math.cos(this.angle) * 0.3 + 0.7);
                ctx.drawImage(
                    this.planetImage,
                    -imgSize,
                    -imgSize,
                    imgSize * 2,
                    imgSize * 2
                );
                ctx.restore();
            } else {
                ctx.drawImage(
                    this.planetImage,
                    this.x - imgSize,
                    this.y - imgSize,
                    imgSize * 2,
                    imgSize * 2
                );
            }
        } else {
            // Draw rings for Saturn (fallback)
            if (this.hasRings) {
                this.drawRings(ctx);
            }

            // Fallback: Draw planet body as gradient
            const gradient = ctx.createRadialGradient(
                this.x - this.size / 3,
                this.y - this.size / 3,
                0,
                this.x,
                this.y,
                this.size
            );
            gradient.addColorStop(0, this.colors.light);
            gradient.addColorStop(1, this.colors.dark);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 0;

        // Draw name if hovered
        if (this.isHovered) {
            this.drawLabel(ctx);
        }
    }

    drawRings(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Tilt the rings
        ctx.scale(1, 0.3);

        // Outer ring
        ctx.strokeStyle = this.ringColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 1.8, 0, Math.PI * 2);
        ctx.stroke();

        // Inner ring
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 1.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    drawLabel(ctx) {
        const labelY = this.y - this.size - 15;

        // Symbol
        ctx.font = 'bold 18px serif';
        ctx.fillStyle = this.colors.glow;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.colors.glow;
        ctx.fillText(this.symbol, this.x, labelY);

        // Name
        ctx.font = '500 12px "Cinzel", serif';
        ctx.fillStyle = '#d4af37';
        ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
        ctx.fillText(this.name.toUpperCase(), this.x, labelY + 16);

        ctx.shadowBlur = 0;
    }

    // Reposition center (for resize)
    setCenter(x, y) {
        this.centerX = x;
        this.centerY = y;
        if (this.isStar) {
            this.x = x;
            this.y = y;
        }
        this.trail = []; // Clear trail on reposition
    }
}
