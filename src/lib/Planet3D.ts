// 3D Planet renderer using Three.js
// Renders rotating 3D planets with optional rings

import * as THREE from 'three';

interface PlanetConfig {
  color: number;
  emissive: number;
  bands: boolean;
  bandColors?: number[];
  hasRings: boolean;
  ringInner?: number;
  ringOuter?: number;
  ringOpacity?: number;
  tilt: number;
  features?: string;
  atmosphere?: number;
}

export class Planet3D {
  private planetType: string;
  private size: number;
  private rotation: number = 0;
  private rotationSpeed: number = 0.008;
  public disabled: boolean = false;
  private config: PlanetConfig;
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private planetBody: THREE.Mesh | null = null;
  private planetRings: THREE.Mesh | null = null;
  private planetGroup: THREE.Group;

  constructor(planetType: string, size: number = 128) {
    this.planetType = planetType;
    this.size = size;
    this.config = this.getPlanetConfig(planetType);

    // Create offscreen canvas for rendering
    this.canvas = document.createElement('canvas');
    this.canvas.width = size;
    this.canvas.height = size;

    // Set up Three.js
    this.scene = new THREE.Scene();

    // Camera - orthographic for consistent size
    const aspect = 1;
    const frustumSize = this.config.hasRings ? 6 : 3;
    this.camera = new THREE.OrthographicCamera(
      -frustumSize * aspect / 2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      100
    );
    this.camera.position.set(0, 0.5, 3);
    this.camera.lookAt(0, 0, 0);

    // Renderer with transparency
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(size, size);
    this.renderer.setClearColor(0x000000, 0);

    // Create planet group
    this.planetGroup = new THREE.Group();

    // Create planet
    this.createPlanet();

    // Lighting
    this.setupLighting();

    // Initial render
    this.render();
  }

  private getPlanetConfig(type: string): PlanetConfig {
    const configs: Record<string, PlanetConfig> = {
      mercury: {
        color: 0x8c8c8c,
        emissive: 0x1a1a1a,
        bands: false,
        hasRings: false,
        tilt: 0.03
      },
      venus: {
        color: 0xe6c87a,
        emissive: 0x2a2510,
        bands: false,
        atmosphere: 0xffd699,
        hasRings: false,
        tilt: 0.05
      },
      earth: {
        color: 0x4a90d9,
        emissive: 0x0a1520,
        bands: false,
        hasRings: false,
        tilt: 0.41,
        features: 'earth'
      },
      mars: {
        color: 0xc1440e,
        emissive: 0x200a00,
        bands: false,
        hasRings: false,
        tilt: 0.44
      },
      jupiter: {
        color: 0xd4a574,
        emissive: 0x1a1208,
        bands: true,
        bandColors: [0xc9a868, 0xe8d5a3, 0xb89655, 0xdcc48b, 0xa68544],
        hasRings: false,
        tilt: 0.05
      },
      saturn: {
        color: 0xead6a6,
        emissive: 0x2a2010,
        bands: true,
        bandColors: [0xead6a6, 0xd4c494, 0xc9b57a, 0xdec996],
        hasRings: true,
        ringInner: 1.3,
        ringOuter: 2.3,
        tilt: 0.47
      },
      uranus: {
        color: 0x7de3e3,
        emissive: 0x0a1a1a,
        bands: false,
        hasRings: true,
        ringInner: 1.5,
        ringOuter: 1.8,
        ringOpacity: 0.3,
        tilt: 1.7
      },
      neptune: {
        color: 0x4b70dd,
        emissive: 0x0a0a1a,
        bands: true,
        bandColors: [0x4b70dd, 0x3d5fc9, 0x5a7fec],
        hasRings: false,
        tilt: 0.49
      },
      pluto: {
        color: 0xc9b896,
        emissive: 0x1a1610,
        bands: false,
        hasRings: false,
        tilt: 0.3
      }
    };

    return configs[type.toLowerCase()] || configs.earth;
  }

