"use client";

import { useEffect, useState, useRef } from "react";
import { useGenie } from "@/app/contexts/GenieRuntimeContext";

 const GenieBrows = ({ size = "normal" }: { size?: "normal" | "small" }) => {
  const browWidth = size === "small" ? "w-3 h-[1.5px]" : "w-4 h-[2px]";
  const tilt = size === "small" ? "25deg" : "20deg";

  return (
    <div className="flex gap-2">
      <div
        className={`${browWidth} bg-white/80 rounded-full origin-center`}
        style={{ transform: `rotate(${tilt})` }}
      />
      <div
        className={`${browWidth} bg-white/80 rounded-full origin-center`}
        style={{ transform: `rotate(-${tilt})` }}
      />
    </div>
  );
};

const GenieEyes = ({
  emotion = "neutral",
  x,
  y,
  blink,
}: {
  emotion?: "neutral" | "focused" | "excited";
  x: number;
  y: number;
  blink: boolean;
}) => {
  const eyeOffsetX = Math.max(-5, Math.min(5, x));
const eyeOffsetY = Math.max(-4, Math.min(4, y));
const focusBoost = emotion === "focused" ? 1.2 : 1;

  const emotionScale =
  emotion === "focused"
    ? 0.85
    : emotion === "excited"
    ? 1.15
    : 1;

  return (
    <div className="flex gap-2 items-center justify-center">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 bg-white rounded-full transition-all duration-100"
          style={{
  transform: `
    translate(
      ${eyeOffsetX * focusBoost}px,
      ${eyeOffsetY * focusBoost}px
    )
    scaleY(${blink ? 0.1 : 1})
    scale(${emotionScale})
  `,
  opacity: blink ? 0.8 : 1,
}}
        />
      ))}
    </div>
  );
};

export default function GenieModal() {
  const [mounted, setMounted] = useState(false);

  const [hovered, setHovered] = useState(false);
  const [message, setMessage] = useState("");

  const currentSectionRef = useRef<string | null>(null);

 const {
    state,
    startTour,
    currentSection,
    setCurrentSection,
    setMinimized,
} = useGenie();

const minimized = state.minimized;

  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);

  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [hasTarget, setHasTarget] = useState(false);


  useEffect(() => {
    if (minimized) return;

    setMessage("");

    const text =
      "Hi, I'm Genie. I'll help you explore AllChain and learn how everything works.";

    let i = 0;

    const interval = setInterval(() => {
      setMessage(text.slice(0, i));
      i++;

      if (i > text.length) {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [minimized]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const diffX = (e.clientX - centerX) / 80;
    const diffY = (e.clientY - centerY) / 80;

    setMouse({ x: diffX, y: diffY });
  };

  window.addEventListener("mousemove", handleMouseMove);
  return () => window.removeEventListener("mousemove", handleMouseMove);
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    setBlink(true);

    setTimeout(() => setBlink(false), 120);
  }, 3000 + Math.random() * 2000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  if (!state.activeTarget) {
    setHasTarget(false);
    return;
  }

  const el = document.querySelector(
  `[data-genie="${state.activeTarget}"]`
) as HTMLElement | null;
  if (!el) return;

  const rect = el.getBoundingClientRect();

  setTargetPos({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  });

  setHasTarget(true);
}, [state.activeTarget]);

const [smoothTarget, setSmoothTarget] = useState({ x: 0, y: 0 });

const SECTION_GAZE: Record<
  string,
  { x: number; y: number }
> = {
  "hero-section": { x: -4, y: -2 },
  "ai-preview": { x: -2, y: -1 },
  "why-traders-fail": { x: 0, y: 0 },
  "market-block": { x: 2, y: -1 },
  "final-cta": { x: 4, y: 0 },
};

const SECTION_EMOTIONS: Record<
  string,
  "neutral" | "focused" | "excited"
> = {
  "hero-section": "excited",
  "ai-preview": "focused",
  "why-traders-fail": "focused",
  "market-block": "focused",
  "final-cta": "excited",
};

const gazeMode =
  state.tourActive && hasTarget
    ? "lockon"
    : currentSection
    ? "section"
    : "cursor";

    const [smoothSectionGaze, setSmoothSectionGaze] = useState({
  x: 0,
  y: 0,
});

const gazeX =
  gazeMode === "lockon"
    ? (smoothTarget.x - window.innerWidth / 2) / 60
    : gazeMode === "section"
    ? smoothSectionGaze.x
    : mouse.x;

const gazeY =
  gazeMode === "lockon"
    ? (smoothTarget.y - window.innerHeight / 2) / 60
    : gazeMode === "section"
    ? smoothSectionGaze.y
    : mouse.y; 

useEffect(() => {
  if (gazeMode !== "section") return;

  const target =
    SECTION_GAZE[currentSection ?? ""] ?? {
      x: 0,
      y: 0,
    };

  let raf: number;

  const animate = () => {
    setSmoothSectionGaze((prev) => ({
      x: prev.x + (target.x - prev.x) * 0.08,
      y: prev.y + (target.y - prev.y) * 0.08,
    }));

    raf = requestAnimationFrame(animate);
  };

  raf = requestAnimationFrame(animate);

  return () => cancelAnimationFrame(raf);
}, [currentSection, gazeMode]);

    useEffect(() => {
  const sections = document.querySelectorAll("[data-genie]");

  if (!sections.length) return;

 const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort(
        (a, b) =>
          b.intersectionRatio - a.intersectionRatio
      );

    if (!visible.length) return;

    const section =
      visible[0].target.getAttribute("data-genie");

    if (
      section &&
      section !== currentSectionRef.current
    ) {
      currentSectionRef.current = section;
      setCurrentSection(section);
    }
  },
  {
    threshold: [0.25, 0.5, 0.75],
    rootMargin: "-20% 0px -20% 0px",
  }
);

  sections.forEach((section) => {
    observer.observe(section);
  });

  return () => {
    observer.disconnect();
  };
}, [setCurrentSection]);

