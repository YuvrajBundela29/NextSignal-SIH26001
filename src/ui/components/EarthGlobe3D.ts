import * as THREE from 'three';
import type { DistrictProfile, RiskScoreBreakdown, AppLanguage } from '../../services/landslide/types';
import type { UsgsEarthquake } from '../../services/landslide/usgs-seismic';
import { NASA_COOLR_NER_EVENTS } from '../../services/landslide/coolr-dataset';
import { NER_STATE_BOUNDARIES } from '../../services/landslide/state-boundaries';

export class EarthGlobe3D {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private globeMesh: THREE.Mesh | null = null;
  private atmosphereMesh: THREE.Mesh | null = null;
  private markerGroup: THREE.Group;
  private boundaryGroup: THREE.Group;
  private coolrGroup: THREE.Group;
  private seismicGroup: THREE.Group;
  private labelGroup: THREE.Group;
  private animationFrameId: number | null = null;
  private isRotating = true;
  private isUserInteracting = false;
  private previousMousePosition = { x: 0, y: 0 };
  private onSelectDistrict: (districtId: string) => void;
  private lang: AppLanguage = 'en';

  private readonly GLOBE_RADIUS = 100;

  constructor(containerId: string, onSelectDistrict: (districtId: string) => void) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;
    this.onSelectDistrict = onSelectDistrict;

    this.scene = new THREE.Scene();
    this.markerGroup = new THREE.Group();
    this.boundaryGroup = new THREE.Group();
    this.coolrGroup = new THREE.Group();
    this.seismicGroup = new THREE.Group();
    this.labelGroup = new THREE.Group();

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 600;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    // Initial position focused on Northeast India
    this.camera.position.set(0, 30, 240);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(this.renderer.domElement);

