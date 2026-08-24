// =========================================================
//  bitChemistry — GSAP interactions
//  typewriter effect, scroll reveals, glitch, randomizer
// =========================================================
(function () {
  gsap.registerPlugin(ScrollTrigger);

  // ---------------- typewriter helper ----------------
  function typewriter(el, text, { speed = 32, onDone } = {}) {
    el.textContent = "";
    let i = 0;
    (function tick() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        // vary speed a little so it feels human
        const jitter = speed + (Math.random() * 40 - 10);
        setTimeout(tick, jitter);
      } else if (onDone) {
        onDone();
      }
    })();
  }

  // ---------------- HERO: tagline typewriter ----------------
  const tagline = document.getElementById("tagline");
  const TAGLINE = "> playful cyberpunk date scheduler for two.";
  window.addEventListener("load", () => {
    setTimeout(() => {
      typewriter(tagline, TAGLINE, {
        speed: 34,
        onDone: () => tagline.classList.add("done"),
      });
    }, 700);
  });

  // ---------------- HERO: logo entrance + glitch bursts ----------------
  const logo = document.querySelector(".logo");
  gsap.from(logo, {
    scale: 0.7,
    opacity: 0,
    duration: 1.1,
    ease: "back.out(1.7)",
    delay: 0.3,
  });
  function glitchBurst() {
    logo.classList.add("glitching");
    setTimeout(() => logo.classList.remove("glitching"), 180 + Math.random() * 160);
    setTimeout(glitchBurst, 2600 + Math.random() * 3800);
  }
  setTimeout(glitchBurst, 2500);

  // click the logo to re-scatter + re-assemble the physics boxes
  logo.addEventListener("click", () => {
    if (window.bitPhysics) window.bitPhysics.scatter();
    logo.classList.add("glitching");
    setTimeout(() => logo.classList.remove("glitching"), 260);
  });
  logo.style.pointerEvents = "auto";
  logo.style.cursor = "pointer";

  // ---------------- ABOUT: never-ending typewriter ----------------
  const aboutBody = document.getElementById("about-body");
  let aboutStarted = false;

  // cycles through these forever — never stops while the app is open
  const ABOUT_TEXTS = [
    "bitChemistry is a playful date scheduler built to plan activities for two people. Think of it as a dating app that skips the small talk and gets straight to planning the actual date.",
    "Most dating apps stop at the match. bitChemistry picks up where they leave off — turning a spark into a real plan by randomising the food, the activity and the drinks for your next date.",
    "Can't decide what to do together? Hit randomize and let the app brainstorm for you. From neon arcades and stargazing to ramen crawls and midnight bike rides, every combo is a new little adventure.",
    "It's a simple, futuristic date-activity scheduler with a cyberpunk heart: no endless swiping, no decision fatigue — just two people, a glowing screen, and a plan for tonight.",
    "Whether it's a first date or your hundredth, bitChemistry keeps things fresh by mixing favourite foods, preferred activities and top-choice drinks into a spontaneous itinerary for two.",
  ];

  function cyclingTypewriter(el, texts, { type = 24, del = 10, hold = 1800 } = {}) {
    let ti = 0;
    function typeOne() {
      const text = texts[ti];
      let i = 0;
      (function step() {
        el.textContent = text.slice(0, i);
        i++;
        if (i <= text.length) setTimeout(step, type + Math.random() * 32);
        else setTimeout(deleteOne, hold);
      })();
    }
    function deleteOne() {
      const text = texts[ti];
      let i = text.length;
      (function step() {
        el.textContent = text.slice(0, i);
        i--;
        if (i >= 0) setTimeout(step, del);
        else {
          ti = (ti + 1) % texts.length;
          setTimeout(typeOne, 250);
        }
      })();
    }
    typeOne();
  }

  gsap.from("#about .frame", {
    scrollTrigger: { trigger: "#about", start: "top 70%" },
    y: 60,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out",
  });

  ScrollTrigger.create({
    trigger: "#about",
    start: "top 55%",
    once: true,
    onEnter() {
      if (aboutStarted) return;
      aboutStarted = true;
      cyclingTypewriter(aboutBody, ABOUT_TEXTS);
    },
  });

  // ---------------- RANDOMIZER frame reveal ----------------
  // (the cards + logic live in js/app.js — React + Framer Motion)
  gsap.from("#randomizer .frame", {
    scrollTrigger: { trigger: "#randomizer", start: "top 70%" },
    y: 60,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out",
  });
})();
