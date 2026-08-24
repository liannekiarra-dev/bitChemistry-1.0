# bitChemistry

A playful, cyberpunk / neon **date scheduler** landing site — built to match the three concept screenshots.

Three animated sections:

1. **Hero / logo** — pastel "tetris" boxes start scattered off-screen and are pulled together by **real physics springs** (Matter.js) to form the `bitChemistry` cluster. They overshoot, jiggle and settle. You can **drag** the boxes to fling them and watch them snap back, or **click the logo** to re-scatter and re-assemble. A **typewriter** effect types the tagline.
2. **About** — the description types itself out with a blinking caret when it scrolls into view.
3. **Activity randomizer** — built with **React + Framer Motion**. Three cards (**favourite food / preferred activity / most liked drink**). Each card has a **typing bar** that continuously *scrolls / types through* all the possible words, and a **picture card** (emoji) that animates in with a Framer Motion spring. Hit **randomize** and every section locks onto a random value with a reveal animation. Each section has several possible values in its pool.

Behind everything is a **Three.js + WebGL** cyberpunk scene: an infinite neon grid floor, drifting neon particles, and an `UnrealBloom` post-processing pass for the glow. A CRT scanline + vignette overlay finishes the look. **GSAP + ScrollTrigger** drive the entrances and glitch bursts. Card accents use the "palette two" neon colours (mint, hot pink, lavender).

## Tech

- **Three.js** (WebGL) — animated neon background + bloom glow
- **Matter.js** — physics-based box assembly + drag interactivity
- **React 18 + Framer Motion** — the randomizer cards, typing reels & picture animations
- **GSAP + ScrollTrigger** — typewriter, scroll reveals, glitch
- **HTML5 + CSS** — no build step; React/Three/Framer Motion all load via ESM import maps from CDN

## Files

```
bitchemistry/
├── index.html          # markup for the 3 sections + CDN libs
├── css/style.css       # cyberpunk / neon theme
└── js/
    ├── background.js    # Three.js WebGL scene (module)
    ├── physics.js       # Matter.js box assembly
    ├── main.js          # GSAP typewriter, scroll reveals, glitch
    └── app.js           # React + Framer Motion randomizer (module)
```