    this.initScene();
    this.initVirtualBorders();
    this.initControls();
    this.animate();
    this.handleResize();
  }

  private initScene() {
    const ambientLight = new THREE.AmbientLight(0x475569, 2.0);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
    sunLight.position.set(300, 150, 200);
    this.scene.add(sunLight);

    const backLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    backLight.position.set(-200, -100, -200);
    this.scene.add(backLight);

    const textureLoader = new THREE.TextureLoader();
    const globeGeometry = new THREE.SphereGeometry(this.GLOBE_RADIUS, 64, 64);
    
    const earthDayMap = textureLoader.load('/textures/earth-blue-marble.jpg');
    const earthBumpMap = textureLoader.load('/textures/earth-topo-bathy.jpg');
    const earthSpecMap = textureLoader.load('/textures/earth-water.png');

    const globeMaterial = new THREE.MeshPhongMaterial({
      map: earthDayMap,
      bumpMap: earthBumpMap,
      bumpScale: 2.2,
      specularMap: earthSpecMap,
      specular: new THREE.Color(0x38bdf8),
      shininess: 12,
    });

    this.globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    this.scene.add(this.globeMesh);

    // Glowing Atmosphere
    const atmoGeometry = new THREE.SphereGeometry(this.GLOBE_RADIUS * 1.02, 64, 64);
    const atmoMaterial = new THREE.MeshPhongMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    this.atmosphereMesh = new THREE.Mesh(atmoGeometry, atmoMaterial);
    this.scene.add(this.atmosphereMesh);

    this.globeMesh.add(this.markerGroup);
    this.globeMesh.add(this.boundaryGroup);
    this.globeMesh.add(this.coolrGroup);
    this.globeMesh.add(this.seismicGroup);
    this.globeMesh.add(this.labelGroup);

    // Orient initial view straight into Northeast India (26.0°N, 93.0°E)
    this.orientToCoordinates(26.0, 93.0);
  }

  // Draw Virtual State Borders directly on 3D Globe Surface
  private initVirtualBorders() {
    for (const boundary of NER_STATE_BOUNDARIES) {
      const points: THREE.Vector3[] = [];
      for (const coord of boundary.coordinates) {
        points.push(this.latLonToVector3(coord[0], coord[1], 0.3));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(boundary.color),
        linewidth: 2,
        transparent: true,
        opacity: 0.75,
      });
      const line = new THREE.Line(geometry, material);
      this.boundaryGroup.add(line);
    }
  }

  private latLonToVector3(lat: number, lon: number, altitude = 0): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const r = this.GLOBE_RADIUS + altitude;

    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const z = r * Math.sin(phi) * Math.sin(theta);
    const y = r * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  public setLanguage(lang: AppLanguage) {
    this.lang = lang;
  }

  public orientToCoordinates(lat: number, lon: number) {
    if (!this.globeMesh) return;
    const targetY = -(lon + 90) * (Math.PI / 180);
    const targetX = (lat - 10) * (Math.PI / 180);

    this.globeMesh.rotation.y = targetY;
    this.globeMesh.rotation.x = targetX;
  }

  public renderDistricts(districts: DistrictProfile[], riskMap: Map<string, RiskScoreBreakdown>, selectedDistrictId?: string) {
    while (this.markerGroup.children.length > 0) {
      this.markerGroup.remove(this.markerGroup.children[0]);
    }
    while (this.labelGroup.children.length > 0) {
      this.labelGroup.remove(this.labelGroup.children[0]);
    }

    for (const d of districts) {
      const risk = riskMap.get(d.id);
      const score = risk ? risk.compositeScore : 20;
      const level = risk ? risk.level : 'LOW';

      const hexColor =
        level === 'CRITICAL'
          ? 0xef4444
          : level === 'HIGH'
          ? 0xf97316
          : level === 'MODERATE'
          ? 0xeab308
          : 0x22c55e;

      const isSelected = d.id === selectedDistrictId;
      const basePos = this.latLonToVector3(d.lat, d.lon, 0.4);

      // Clean 2D Disc Flat on Globe Surface (No 3D Mountain Cones)
      const discGeom = new THREE.CircleGeometry(isSelected ? 2.8 : 1.8, 32);
      const discMat = new THREE.MeshBasicMaterial({
        color: hexColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isSelected ? 0.95 : 0.85,
      });
      const discMesh = new THREE.Mesh(discGeom, discMat);
      discMesh.position.copy(basePos);
      discMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), basePos.clone().normalize());

      // 2D Outer Radar Pulse Ring
      const ringGeom = new THREE.RingGeometry(isSelected ? 3.0 : 2.0, level === 'CRITICAL' ? 5.2 : 3.8, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hexColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.copy(this.latLonToVector3(d.lat, d.lon, 0.5));
      ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), basePos.clone().normalize());

      discMesh.userData = { districtId: d.id, name: d.name, score, level };
      ringMesh.userData = { districtId: d.id };

      this.markerGroup.add(discMesh);
      this.markerGroup.add(ringMesh);

      // High-Contrast Place Name Canvas Sprite
      const sprite = this.createPlaceLabelSprite(d.name.split(' ')[0], score, hexColor, isSelected);
      sprite.position.copy(this.latLonToVector3(d.lat, d.lon, 1.8));
      this.labelGroup.add(sprite);
    }
  }

  private createPlaceLabelSprite(text: string, score: number, colorHex: number, isSelected: boolean): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = isSelected ? 'rgba(2, 132, 199, 0.9)' : 'rgba(15, 23, 42, 0.85)';
      ctx.roundRect(10, 10, 236, 44, 8);
      ctx.fill();
      ctx.strokeStyle = `#${colorHex.toString(16).padStart(6, '0')}`;
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px -apple-system, system-ui, sans-serif';
      ctx.fillText(text, 22, 38);

      ctx.fillStyle = `#${colorHex.toString(16).padStart(6, '0')}`;
      ctx.font = 'bold 22px -apple-system, system-ui, sans-serif';
      ctx.fillText(String(score), 195, 38);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(6, 1.5, 1);
    return sprite;
  }

  public renderCoolrEvents(show: boolean) {
    while (this.coolrGroup.children.length > 0) {
      this.coolrGroup.remove(this.coolrGroup.children[0]);
    }
    if (!show) return;

    for (const e of NASA_COOLR_NER_EVENTS) {
      const pos = this.latLonToVector3(e.lat, e.lon, 0.6);
      const geom = new THREE.CircleGeometry(1.0, 16);
      const mat = new THREE.MeshBasicMaterial({ color: 0xdc2626, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize());
      this.coolrGroup.add(mesh);
    }
  }

  public renderSeismicQuakes(quakes: UsgsEarthquake[], show: boolean) {
    while (this.seismicGroup.children.length > 0) {
      this.seismicGroup.remove(this.seismicGroup.children[0]);
    }
    if (!show || !quakes) return;

    for (const q of quakes) {
      const pos = this.latLonToVector3(q.lat, q.lon, 0.8);
      const geom = new THREE.RingGeometry(1.2, 1.2 + q.mag * 0.8, 16);
      const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize());
      this.seismicGroup.add(mesh);
    }
  }

  private initControls() {
    const dom = this.renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    dom.addEventListener('mousedown', (e) => {
      this.isUserInteracting = true;
      this.isRotating = false;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isUserInteracting = false;
    });

    dom.addEventListener('mousemove', (e) => {
      const rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (this.isUserInteracting && this.globeMesh) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.globeMesh.rotation.y += deltaX * 0.005;
        this.globeMesh.rotation.x += deltaY * 0.005;

        this.globeMesh.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.globeMesh.rotation.x));
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    dom.addEventListener('click', (e) => {
      const rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.markerGroup.children, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const districtId = hit.userData?.districtId;
        if (districtId) {
          this.onSelectDistrict(districtId);
        }
      }
    });

    // Highly Zoomable: Min Distance = 105 (close to mountain level, Globe Radius = 100), Max Distance = 450
    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.camera.position.z = Math.max(105, Math.min(450, this.camera.position.z + e.deltaY * 0.25));
    }, { passive: false });
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.isRotating && !this.isUserInteracting && this.globeMesh) {
      this.globeMesh.rotation.y += 0.0006;
    }

    this.renderer.render(this.scene, this.camera);
  };

  private handleResize() {
    window.addEventListener('resize', () => {
      if (!this.container) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      if (width > 0 && height > 0) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      }
    });
  }

  public setAutoRotate(rotate: boolean) {
    this.isRotating = rotate;
  }

  public destroy() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
  }
}
