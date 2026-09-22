import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { isLand } from './land-mask.js';

const GLOBE_RADIUS = 2;

function createDotTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.7)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

// Generates points evenly spread over a unit sphere, each tagged with the
// lat/lon that latLngToVector3 below would place at that same xyz — so the
// land mask (which is indexed by lat/lon) lines up with these coordinates.
function fibonacciSpherePoints(count) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    const phi = Math.acos(Math.max(-1, Math.min(1, y)));
    const lat = 90 - (phi * 180) / Math.PI;
    const lon = ((((Math.atan2(z, -x) * 180) / Math.PI - 180 + 540) % 360) + 360) % 360 - 180;

    points.push({ x, y, z, lat, lon });
  }
  return points;
}

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export function initGlobe(canvas, places = []) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const dotTexture = createDotTexture();

  const candidates = fibonacciSpherePoints(60000);
  const landPositions = [];
  const oceanPositions = [];
  for (const p of candidates) {
    const target = isLand(p.lat, p.lon) ? landPositions : oceanPositions;
    target.push(p.x * GLOBE_RADIUS, p.y * GLOBE_RADIUS, p.z * GLOBE_RADIUS);
  }

  const landGeometry = new THREE.BufferGeometry();
  landGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(landPositions), 3));
  const landMaterial = new THREE.PointsMaterial({
    size: 0.026,
    map: dotTexture,
    color: 0x6ee7ff,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const land = new THREE.Points(landGeometry, landMaterial);
  scene.add(land);

  const oceanGeometry = new THREE.BufferGeometry();
  oceanGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(oceanPositions), 3));
  const oceanMaterial = new THREE.PointsMaterial({
    size: 0.013,
    map: dotTexture,
    color: 0x6ee7ff,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const ocean = new THREE.Points(oceanGeometry, oceanMaterial);
  scene.add(ocean);

  let markers = null;
  let markerMaterial = null;
  let connections = null;
  let connectionMaterial = null;
  if (places.length) {
    const markerVectors = places.map((place) => latLngToVector3(place.lat, place.lng, GLOBE_RADIUS * 1.01));
    const markerPositions = new Float32Array(places.length * 3);
    markerVectors.forEach((v, i) => {
      markerPositions[i * 3] = v.x;
      markerPositions[i * 3 + 1] = v.y;
      markerPositions[i * 3 + 2] = v.z;
    });
    const markerGeometry = new THREE.BufferGeometry();
    markerGeometry.setAttribute('position', new THREE.BufferAttribute(markerPositions, 3));
    markerMaterial = new THREE.PointsMaterial({
      size: 0.09,
      map: dotTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    markers = new THREE.Points(markerGeometry, markerMaterial);
    scene.add(markers);

    if (markerVectors.length > 1) {
      const linePositions = [];
      for (let i = 0; i < markerVectors.length - 1; i++) {
        linePositions.push(
          markerVectors[i].x, markerVectors[i].y, markerVectors[i].z,
          markerVectors[i + 1].x, markerVectors[i + 1].y, markerVectors[i + 1].z
        );
      }
      const connectionGeometry = new THREE.BufferGeometry();
      connectionGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
      connectionMaterial = new THREE.LineBasicMaterial({
        color: 0x6ee7ff,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
      });
      connections = new THREE.LineSegments(connectionGeometry, connectionMaterial);
      connections.visible = false;
      scene.add(connections);
    }
  }

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 3.2;
  controls.maxDistance = 14;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.4;

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  return {
    scene,
    camera,
    renderer,
    land,
    ocean,
    markers,
    connections,
    controls,
    materials: { landMaterial, oceanMaterial, markerMaterial, connectionMaterial },
  };
}

export function setGlobeTheme({ materials, connections }, globeTheme) {
  materials.landMaterial.color.set(globeTheme.land);
  materials.oceanMaterial.color.set(globeTheme.ocean);
  if (materials.markerMaterial) materials.markerMaterial.color.set(globeTheme.marker);
  if (materials.connectionMaterial) materials.connectionMaterial.color.set(globeTheme.connection);
}

export function setConnectionsVisible({ connections }, visible) {
  if (connections) connections.visible = visible;
}
