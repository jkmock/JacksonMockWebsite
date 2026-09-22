# Jackson Mock — Website

Personal site: 3D renders, resume, and whatever else. Plain HTML/CSS/JS on Vite, with Three.js for 3D.

## Structure

```
index.html          Home page (Three.js hero scene)
resume.html          Resume page
src/css/style.css    Shared styles
src/js/main.js        Home page entry script
src/js/three/scene.js Three.js scene setup
public/models/        3D model files (.glb, .gltf, etc.) served as-is
public/images/         Static images served as-is
```

Add a new page by creating `<name>.html` at the root and registering it in `vite.config.js` under `build.rollupOptions.input`.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview   # preview the production build locally
```

Outputs a static `dist/` folder — deploy it anywhere (Vercel, Netlify, Cloudflare Pages, etc.).

## Deploy + custom domain

1. Connect this GitHub repo to a static host (Vercel/Netlify/Cloudflare Pages) — it auto-builds on push.
2. Point the GoDaddy domain's DNS at the host (CNAME/A record per the host's instructions).