  private createPlanet(): void {
    const config = this.config;

    // Planet body
    const segments = 64;
    const bodyGeometry = new THREE.SphereGeometry(1, segments, segments);

    // Flatten gas giants slightly
    if (config.bands) {
      bodyGeometry.scale(1, 0.9, 1);
    }

    // Planet material
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: config.color,
      emissive: config.emissive,
      shininess: config.bands ? 5 : 15,
      flatShading: false
    });

    // Add bands for gas giants
    if (config.bands && config.bandColors) {
      const bodyColors: number[] = [];
      const positions = bodyGeometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        const bandIndex = Math.floor((y + 1) * config.bandColors.length) % config.bandColors.length;
        const variation = Math.sin(y * 20) * 0.1 + 0.95;
        const color = new THREE.Color(config.bandColors[bandIndex]);
        bodyColors.push(
          color.r * variation,
          color.g * variation,
          color.b * variation
        );
      }
      bodyGeometry.setAttribute('color', new THREE.Float32BufferAttribute(bodyColors, 3));
      bodyMaterial.vertexColors = true;
    }

    // Add Earth-like features
    if (config.features === 'earth') {
      this.addEarthFeatures(bodyGeometry, bodyMaterial);
    }

    this.planetBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.planetGroup.add(this.planetBody);

    // Add rings if configured
    if (config.hasRings) {
      this.createRings();
    }

    // Apply tilt
    this.planetGroup.rotation.x = config.tilt || 0;

    this.scene.add(this.planetGroup);
  }

  private addEarthFeatures(geometry: THREE.SphereGeometry, material: THREE.MeshPhongMaterial): void {
    const colors: number[] = [];
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      const noise = Math.sin(x * 3) * Math.cos(y * 2) * Math.sin(z * 2.5);
      const lat = Math.asin(y);

      let r: number, g: number, b: number;

      if (Math.abs(lat) > 1.2) {
        r = 0.95; g = 0.95; b = 0.97;
      } else if (noise > 0.1) {
        r = 0.2 + noise * 0.3;
        g = 0.4 + noise * 0.2;
        b = 0.15;
      } else {
        r = 0.1;
        g = 0.3 + Math.abs(noise) * 0.2;
        b = 0.6 + Math.abs(noise) * 0.2;
      }

      colors.push(r, g, b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    material.vertexColors = true;
  }

  private createRings(): void {
    const config = this.config;
    const innerRadius = config.ringInner || 1.3;
    const outerRadius = config.ringOuter || 2.3;
    const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 128, 8);

    // Create ring texture with bands
    const ringCanvas = document.createElement('canvas');
    ringCanvas.width = 512;
    ringCanvas.height = 64;
    const ringCtx = ringCanvas.getContext('2d')!;

    const gradient = ringCtx.createLinearGradient(0, 0, 512, 0);

    if (this.planetType.toLowerCase() === 'saturn') {
      gradient.addColorStop(0, 'rgba(180, 160, 130, 0.0)');
      gradient.addColorStop(0.1, 'rgba(200, 180, 150, 0.6)');
      gradient.addColorStop(0.2, 'rgba(180, 160, 130, 0.3)');
      gradient.addColorStop(0.25, 'rgba(210, 190, 160, 0.8)');
      gradient.addColorStop(0.35, 'rgba(190, 170, 140, 0.5)');
      gradient.addColorStop(0.4, 'rgba(160, 140, 110, 0.2)');
      gradient.addColorStop(0.45, 'rgba(200, 180, 150, 0.7)');
      gradient.addColorStop(0.6, 'rgba(220, 200, 170, 0.9)');
      gradient.addColorStop(0.7, 'rgba(190, 170, 140, 0.4)');
      gradient.addColorStop(0.85, 'rgba(170, 150, 120, 0.6)');
      gradient.addColorStop(1, 'rgba(150, 130, 100, 0.0)');
    } else {
      gradient.addColorStop(0, 'rgba(150, 180, 180, 0.0)');
      gradient.addColorStop(0.3, 'rgba(150, 180, 180, 0.3)');
      gradient.addColorStop(0.7, 'rgba(150, 180, 180, 0.3)');
      gradient.addColorStop(1, 'rgba(150, 180, 180, 0.0)');
    }

    ringCtx.fillStyle = gradient;
    ringCtx.fillRect(0, 0, 512, 64);

    const ringTexture = new THREE.CanvasTexture(ringCanvas);
    ringTexture.rotation = Math.PI / 2;

    const ringMaterial = new THREE.MeshBasicMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: config.ringOpacity || 0.9
    });

    this.planetRings = new THREE.Mesh(ringGeometry, ringMaterial);
    this.planetRings.rotation.x = -Math.PI / 2;
    this.planetGroup.add(this.planetRings);
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 3, 5);
    this.scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-3, -1, 2);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffcc, 0.4);
    rimLight.position.set(0, 5, -5);
    this.scene.add(rimLight);
  }

  private update(): void {
    if (this.disabled || !this.planetGroup) return;
    this.rotation += this.rotationSpeed;
    this.planetGroup.rotation.y = this.rotation;
  }

  public render(): void {
    if (this.disabled || !this.renderer) return;
    try {
      this.update();
      this.renderer.render(this.scene, this.camera);
    } catch (e) {
      console.error('Planet3D render error:', e);
      this.disabled = true;
    }
  }

  public getCanvas(): HTMLCanvasElement | null {
    if (this.disabled) return null;
    this.render();
    return this.canvas;
  }

  public dispose(): void {
    if (this.renderer) this.renderer.dispose();
    if (this.planetBody) {
      this.planetBody.geometry.dispose();
      (this.planetBody.material as THREE.Material).dispose();
    }
    if (this.planetRings) {
      this.planetRings.geometry.dispose();
      (this.planetRings.material as THREE.Material).dispose();
    }
  }
}
