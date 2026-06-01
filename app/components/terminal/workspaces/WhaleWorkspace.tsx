"use client";

import WhaleHighlights from "../free/WhaleHighlights";
import CapitalFlow from "../free/CapitalFlow";
import AlertStream from "../free/AlertStream";
import RegimePulse from "../free/RegimePulse";
import MarketHeatmap from "../free/MarketHeatmap";

export default function WhaleWorkspace() {
  return (
    <div className="space-y-4">

      {/* PRIMARY WHALE INTELLIGENCE */}
      <WhaleHighlights />

    </div>
  );
}