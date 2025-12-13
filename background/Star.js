// Star class for twinkling star effect
import { getTheme } from './theme.js';

export class Star {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.opacity = Math.random();
        this.twinkleSpeed = Math.random() * 0.02;
    }

    draw(ctx) {
        this.opacity += this.twinkleSpeed;
        if (this.opacity > 1 || this.opacity < 0) {
            this.twinkleSpeed = -this.twinkleSpeed;
        }

        ctx.fillStyle = `rgba(${getTheme() === 'dark' ? '255, 255, 255' : '74, 85, 104'}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
