"use client";

import AlertStream from "../free/AlertStream";
import MomentumAnalysis from "../free/MomentumAnalysis";
import VolatilityRadar from "../free/VolatilityRadar";
import RegimePulse from "../free/RegimePulse";
import AINarrativeEngine from "../free/AINarrativeEngine";

export default function SignalsWorkspace() {
  return (
    <div className="space-y-4">

      {/* PRIMARY SIGNAL FEED */}
      <AlertStream />

      {/* SIGNAL CONFIRMATION */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

        <MomentumAnalysis />

        <AINarrativeEngine />

      </div>

    </div>
  );
}