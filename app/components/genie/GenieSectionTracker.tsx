"use client";

import { useEffect } from "react";
import { useGenie } from "@/app/contexts/GenieRuntimeContext";

const SECTIONS = [
  "hero-section",
  "ai-preview",
  "why-traders-fail",
  "market-block",
  "final-cta",
];

export default function GenieSectionTracker() {
  const { setCurrentSection } = useGenie();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find(
          (entry) => entry.isIntersecting
        );

        if (!visible) return;

        setCurrentSection(
          visible.target.id
        );
      },
      {
        threshold: 0.4,
      }
    );

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);

      if (el) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [setCurrentSection]);

  return null;
}