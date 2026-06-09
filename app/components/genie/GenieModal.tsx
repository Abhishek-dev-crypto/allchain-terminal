"use client";

import { useGenie } from "@/app/hooks/useGenie";

export default function GenieModal() {
  const { state, setState, setGoal, setExperience } = useGenie();

  if (state === "idle" || state === "minimized") return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#111] text-white p-6 rounded-xl w-[340px]">

        {/* STEP 1: WELCOME */}
        {state === "welcome" && (
          <>
            <h2 className="text-lg mb-3">Hi, I'm Genie 👋</h2>

            <p className="text-sm mb-4">
              I can guide you through AllChain in under 2 minutes.
            </p>

            <button
              className="w-full bg-blue-500 py-2 rounded mb-2"
              onClick={() => setState("goal")}
            >
              Show me around
            </button>

            <button
              className="w-full bg-gray-700 py-2 rounded"
              onClick={() => setState("minimized")}
            >
              I'll explore myself
            </button>
          </>
        )}

        {/* STEP 2: GOAL SELECTION */}
        {state === "goal" && (
          <>
            <h2 className="text-lg mb-4">What are you here for?</h2>

            {[
              "Understand Crypto Markets",
              "Practice Trading",
              "Find Opportunities",
              "Explore Platform",
            ].map((g) => (
              <button
                key={g}
                className="w-full bg-blue-600 py-2 rounded mb-2 text-sm"
                onClick={() => {
                  setGoal(g);
                  setState("experience");
                }}
              >
                {g}
              </button>
            ))}
          </>
        )}

        {/* STEP 3: EXPERIENCE */}
        {state === "experience" && (
          <>
            <h2 className="text-lg mb-4">Your experience level?</h2>

            {[
              "I'm new",
              "I trade occasionally",
              "Active trader",
              "Just exploring",
            ].map((e) => (
              <button
                key={e}
                className="w-full bg-green-600 py-2 rounded mb-2 text-sm"
                onClick={() => {
                  setExperience(e);
                  setState("tour");
                }}
              >
                {e}
              </button>
            ))}
          </>
        )}

      </div>
    </div>
  );
}