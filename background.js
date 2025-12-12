// Celestial Canvas Animation
(function() {
    const canvas = document.getElementById('celestial-canvas');
    const ctx = canvas.getContext('2d');

    let stars = [];
    let planets = [];
    let constellations = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function getTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    function getColors() {
        const theme = getTheme();
        if (theme === 'dark') {
            return {
                bg: '#050810',
                star: '#ffffff',
                planet: '#d4af37',
                line: 'rgba(212, 175, 55, 0.3)',
                trail: 'rgba(212, 175, 55, 0.1)'
            };
        } else {
            return {
                bg: '#0a0e1a',
                star: '#e2e8f0',
                planet: '#d4af37',
                line: 'rgba(212, 175, 55, 0.2)',
                trail: 'rgba(212, 175, 55, 0.05)'
            };
        }
    }

    class Star {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2;
            this.opacity = Math.random();
            this.twinkleSpeed = Math.random() * 0.02;
        }

        draw() {
            const colors = getColors();
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

    class Planet {
        constructor(x, y, radius, color, speed) {
            this.centerX = x;
            this.centerY = y;
            this.radius = radius;
            this.orbitRadius = Math.random() * 200 + 150;
            this.angle = Math.random() * Math.PI * 2;
            this.speed = speed;
            this.size = Math.random() * 8 + 4;
            this.color = color;
            this.trail = [];
            this.maxTrail = 30;
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

        draw() {
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

    class Constellation {
        constructor() {
            this.stars = [];
            const starCount = Math.floor(Math.random() * 4) + 3;
            const baseX = Math.random() * canvas.width;
            const baseY = Math.random() * canvas.height;

            for (let i = 0; i < starCount; i++) {
                this.stars.push({
                    x: baseX + (Math.random() - 0.5) * 200,
                    y: baseY + (Math.random() - 0.5) * 200
                });
            }
        }

        draw() {
            const colors = getColors();
            ctx.strokeStyle = colors.line;
            ctx.lineWidth = 1;

            ctx.beginPath();
            for (let i = 0; i < this.stars.length; i++) {
                if (i === 0) {
                    ctx.moveTo(this.stars[i].x, this.stars[i].y);
                } else {
                    ctx.lineTo(this.stars[i].x, this.stars[i].y);
                }
            }
            ctx.stroke();

            // Draw constellation stars
            ctx.fillStyle = colors.star;
            this.stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }

    function init() {
        resizeCanvas();

        // Create stars
        for (let i = 0; i < 100; i++) {
            stars.push(new Star());
        }

        // Create planets
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        planets.push(new Planet(centerX, centerY, 100,
            { light: '#ffd700', dark: '#b8860b' }, 0.002));
        planets.push(new Planet(centerX, centerY, 150,
            { light: '#4169e1', dark: '#1e3a8a' }, 0.0015));
        planets.push(new Planet(centerX, centerY, 200,
            { light: '#ff6347', dark: '#8b0000' }, 0.001));
        planets.push(new Planet(centerX, centerY, 250,
            { light: '#32cd32', dark: '#006400' }, 0.0008));

        // Create constellations
        for (let i = 0; i < 5; i++) {
            constellations.push(new Constellation());
        }
    }

    function animate() {
        const colors = getColors();
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw stars
        stars.forEach(star => star.draw());

        // Draw constellations
        constellations.forEach(constellation => constellation.draw());

        // Update and draw planets
        planets.forEach(planet => {
            planet.update();
            planet.draw();
        });

        requestAnimationFrame(animate);
    }

    // Initialize and start animation
    init();
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        resizeCanvas();
        stars = [];
        planets = [];
        constellations = [];
        init();
    });

    // Re-init on theme change
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                // Colors will update on next frame
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true
    });
})();
