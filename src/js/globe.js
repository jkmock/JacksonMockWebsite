import { initGlobe } from './three/globe-scene.js';

// Places I've been — add lat/lng entries here to plot new points.
const places = [
  { name: 'New York, USA', lat: 40.7128, lng: -74.006 },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'Cape Town, South Africa', lat: -33.9249, lng: 18.4241 },
];

const canvas = document.getElementById('globe-scene');
if (canvas) {
  initGlobe(canvas, places);
}
