// =========================================================
//  bitChemistry — Matter.js physics
//  Pastel boxes start scattered off-screen and are pulled by
//  springs into the logo cluster (screenshot 1). Real physics
//  => they overshoot, jiggle and settle. Drag them to fling.
// =========================================================
(function () {
  const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Body, Events } = Matter;

  const canvas = document.getElementById("physics-canvas");
  const frame = canvas.parentElement;

  // ---- normalized cluster layout (matches the tetris-like logo art) ----
  // x,y are 0..1 of the frame; s is size relative to min(frame w,h)
  const COLORS = {
    pink: "#ffd0ef",
    pinkHot: "#ff5ee6",
    lavender: "#c4b5fd",
    blue: "#b9c6ff",
    blueSoft: "#c8d2ff",
    green: "#5eead4",
    greenBright: "#34ffb0",
    purple: "#a855f7",
  };
  const LAYOUT = [
    { x: 0.34, y: 0.40, s: 0.085, c: COLORS.pink },
    { x: 0.42, y: 0.40, s: 0.085, c: COLORS.pinkHot },
    { x: 0.50, y: 0.40, s: 0.085, c: COLORS.blue },
    { x: 0.545, y: 0.30, s: 0.085, c: COLORS.green },
    { x: 0.55, y: 0.50, s: 0.085, c: COLORS.lavender },
    { x: 0.615, y: 0.48, s: 0.085, c: COLORS.green },
    { x: 0.66, y: 0.40, s: 0.085, c: COLORS.lavender },
    { x: 0.47, y: 0.60, s: 0.085, c: COLORS.blueSoft },
    { x: 0.545, y: 0.62, s: 0.085, c: COLORS.purple },
    { x: 0.62, y: 0.62, s: 0.085, c: COLORS.pinkHot },
    { x: 0.69, y: 0.55, s: 0.085, c: COLORS.greenBright },
  ];

  let W = frame.clientWidth;
  let H = frame.clientHeight;

  const engine = Engine.create();
  engine.gravity.y = 0; // float in space; springs do the work
  engine.gravity.x = 0;

  const render = Render.create({
    canvas,
    engine,
    options: {
      width: W,
      height: H,
      background: "transparent",
      wireframes: false,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    },
  });

  const boxes = [];

  function buildBoxes() {
    const min = Math.min(W, H);
    LAYOUT.forEach((item, i) => {
      const size = item.s * min * 1.9;
      const target = { x: item.x * W, y: item.y * H };
      // scatter start: random point on the outside ring
      const angle = (i / LAYOUT.length) * Math.PI * 2 + Math.random();
      const radius = Math.max(W, H) * (0.9 + Math.random() * 0.4);
      const start = {
        x: target.x + Math.cos(angle) * radius,
        y: target.y + Math.sin(angle) * radius,
      };
      const box = Bodies.rectangle(start.x, start.y, size, size, {
        chamfer: { radius: size * 0.22 },
        frictionAir: 0.12,
        restitution: 0.4,
        render: {
          fillStyle: item.c,
          strokeStyle: "rgba(255,255,255,0.25)",
          lineWidth: 1,
        },
      });
      box.plugin = { target, homeSize: size };
      Body.setAngularVelocity(box, (Math.random() - 0.5) * 0.3);
      boxes.push(box);
    });
    Composite.add(engine.world, boxes);
  }
  buildBoxes();

  // ---- spring force pulling each box toward its target ----
  const STIFFNESS = 0.0022;
  const DAMPING = 0.86;
  Events.on(engine, "beforeUpdate", () => {
    for (const box of boxes) {
      if (box.isDragged) continue;
      const t = box.plugin.target;
      const dx = t.x - box.position.x;
      const dy = t.y - box.position.y;
      Body.applyForce(box, box.position, {
        x: dx * STIFFNESS * box.mass,
        y: dy * STIFFNESS * box.mass,
      });
      Body.setVelocity(box, {
        x: box.velocity.x * DAMPING,
        y: box.velocity.y * DAMPING,
      });
      Body.setAngularVelocity(box, box.angularVelocity * 0.9);
    }
  });

  // ---- mouse drag: grab a box, fling it, springs pull it home ----
  const mouse = Mouse.create(canvas);
  mouse.pixelRatio = render.options.pixelRatio;
  const mc = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } },
  });
  Composite.add(engine.world, mc);
  Events.on(mc, "startdrag", (e) => { e.body.isDragged = true; });
  Events.on(mc, "enddrag", (e) => { e.body.isDragged = false; });
  // let the page scroll even when starting over the canvas
  canvas.addEventListener("wheel", (ev) => { ev.stopPropagation(); }, { passive: true });

  const runner = Runner.create();
  Runner.run(runner, engine);
  Render.run(render);

  // ---- responsive: rescale targets & canvas on resize ----
  function resize() {
    W = frame.clientWidth;
    H = frame.clientHeight;
    render.canvas.width = W * render.options.pixelRatio;
    render.canvas.height = H * render.options.pixelRatio;
    render.canvas.style.width = W + "px";
    render.canvas.style.height = H + "px";
    render.options.width = W;
    render.options.height = H;
    LAYOUT.forEach((item, i) => {
      if (boxes[i]) boxes[i].plugin.target = { x: item.x * W, y: item.y * H };
    });
  }
  window.addEventListener("resize", resize);
  resize();

  // expose a re-scatter helper (used by the logo click / re-assemble)
  window.bitPhysics = {
    scatter() {
      for (const box of boxes) {
        const ang = Math.random() * Math.PI * 2;
        const r = Math.max(W, H) * 1.1;
        Body.setPosition(box, {
          x: box.plugin.target.x + Math.cos(ang) * r,
          y: box.plugin.target.y + Math.sin(ang) * r,
        });
        Body.setVelocity(box, { x: 0, y: 0 });
      }
    },
  };
})();
