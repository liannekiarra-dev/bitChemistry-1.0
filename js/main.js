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

  // ---------------- DECISION: the un-clickable "no" ----------------
  gsap.from("#decision .frame", {
    scrollTrigger: { trigger: "#decision", start: "top 70%" },
    y: 60,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out",
  });

  const btnNo = document.getElementById("btn-no");
  const btnYes = document.getElementById("btn-yes");

  const NO_LABELS = [
    "no",
    "are you sure?",
    "really?",
    "think again",
    "the boxes already shipped",
    "don't be shy",
    "you know you want to",
    "resistance is futile",
    "one more chance...",
    "just say yes 🙃",
    "pretty please 💗",
  ];
  let noCount = 0;
  let noScale = 1;

  function dodge() {
    noCount++;
    // fling the button to a random nearby spot and shrink it
    const dx = (Math.random() - 0.5) * 320;
    const dy = (Math.random() - 0.5) * 180;
    noScale = Math.max(0.35, noScale - 0.07);
    gsap.to(btnNo, {
      x: dx,
      y: dy,
      scale: noScale,
      rotation: (Math.random() - 0.5) * 30,
      duration: 0.28,
      ease: "power3.out",
    });
    btnNo.textContent = NO_LABELS[Math.min(noCount, NO_LABELS.length - 1)];
    // ...and make "yes" more tempting each time
    gsap.to(btnYes, { scale: 1 + noCount * 0.14, duration: 0.28, ease: "back.out(2)" });
  }

  // dodges whether you hover it or (somehow) manage to click it
  btnNo.addEventListener("mouseenter", dodge);
  btnNo.addEventListener("click", (e) => {
    e.preventDefault();
    dodge();
  });
  btnNo.addEventListener("touchstart", (e) => {
    e.preventDefault();
    dodge();
  });

  const scheduler = document.getElementById("scheduler");
  const dateInput = document.getElementById("date-input");
  const timeInput = document.getElementById("time-input");
  const schedulerConfirm = document.getElementById("scheduler-confirm");

  // default the date to today, time to 19:00
  const today = new Date();
  dateInput.min = today.toISOString().split("T")[0];
  dateInput.value = today.toISOString().split("T")[0];
  timeInput.value = "19:00";

  btnYes.addEventListener("click", () => {
    if (!scheduler.hidden) return;
    // reveal the calendar / date + time picker
    scheduler.hidden = false;
    gsap.fromTo(
      scheduler,
      { opacity: 0, y: 24, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.8)" }
    );
    gsap.to(btnYes, { scale: "+=0.25", duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" });
    // hide the (tiny, defeated) "no" button
    gsap.to(btnNo, { opacity: 0, scale: 0, duration: 0.4, ease: "power2.in" });
    logo && logo.classList.add("glitching");
    setTimeout(() => logo && logo.classList.remove("glitching"), 400);
  });

  const btnConfirm = document.getElementById("btn-confirm");
  btnConfirm.addEventListener("click", () => {
    if (!dateInput.value || !timeInput.value) {
      schedulerConfirm.textContent = "pick a date and time first 💫";
      gsap.fromTo(schedulerConfirm, { x: -8 }, { x: 0, duration: 0.3, ease: "elastic.out(1,0.4)" });
      return;
    }
    const when = new Date(dateInput.value + "T" + timeInput.value);
    const pretty = when.toLocaleString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
    schedulerConfirm.textContent = "⚡ date locked in for " + pretty + " 💘";
    gsap.fromTo(
      schedulerConfirm,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2.2)" }
    );
    gsap.to(btnConfirm, { scale: "+=0.15", duration: 0.2, yoyo: true, repeat: 1 });

    // reveal the excited gif + "i cant wait"
    const dateSet = document.getElementById("date-set");
    dateSet.hidden = false;
    gsap.fromTo(
      dateSet,
      { opacity: 0, y: 24, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
    );
  });
})();
