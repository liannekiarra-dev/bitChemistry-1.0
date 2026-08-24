// =========================================================
//  bitChemistry — Activity Randomizer
//  React + Framer Motion. Three cards (food / activity / drink).
//  Each card has a "typing bar" that continuously scrolls through
//  the possible words, and a picture card. Hit "randomize" and each
//  section locks onto a random pick with a Framer Motion reveal.
// =========================================================
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import htm from "htm";

const html = htm.bind(React.createElement);

// ---------------- data pools (several possible values each) ----------------
const POOLS = {
  food: {
    label: "favourite food",
    accent: "#7fffd4", // aqua / mint  (palette two)
    options: [
      { word: "pizza", emoji: "🍕" },
      { word: "sushi", emoji: "🍣" },
      { word: "ramen", emoji: "🍜" },
      { word: "tacos", emoji: "🌮" },
      { word: "burgers", emoji: "🍔" },
      { word: "pasta", emoji: "🍝" },
      { word: "dumplings", emoji: "🥟" },
      { word: "pancakes", emoji: "🥞" },
      { word: "ice cream", emoji: "🍦" },
      { word: "strawberries", emoji: "🍓" },
      { word: "cupcakes", emoji: "🧁" },
    ],
  },
  activity: {
    label: "preferred activity",
    accent: "#ff5ee6", // hot pink  (palette two)
    options: [
      { word: "neon arcade", emoji: "🕹️" },
      { word: "stargazing", emoji: "🔭" },
      { word: "cinema night", emoji: "🎬" },
      { word: "live concert", emoji: "🎵" },
      { word: "bike ride", emoji: "🚲" },
      { word: "museum trip", emoji: "🏛️" },
      { word: "cooking class", emoji: "🍳" },
      { word: "sunset hike", emoji: "🥾" },
      { word: "bowling", emoji: "🎳" },
      { word: "karaoke", emoji: "🎤" },
      { word: "art jam", emoji: "🎨" },
    ],
  },
  drink: {
    label: "most liked drink",
    accent: "#c4a5ff", // lavender / purple  (palette two)
    options: [
      { word: "coffee", emoji: "☕" },
      { word: "bubble tea", emoji: "🧋" },
      { word: "matcha", emoji: "🍵" },
      { word: "smoothie", emoji: "🥤" },
      { word: "cocktail", emoji: "🍸" },
      { word: "hot cocoa", emoji: "🍫" },
      { word: "lemonade", emoji: "🍋" },
      { word: "red wine", emoji: "🍷" },
      { word: "milkshake", emoji: "🥛" },
      { word: "fresh juice", emoji: "🧃" },
    ],
  },
};

const rand = (n) => Math.floor(Math.random() * n);

// ---------------- hook: continuously scroll/type through the words ----------------
// It types/scrolls through the pool forever UNTIL `lock()` is called
// (by the randomize button), which freezes it on a chosen option.
function useTypeReel(options) {
  const [index, setIndex] = useState(() => rand(options.length));
  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);
  // phase machine kept in a ref so the loop closure stays stable
  const st = useRef({ i: index, phase: "typing", c: 0 });
  const timer = useRef(null);
  const frozen = useRef(false);

  // freeze on a specific option (used by "randomize") — stops typing
  const lock = (ni) => {
    frozen.current = true;
    clearTimeout(timer.current);
    st.current = { i: ni, phase: "locked", c: options[ni].word.length };
    setIndex(ni);
    setText(options[ni].word);
    setLocked(true);
  };

  useEffect(() => {
    let alive = true;
    const tick = () => {
      if (!alive || frozen.current) return;
      const s = st.current;
      const w = options[s.i].word;

      if (s.phase === "typing") {
        s.c++;
        setText(w.slice(0, s.c));
        if (s.c >= w.length) s.phase = "hold";
        timer.current = setTimeout(tick, 70 + Math.random() * 45);
      } else if (s.phase === "hold") {
        s.phase = "deleting";
        timer.current = setTimeout(tick, 1200);
      } else {
        s.c--;
        setText(w.slice(0, Math.max(0, s.c)));
        if (s.c <= 0) {
          s.i = (s.i + 1) % options.length;
          s.phase = "typing";
          setIndex(s.i);
        }
        timer.current = setTimeout(tick, 34);
      }
    };
    timer.current = setTimeout(tick, 350);
    return () => {
      alive = false;
      clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { index, text, locked, lock };
}

// ---------------- single card ----------------
function Card({ pool, nonce, delay }) {
  const { index, text, locked, lock } = useTypeReel(pool.options);
  const current = pool.options[index];

  // when the randomize nonce changes, freeze onto a random option
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    lock(rand(pool.options.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  return html`
    <${motion.div}
      className="rz-card"
      style=${{ "--accent": pool.accent }}
      initial=${{ opacity: 0, y: 40 }}
      whileInView=${{ opacity: 1, y: 0 }}
      viewport=${{ once: true, amount: 0.3 }}
      transition=${{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover=${{ y: -6 }}
    >
      <div className="rz-pill">${pool.label}</div>

      <div className="rz-typebar">
        <span className="rz-typetext">${text}</span>
        ${locked ? null : html`<span className="rz-caret" />`}
      </div>

      <div className="rz-picture">
        <${AnimatePresence} mode="popLayout">
          <${motion.div}
            key=${index}
            className="rz-emoji"
            initial=${{ opacity: 0, scale: 0.4, rotate: -18, filter: "blur(6px)" }}
            animate=${{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
            exit=${{ opacity: 0, scale: 0.4, rotate: 18, filter: "blur(6px)" }}
            transition=${{ type: "spring", stiffness: 260, damping: 18 }}
          >
            ${current.emoji}
          <//>
        <//>
        <${motion.div}
          className="rz-caption"
          key=${"cap-" + index}
          initial=${{ opacity: 0, y: 8 }}
          animate=${{ opacity: 1, y: 0 }}
          transition=${{ delay: 0.12 }}
        >
          ${current.word}
        <//>
      </div>
    <//>
  `;
}

// ---------------- app ----------------
function Randomizer() {
  const [nonce, setNonce] = useState(0);
  const keys = ["food", "activity", "drink"];

  return html`
    <div className="rz-wrap">
      <div className="rz-cards">
        ${keys.map(
          (k, i) => html`<${Card} key=${k} pool=${POOLS[k]} nonce=${nonce} delay=${i * 0.12} />`
        )}
      </div>

      <${motion.button}
        className="randomize-btn"
        onClick=${() => setNonce((n) => n + 1)}
        whileHover=${{ scale: 1.05 }}
        whileTap=${{ scale: 0.93 }}
      >
        ⚡ randomize
      <//>
    </div>
  `;
}

createRoot(document.getElementById("randomizer-root")).render(html`<${Randomizer} />`);
