import { feature } from 'topojson-client';
import landTopology from 'world-atlas/land-50m.json';

const MASK_WIDTH = 1440;
const MASK_HEIGHT = 720;

function lonLatToPx(lon, lat) {
  return [((lon + 180) / 360) * MASK_WIDTH, ((90 - lat) / 180) * MASK_HEIGHT];
}

function rasterizeLandMask() {
  const canvas = document.createElement('canvas');
  canvas.width = MASK_WIDTH;
  canvas.height = MASK_HEIGHT;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, MASK_WIDTH, MASK_HEIGHT);
  ctx.fillStyle = '#fff';

  const landFeature = feature(landTopology, landTopology.objects.land);
  const polygons =
    landFeature.type === 'FeatureCollection'
      ? landFeature.features.map((f) => f.geometry)
      : [landFeature.geometry];

  ctx.beginPath();
  for (const geometry of polygons) {
    if (!geometry) continue;
    const polygonRings = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    for (const rings of polygonRings) {
      for (const ring of rings) {
        let prevLon = null;
        ring.forEach(([lon, lat], i) => {
          const [x, y] = lonLatToPx(lon, lat);
          // A ring that crosses the antimeridian (e.g. Antarctica, Russia)
          // would otherwise draw a false straight line across the whole map
          // connecting +180 to -180 — break into a new subpath instead.
          if (i === 0 || Math.abs(lon - prevLon) > 180) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          prevLon = lon;
        });
        ctx.closePath();
      }
    }
  }
  ctx.fill('evenodd');

  return ctx.getImageData(0, 0, MASK_WIDTH, MASK_HEIGHT).data;
}

let cachedMask = null;

export function isLand(lat, lon) {
  if (!cachedMask) cachedMask = rasterizeLandMask();
  const x = Math.min(MASK_WIDTH - 1, Math.max(0, Math.floor(((lon + 180) / 360) * MASK_WIDTH)));
  const y = Math.min(MASK_HEIGHT - 1, Math.max(0, Math.floor(((90 - lat) / 180) * MASK_HEIGHT)));
  const idx = (y * MASK_WIDTH + x) * 4;
  return cachedMask[idx] > 128;
}
