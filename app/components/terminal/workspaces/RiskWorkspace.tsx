"use client";

import VolatilityRadar from "../free/VolatilityRadar";
import RegimePulse from "../free/RegimePulse";
import CapitalFlow from "../free/CapitalFlow";
import AlertStream from "../free/AlertStream";
import CrossSectorMatrix from "../free/CrossSectorMatrix";

export default function RiskWorkspace() {
  return (
    <div className="space-y-4">

      {/* PRIMARY RISK ENGINE */}
      <VolatilityRadar />

      {/* STRUCTURAL RISK ANALYSIS */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

        <RegimePulse />

        <CapitalFlow />

      </div>

      {/* LIVE RISK EVENTS */}
      <CrossSectorMatrix />

    </div>
  );
}