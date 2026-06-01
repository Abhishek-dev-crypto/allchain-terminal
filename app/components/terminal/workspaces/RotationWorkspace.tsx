"use client";

import SectorPerformance from "../free/SectorPerformance";
import CrossSectorMatrix from "../free/CrossSectorMatrix";


export default function RotationWorkspace() {
  return (
    <div className="space-y-4">

      {/* SECTOR LEADERSHIP */}
      <SectorPerformance />

      <CrossSectorMatrix />

    </div>
  );
}