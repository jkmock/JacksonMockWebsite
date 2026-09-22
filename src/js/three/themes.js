export const THEMES = [
  {
    id: 'cyan',
    name: 'Cyan',
    page: { bg: '#0b0b0f', fg: '#f2f2f2', muted: '#9a9aa5', accent: '#6ee7ff' },
    globe: { land: '#6ee7ff', ocean: '#6ee7ff', marker: '#ffffff', connection: '#6ee7ff' },
  },
  {
    id: 'amber',
    name: 'Amber',
    page: { bg: '#120d08', fg: '#f5ead9', muted: '#a68f6d', accent: '#ffb454' },
    globe: { land: '#ffb454', ocean: '#ffb454', marker: '#fff2d9', connection: '#ffb454' },
  },
  {
    id: 'mono',
    name: 'Monochrome',
    page: { bg: '#0a0a0a', fg: '#f2f2f2', muted: '#8a8a8a', accent: '#e8c987' },
    globe: { land: '#e8e8e8', ocean: '#e8e8e8', marker: '#e8c987', connection: '#e8c987' },
  },
  {
    id: 'violet',
    name: 'Violet',
    page: { bg: '#0d0716', fg: '#f1e9ff', muted: '#9c8fc0', accent: '#c77dff' },
    globe: { land: '#c77dff', ocean: '#c77dff', marker: '#ff8dfa', connection: '#c77dff' },
  },
];

export function applyPageTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty('--bg', theme.page.bg);
  root.style.setProperty('--fg', theme.page.fg);
  root.style.setProperty('--muted', theme.page.muted);
  root.style.setProperty('--accent', theme.page.accent);
}
