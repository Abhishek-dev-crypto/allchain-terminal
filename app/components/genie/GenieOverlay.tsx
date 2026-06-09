"use client";


import { useGenie } from "@/app/hooks/useGenie";
import { genieTour } from "@/lib/genieTour";

export default function GenieOverlay() {
  const { state, tourStep } = useGenie();

  if (state !== "tour") return null;

  const step = genieTour[tourStep];

  if (!step) return null;

  return (
    <>
      {/* DARK OVERLAY */}
      <div className="fixed inset-0 bg-black/70 z-40" />

      {/* HIGHLIGHT BOX (placeholder version) */}
      <div className="fixed top-20 left-10 z-50 bg-white text-black p-4 rounded shadow-lg w-[260px]">
        <h3 className="font-bold">{step.title}</h3>
        <p className="text-sm mt-2">{step.description}</p>

        <button
          className="mt-3 bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => {
            // next step logic will come next
          }}
        >
          Next
        </button>
      </div>
    </>
  );
}