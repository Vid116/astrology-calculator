// Star class for twinkling star effect
import { getTheme } from './theme.js';

// Draw a 4-pointed star shape (classic twinkle)
function drawStar4Point(ctx, x, y, outerRadius, innerRadius) {
    const points = 4;
    const step = Math.PI / points;

    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = i * step - Math.PI / 2;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;

        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
}

export class Star {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.opacity = Math.random();
        this.twinkleSpeed = Math.random() * 0.02;
        // Random rotation for variety
        this.rotation = Math.random() * Math.PI / 4;
    }

    draw(ctx) {
        this.opacity += this.twinkleSpeed;
        if (this.opacity > 1 || this.opacity < 0) {
            this.twinkleSpeed = -this.twinkleSpeed;
        }

        const color = getTheme() === 'dark' ? '255, 255, 255' : '200, 200, 220';
        ctx.fillStyle = `rgba(${color}, ${this.opacity})`;

        // Add subtle glow
        ctx.shadowBlur = this.size * 2;
        ctx.shadowColor = `rgba(${color}, ${this.opacity * 0.5})`;

        // Draw star shape instead of circle
        const outerRadius = this.size * 1.5;
        const innerRadius = this.size * 0.3;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        drawStar4Point(ctx, 0, 0, outerRadius, innerRadius);
        ctx.fill();

        // Small center dot for extra sparkle
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        ctx.shadowBlur = 0;
    }
}
