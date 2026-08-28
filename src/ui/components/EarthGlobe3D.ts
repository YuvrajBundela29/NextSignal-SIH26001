import * as THREE from 'three';
import type { DistrictProfile, RiskScoreBreakdown } from '../../services/landslide/types';
import type { UsgsEarthquake } from '../../services/landslide/usgs-seismic';
import { NASA_COOLR_NER_EVENTS } from '../../services/landslide/coolr-dataset';

export class EarthGlobe3D {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private globeMesh: THREE.Mesh | null = null;
  private atmosphereMesh: THREE.Mesh | null = null;
  private markerGroup: THREE.Group;
  private coolrGroup: THREE.Group;
  private seismicGroup: THREE.Group;
  private animationFrameId: number | null = null;
  private isRotating = true;
  private isUserInteracting = false;
  private previousMousePosition = { x: 0, y: 0 };
  private onSelectDistrict: (districtId: string) => void;
  private isHi = false;

  // Globe radius in Three.js units
  private readonly GLOBE_RADIUS = 100;

  constructor(containerId: string, onSelectDistrict: (districtId: string) => void) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;
    this.onSelectDistrict = onSelectDistrict;

    this.scene = new THREE.Scene();
    this.markerGroup = new THREE.Group();
    this.coolrGroup = new THREE.Group();
    this.seismicGroup = new THREE.Group();

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 600;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    this.camera.position.set(0, 50, 320);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(this.renderer.domElement);

    this.initScene();
    this.initControls();
    this.animate();
    this.handleResize();
  }

  private initScene() {
    // Ambient and directional lighting for photorealistic 3D shading
    const ambientLight = new THREE.AmbientLight(0x334155, 1.8);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(300, 150, 200);
    this.scene.add(sunLight);

    const backLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    backLight.position.set(-200, -100, -200);
    this.scene.add(backLight);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();

    // High-Resolution Earth Sphere
    const globeGeometry = new THREE.SphereGeometry(this.GLOBE_RADIUS, 64, 64);
    
    // Load Blue Marble Day texture + Topography Bump map
    const earthDayMap = textureLoader.load('/textures/earth-blue-marble.jpg');
    const earthBumpMap = textureLoader.load('/textures/earth-topo-bathy.jpg');
    const earthSpecMap = textureLoader.load('/textures/earth-water.png');

    const globeMaterial = new THREE.MeshPhongMaterial({
      map: earthDayMap,
      bumpMap: earthBumpMap,
      bumpScale: 2.5,
      specularMap: earthSpecMap,
      specular: new THREE.Color(0x38bdf8),
      shininess: 15,
    });

    this.globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    this.scene.add(this.globeMesh);

    // Atmospheric Glow Mesh
    const atmoGeometry = new THREE.SphereGeometry(this.GLOBE_RADIUS * 1.025, 64, 64);
    const atmoMaterial = new THREE.MeshPhongMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    this.atmosphereMesh = new THREE.Mesh(atmoGeometry, atmoMaterial);
    this.scene.add(this.atmosphereMesh);

    // Add layers to globe
    this.globeMesh.add(this.markerGroup);
    this.globeMesh.add(this.coolrGroup);
    this.globeMesh.add(this.seismicGroup);

    // Initial orientation: Center on Northeast India (Lat 26N, Lon 93E)
    this.orientToCoordinates(26.0, 93.0);
  }

  // Convert GPS (Lat, Lon) to 3D Cartesian coordinates on sphere
  private latLonToVector3(lat: number, lon: number, altitude = 0): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const r = this.GLOBE_RADIUS + altitude;

    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const z = r * Math.sin(phi) * Math.sin(theta);
    const y = r * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  public setLanguage(isHi: boolean) {
    this.isHi = isHi;
  }

  public orientToCoordinates(lat: number, lon: number) {
    if (!this.globeMesh) return;
    // Rotate globe so Lat/Lon faces camera (+Z)
    const targetY = -(lon + 90) * (Math.PI / 180);
    const targetX = (lat - 10) * (Math.PI / 180);

    this.globeMesh.rotation.y = targetY;
    this.globeMesh.rotation.x = targetX;
  }

  public renderDistricts(districts: DistrictProfile[], riskMap: Map<string, RiskScoreBreakdown>, selectedDistrictId?: string) {
    // Clear existing 3D markers
    while (this.markerGroup.children.length > 0) {
      const obj = this.markerGroup.children[0];
      this.markerGroup.remove(obj);
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
      const basePos = this.latLonToVector3(d.lat, d.lon, 0.5);

      // 3D Landslide Risk Cylinder / Pillar (Height scales with Risk Score)
      const pillarHeight = Math.max(3, (score / 100) * 24);
      const pillarGeom = new THREE.CylinderGeometry(isSelected ? 1.8 : 1.2, isSelected ? 1.2 : 0.8, pillarHeight, 16);
      pillarGeom.translate(0, pillarHeight / 2, 0);

      const pillarMat = new THREE.MeshPhongMaterial({
        color: hexColor,
        emissive: hexColor,
        emissiveIntensity: isSelected ? 0.9 : 0.5,
        transparent: true,
        opacity: 0.88,
      });

      const pillarMesh = new THREE.Mesh(pillarGeom, pillarMat);
      pillarMesh.position.copy(basePos);
      pillarMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), basePos.clone().normalize());

      // Pulsing Base Ring
      const ringGeom = new THREE.RingGeometry(1.5, level === 'CRITICAL' ? 4.5 : 3.0, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hexColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.copy(this.latLonToVector3(d.lat, d.lon, 0.8));
      ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), basePos.clone().normalize());

      pillarMesh.userData = { districtId: d.id, districtName: this.isHi ? d.nameHi : d.name, score, level };
      ringMesh.userData = { districtId: d.id };

      this.markerGroup.add(pillarMesh);
      this.markerGroup.add(ringMesh);
    }
  }

  public renderCoolrEvents(show: boolean) {
    while (this.coolrGroup.children.length > 0) {
      this.coolrGroup.remove(this.coolrGroup.children[0]);
    }
    if (!show) return;

    for (const e of NASA_COOLR_NER_EVENTS) {
      const pos = this.latLonToVector3(e.lat, e.lon, 1.2);
      const geom = new THREE.OctahedronGeometry(1.4, 0);
      const mat = new THREE.MeshBasicMaterial({ color: 0xff0044, wireframe: false });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      this.coolrGroup.add(mesh);
    }
  }

  public renderSeismicQuakes(quakes: UsgsEarthquake[], show: boolean) {
    while (this.seismicGroup.children.length > 0) {
      this.seismicGroup.remove(this.seismicGroup.children[0]);
    }
    if (!show || !quakes) return;

    for (const q of quakes) {
      const pos = this.latLonToVector3(q.lat, q.lon, 1.5);
      const size = Math.max(1.2, q.mag * 0.7);
      const geom = new THREE.SphereGeometry(size, 16, 16);
      const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      this.seismicGroup.add(mesh);
    }
  }

  private initControls() {
    const dom = this.renderer.domElement;

    // Raycaster for 3D Marker Hover and Clicking
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

        // Clamp latitude rotation
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

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.camera.position.z = Math.max(160, Math.min(500, this.camera.position.z + e.deltaY * 0.3));
    }, { passive: false });
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Gentle slow rotation when idle
    if (this.isRotating && !this.isUserInteracting && this.globeMesh) {
      this.globeMesh.rotation.y += 0.0008;
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
