"use client";

import { useEffect, useState } from "react";
import { useGenie } from "../../../app/hooks/useGenie";

export default function GenieOrb() {
  const { state, setState } = useGenie();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
      setState("welcome");
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 cursor-pointer"
      onClick={() => setState("welcome")}
    >
      <div className="w-14 h-14 rounded-full bg-blue-500 animate-pulse shadow-lg flex items-center justify-center text-white">
        🧞
      </div>
    </div>
  );
}