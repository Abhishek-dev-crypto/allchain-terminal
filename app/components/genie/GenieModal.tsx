"use client";

import { useGenie } from "@/app/contexts/GenieRuntimeContext";

export default function GenieModal() {
  const genie = useGenie();

  const state = genie?.state;

  if (!state) return null; // only hard safety

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#111] text-white p-6 rounded-xl w-[340px]">

        {state.stage === "onboarding" && (
          <>
            <h2>Hi, I'm Genie 👋</h2>

            <button onClick={() => genie.setIntent("trade")}>
              Start Trading
            </button>

            <button onClick={() => genie.setIntent("learn")}>
              Explore Intelligence
            </button>
          </>
        )}

        {state.stage === "trading" && (
          <>
            <p>🟢 Trade Mode Active</p>
            <button onClick={genie.advanceTradeFlow}>
              Next
            </button>
          </>
        )}

        {state.stage === "intel" && (
          <>
            <p>🧠 Intel Mode Active</p>
            <button onClick={genie.advanceIntelFlow}>
              Next
            </button>
          </>
        )}

      </div>
    </div>
  );
}