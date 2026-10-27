# Jackson Mock — Website

Personal portfolio: a single page with a hero, projects, experience and education. Plain HTML/CSS/JS on Vite, with GSAP for the intro animation.

## Structure

```
index.html              The whole site
src/css/style.css       Styles
src/js/main.js          Background text, nav, project scroll and reveal, intro animation
public/favicon.svg      Favicon
public/images/          Portrait and project images, served as-is
```

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
