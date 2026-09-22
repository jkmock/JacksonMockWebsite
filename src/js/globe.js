import { initGlobe, setGlobeTheme, setConnectionsVisible } from './three/globe-scene.js';
import { THEMES, applyPageTheme } from './three/themes.js';

// Places I've been — add lat/lng entries here to plot new points.
const places = [
  { name: 'New York, USA', lat: 40.7128, lng: -74.006 },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'Cape Town, South Africa', lat: -33.9249, lng: 18.4241 },
];

const canvas = document.getElementById('globe-scene');
if (canvas) {
  const globeRefs = initGlobe(canvas, places);
  setupThemeSwitcher(globeRefs);
}

function setupThemeSwitcher(globeRefs) {
  const panel = document.createElement('div');
  panel.className = 'theme-switcher';

  const swatchRow = document.createElement('div');
  swatchRow.className = 'theme-swatches';
  THEMES.forEach((theme, i) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'theme-swatch';
    swatch.style.background = theme.page.accent;
    swatch.title = theme.name;
    swatch.setAttribute('aria-label', theme.name);
    if (i === 0) swatch.classList.add('is-active');
    swatch.addEventListener('click', () => {
      applyPageTheme(theme);
      setGlobeTheme(globeRefs, theme.globe);
      swatchRow.querySelectorAll('.theme-swatch').forEach((el) => el.classList.remove('is-active'));
      swatch.classList.add('is-active');
    });
    swatchRow.appendChild(swatch);
  });

  const toggleLabel = document.createElement('label');
  toggleLabel.className = 'theme-toggle';
  const toggleInput = document.createElement('input');
  toggleInput.type = 'checkbox';
  toggleInput.addEventListener('change', () => {
    setConnectionsVisible(globeRefs, toggleInput.checked);
  });
  toggleLabel.appendChild(toggleInput);
  toggleLabel.appendChild(document.createTextNode('Connections'));

  panel.appendChild(swatchRow);
  panel.appendChild(toggleLabel);
  document.body.appendChild(panel);
}
