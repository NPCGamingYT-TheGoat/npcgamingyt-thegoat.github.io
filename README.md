# roninprogrammer.github.io — Vicknesh Balasubramaniam's portfolio

Static site. No build step: upload these files and it works.

## What's inside
- index.html — main portfolio
- office.html — walkable 3D office (Three.js, loads from cdnjs)
- sante.html — Santé case study
- cv.html + Vicknesh_Balasubramaniam_CV.pdf — CV page and PDF
- assets/ — stylesheet, chat widget, logos
- .nojekyll — tells GitHub Pages to serve files as-is

## Deploy on GitHub Pages (free)
1. On GitHub, create a PUBLIC repo named exactly: roninprogrammer.github.io
2. Upload ALL files in this folder to the repo root (keep the assets/ folder; include .nojekyll).
   Command line instead:
     git init && git add -A && git commit -m "Portfolio"
     git branch -M main
     git remote add origin https://github.com/roninprogrammer/roninprogrammer.github.io.git
     git push -u origin main
3. Repo → Settings → Pages → Source: "Deploy from a branch" → Branch: main, folder: / (root) → Save.
4. Wait 1–2 minutes, then open https://roninprogrammer.github.io

## Custom domain (optional, e.g. vicknesh.com)
1. Buy the domain (Cloudflare Registrar is cheapest long-term).
2. Add a file named CNAME to this repo containing only: vicknesh.com
3. At your DNS provider add:
   A     @    185.199.108.153
   A     @    185.199.109.153
   A     @    185.199.110.153
   A     @    185.199.111.153
   CNAME www  roninprogrammer.github.io
   (On Cloudflare, set these to "DNS only" / grey cloud.)
4. Settings → Pages → Custom domain → vicknesh.com → Save, then tick "Enforce HTTPS" once it appears.

## Turn on the AI chat (optional)
The "Ask my AI" button stays hidden until the backend is deployed.
1. Deploy the portfolio-chat Go service (see its README).
2. In index.html, cv.html and sante.html, replace https://YOUR-SERVICE/api/chat with your service URL.
3. Set ALLOWED_ORIGINS on the service to your site URL (and custom domain).

## Updating later
Edit the HTML and push again. Changes go live in about a minute.
