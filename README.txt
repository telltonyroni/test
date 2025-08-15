Pro Demo — Exported Package

Files:
- index.html       (player UI supporting multi-hotspots & branching)
- player.css
- player.js
- demo.json        (steps with hotspots; images under /assets)
- /assets/*        (image files)

Host on any static server (S3/CloudFront, Netlify, GitHub Pages).
If opening locally via file://, some browsers block fetch('demo.json'); use:
  npx serve .
