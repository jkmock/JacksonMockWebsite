# Jackson Mock — Website

Personal portfolio: a single page with a hero, projects, experience and education. Plain HTML/CSS/JS on Vite, with GSAP for the intro animation.

## Structure

```
index.html              The whole site
src/css/style.css       Styles
src/js/main.js          Background text, nav, project scroll and reveal, intro animation
public/favicon-*.png    Favicons (apple-touch-icon.png for iPhone home screens)
public/Jackson_Mock_Resume.pdf   Resume behind the "Download Resume" button
public/images/          Portrait and project images, served as-is
```

## Update the resume

Replace `public/Jackson_Mock_Resume.pdf` with the new PDF (keep that exact file name), then commit and push. The host redeploys on push and the button serves the new file.

You can also do it on github.com: open the `public` folder, choose **Add file → Upload files**, drop in the new PDF named `Jackson_Mock_Resume.pdf` (it replaces the old one), and commit.

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
