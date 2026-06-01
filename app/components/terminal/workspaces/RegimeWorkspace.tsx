"use client";

import RegimePulse from "../free/RegimePulse";
import VolatilityRadar from "../free/VolatilityRadar";

export default function RegimeWorkspace() {
  return (
    <div className="space-y-4">
      <RegimePulse />
      <VolatilityRadar />
    </div>
  );
}