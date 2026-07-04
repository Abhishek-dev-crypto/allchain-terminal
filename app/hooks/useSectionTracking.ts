"use client";

import { useEffect } from "react";
import { useGenie } from "@/app/contexts/GenieRuntimeContext";

const SECTION_IDS = [
  "hero-section",
  "ai-preview",
  "why-traders-fail",
  "market-block",
  "final-cta",
];

export function useSectionTracking() {
  const { setActiveTarget } = useGenie();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTarget(entry.target.id);
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);

      if (el) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [setActiveTarget]);
}