useEffect(() => {
  let raf: number;

  const animate = () => {
    setSmoothTarget((prev) => {
      const dx = targetPos.x - prev.x;
      const dy = targetPos.y - prev.y;

      return {
        x: prev.x + dx * 0.12,
        y: prev.y + dy * 0.12,
      };
    });

    raf = requestAnimationFrame(animate);
  };

  if (hasTarget) {
    raf = requestAnimationFrame(animate);
  }

  return () => cancelAnimationFrame(raf);
}, [targetPos, hasTarget]);

const emotion =
  state.tourActive
    ? "focused"
    : hovered
    ? "excited"
    : currentSection
    ? SECTION_EMOTIONS[currentSection] ?? "neutral"
    : "neutral";

 if (!mounted) return null;

const isTourRunning = state.tourActive && !!state.activeTarget;

if (isTourRunning) return null;

  // Minimized Orb
  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="fixed bottom-6 right-6 z-[9999]"
      >
        <div className="relative w-16 h-16 genie-float">
          <div
            className={`absolute inset-0 rounded-full blur-xl transition-all duration-300 ${
              hovered ? "bg-cyan-400/60 scale-125" : "bg-cyan-500/30"
            }`}
          />

          <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full bg-black/80 border border-white/10 text-xs text-white pointer-events-none">
            {hovered ? "Let's explore AllChain 🚀" : "Need help?"}
          </div>

          <div
            className={`absolute inset-1 rounded-full bg-gradient-to-br from-cyan-300 via-blue-500 to-blue-700 flex items-center justify-center transition-all duration-300 ${
              hovered ? "scale-110" : "scale-100"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
             <GenieBrows size="small" />

              <div className="flex gap-2">
               <GenieEyes
                  emotion={emotion}
                  x={gazeX}
                  y={gazeY}
                  blink={blink}/>
              </div>

              <div className="w-4 h-2 border-b-2 border-white rounded-b-full" />
            </div>
          </div>

          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-8 h-10 bg-gradient-to-b from-cyan-400 to-transparent blur-sm" />
        </div>
      </button>
    );
  }

  // Expanded Genie
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
    zIndex: 9999,
}}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* Modal */}
      <div className="relative w-[420px] max-w-[88%] rounded-3xl border border-white/10 bg-black/80 backdrop-blur-xl p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-md animate-pulse" />
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-cyan-300 to-blue-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            <div>
              <div className="text-white text-sm font-medium">Genie</div>
              <div className="text-xs text-cyan-300">Ready to Help</div>
            </div>
          </div>

          <button
            onClick={() => {
  localStorage.setItem("genie_seen_v1", "true");
  setMinimized(true);
}}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 genie-float">
             
              {/* Ponytail (expanded only) */}
<div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-10 bg-gradient-to-b from-cyan-300 via-blue-400 to-transparent rounded-full blur-sm opacity-70" />
              <div className="genie-speaking-ring" />
              <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-3xl animate-pulse" />
<div className="absolute top-8 left-1/2 -translate-x-1/2 w-5 h-12 bg-gradient-to-b from-cyan-300 via-blue-400 to-transparent rounded-b-full blur-[1px] opacity-70" />
              <div className="absolute top-3 left-3 right-3 bottom-4 rounded-full bg-gradient-to-br from-cyan-300 via-blue-500 to-blue-700 flex items-center justify-center">
                <div className="flex flex-col items-center gap-1">
                 <GenieBrows size="small" />

                  <div className="flex gap-2">
                    <GenieEyes
    emotion={emotion}
    x={gazeX}
    y={gazeY}
    blink={blink}
/>
                   
                  </div>

                  <div className="w-4 h-2 border-b-2 border-white rounded-b-full" />
                </div>
              </div>

              <div className="absolute bottom-[-14px] left-1/2 -translate-x-1/2 w-8 h-10 bg-gradient-to-b from-cyan-400 to-transparent blur-md" />
            </div>
          </div>

          <p className="mt-2 text-gray-300 text-sm leading-relaxed min-h-[56px]">
            {message}
            <span className="animate-pulse">|</span>
          </p>

          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              


onClick={() => {
  if (state.tourActive) {
    setMinimized(true);
    return;
  }

  startTour("landing");
  
}}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-medium shadow-[0_0_20px_rgba(34,211,238,0.35)] hover:scale-105 transition"
            >
              Explore
            </button>

            <button
              onClick={() => {
  localStorage.setItem("genie_seen_v1", "true");
  setMinimized(true);
}}
              className="px-3 py-2 text-sm text-gray-400 hover:text-white transition"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}