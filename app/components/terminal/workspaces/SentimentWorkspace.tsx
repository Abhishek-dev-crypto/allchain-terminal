"use client";

import SentimentPanel from "../free/SentimentPanel";
import VolatilityRadar from "../free/VolatilityRadar";
import RegimePulse from "../free/RegimePulse";
import AlertStream from "../free/AlertStream";


export default function SentimentWorkspace() {
  return (
    <div className="space-y-4">

      {/* PRIMARY SENTIMENT ENGINE */}
      <SentimentPanel />


    </div>
  );
}