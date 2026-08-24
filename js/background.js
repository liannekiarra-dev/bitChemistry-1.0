// =========================================================
//  bitChemistry — Three.js / WebGL neon cyberpunk background
//  retro grid floor + drifting particles + UnrealBloom glow
// =========================================================
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const canvas = document.getElementById("bg-webgl");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000208, 0.055);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 2.2, 7);
camera.lookAt(0, 1.2, 0);

// ---------- neon grid floor (two of them for infinite scroll) ----------
const gridColor = new THREE.Color(0x22d3ee);
const gridColor2 = new THREE.Color(0xff5ee6);

function makeGrid() {
  const grid = new THREE.GridHelper(60, 60, gridColor, gridColor);
  grid.material.transparent = true;
  grid.material.opacity = 0.55;
  grid.position.y = -0.01;
  return grid;
}
const gridA = makeGrid();
const gridB = makeGrid();
gridB.position.z = -60;
scene.add(gridA, gridB);

// second-color accent grid overhead (ceiling) for depth
const ceiling = new THREE.GridHelper(60, 30, gridColor2, gridColor2);
ceiling.material.transparent = true;
ceiling.material.opacity = 0.18;
ceiling.position.y = 8;
scene.add(ceiling);

// ---------- drifting neon particles ----------
const PARTICLES = 900;
const positions = new Float32Array(PARTICLES * 3);
const colors = new Float32Array(PARTICLES * 3);
const palette = [
  new THREE.Color(0x22d3ee),
  new THREE.Color(0x5eead4),
  new THREE.Color(0xff5ee6),
  new THREE.Color(0xc4b5fd),
];
for (let i = 0; i < PARTICLES; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 40;
  positions[i * 3 + 1] = Math.random() * 14;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
  const c = palette[(Math.random() * palette.length) | 0];
  colors[i * 3 + 0] = c.r;
  colors[i * 3 + 1] = c.g;
  colors[i * 3 + 2] = c.b;
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
const pMat = new THREE.PointsMaterial({
  size: 0.12,
  vertexColors: true,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// ---------- postprocessing bloom (the neon glow) ----------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.9, // strength
  0.7, // radius
  0.15 // threshold
);
composer.addPass(bloom);

// ---------- pointer parallax ----------
const pointer = { x: 0, y: 0 };
window.addEventListener("pointermove", (e) => {
  pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
  pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ---------- animate ----------
const clock = new THREE.Clock();
let t = 0;
function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  t += dt;

  // scroll both grids toward camera, loop them
  const speed = 6;
  gridA.position.z += speed * dt;
  gridB.position.z += speed * dt;
  if (gridA.position.z > 60) gridA.position.z -= 120;
  if (gridB.position.z > 60) gridB.position.z -= 120;

  // slowly drift particles
  particles.rotation.y = t * 0.02;
  const pos = pGeo.attributes.position.array;
  for (let i = 0; i < PARTICLES; i++) {
    pos[i * 3 + 2] += speed * 0.35 * dt;
    if (pos[i * 3 + 2] > 12) pos[i * 3 + 2] = -60;
  }
  pGeo.attributes.position.needsUpdate = true;

  // gentle camera parallax
  camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.03;
  camera.position.y += (2.2 - pointer.y * 0.8 - camera.position.y) * 0.03;
  camera.lookAt(0, 1.2, -6);

  composer.render();
  requestAnimationFrame(animate);
}
animate();

// ---------- resize ----------
window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
});
