// Planet class for orbital planet animation
import { getColors } from './theme.js';

export class Planet {
    constructor(centerX, centerY, orbitRadius, color, speed) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.orbitRadius = orbitRadius || Math.random() * 200 + 150;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = speed;
        this.size = Math.random() * 8 + 4;
        this.color = color;
        this.trail = [];
        this.maxTrail = 30;
        this.x = 0;
        this.y = 0;
    }

    update() {
        this.angle += this.speed;
        this.x = this.centerX + Math.cos(this.angle) * this.orbitRadius;
        this.y = this.centerY + Math.sin(this.angle) * this.orbitRadius;

        // Update trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }
    }

    draw(ctx) {
        const colors = getColors();

        // Draw trail
        ctx.strokeStyle = colors.trail;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
            if (i === 0) {
                ctx.moveTo(this.trail[i].x, this.trail[i].y);
            } else {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
        }
        ctx.stroke();

        // Draw planet
        const gradient = ctx.createRadialGradient(
            this.x - this.size / 3,
            this.y - this.size / 3,
            0,
            this.x,
            this.y,
            this.size
        );
        gradient.addColorStop(0, this.color.light);
        gradient.addColorStop(1, this.color.dark);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color.light;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}
