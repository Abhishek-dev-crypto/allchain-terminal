"use client";

import AINarrativeEngine from "../free/AINarrativeEngine";

import CapitalFlow from "../free/CapitalFlow";
import AlertStream from "../free/AlertStream";
import { Coins } from "lucide-react";

export default function NarrativeWorkspace() {
  return (
    <div className="space-y-4">

      {/* PRIMARY AI NARRATIVE */}
      <AINarrativeEngine />

    </div>
  );
}