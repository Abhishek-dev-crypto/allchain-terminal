export default function SectorRotation() {
  return (
    <section className="rounded-[18px] border border-white/10 bg-[#060816] p-3.5 h-full overflow-hidden">

      {/* ================= HEADER ================= */}
      <div className="mb-3">

        <h3 className="text-[15px] font-semibold text-white">
          Sector Rotation
        </h3>

        <p className="mt-1 text-[10px] text-gray-500">
          Capital flow across sectors
        </p>

      </div>

      {/* ================= SECTORS ================= */}
      <div className="space-y-2">

        {[
          {
            name: "AI & Big Data",
            performance: "+8.42%",
            strength: "92%",
          },
          {
            name: "DeFi",
            performance: "+4.82%",
            strength: "76%",
          },
          {
            name: "Layer 1",
            performance: "+3.16%",
            strength: "68%",
          },
          {
            name: "Gaming",
            performance: "+2.21%",
            strength: "54%",
          },
          {
            name: "Infrastructure",
            performance: "+1.42%",
            strength: "42%",
          },
        ].map((sector) => (

          <div
            key={sector.name}
            className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
          >

            {/* TOP */}
            <div className="mb-1.5 flex items-start justify-between gap-2">

              <div className="min-w-0">

                <p className="truncate text-[12px] font-medium text-white leading-none">
                  {sector.name}
                </p>

                <p className="mt-1 truncate text-[9px] text-gray-500">
                  Strength {sector.strength}
                </p>

              </div>

              <p className="shrink-0 text-[10px] font-medium text-emerald-400">
                {sector.performance}
              </p>

            </div>

            {/* BAR */}
            <div className="h-1 overflow-hidden rounded-full bg-white/5">

              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400"
                style={{
                  width: sector.strength,
                }}
              />

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}