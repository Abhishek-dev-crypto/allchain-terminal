'use client';

import { useState } from 'react';

export default function Topbar() {
  const [query, setQuery] = useState('');

  return (
    <div className="sticky top-0 z-40 h-[56px] border-b border-white/10 bg-[#050816]/95 backdrop-blur-xl">

      <div className="h-full px-4 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-4">

          {/* Search */}
          <div className="relative w-[300px]">

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search markets, AI signals, narratives..."
              className="
                w-full
                h-9
                rounded-lg
                border
                border-white/10
                bg-white/[0.04]
                px-3
                pr-10
                text-sm
                text-white
                placeholder:text-gray-500
                outline-none
                focus:border-emerald-400/30
                focus:bg-white/[0.06]
                transition-all
              "
            />

            {/* Shortcut */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">

              <span className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-gray-500">
                ⌘
              </span>

              <span className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-gray-500">
                K
              </span>

            </div>

          </div>

          {/* Market Status */}
          <div className="hidden lg:flex items-center gap-3">

            {/* Live Pulse */}
            <div className="flex items-center gap-2">

              <div className="relative flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <div className="absolute h-4 w-4 rounded-full bg-emerald-400/20 animate-ping" />
              </div>

              <span className="text-xs text-emerald-300">
                Markets Active
              </span>

            </div>

            {/* Divider */}
            <div className="h-4 w-px bg-white/10" />

            {/* Feed */}
            <div className="text-xs text-gray-500">
              Real-time intelligence feed online
            </div>

          </div>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">

          {/* AI Engine */}
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 h-9">

            <div className="relative flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-violet-400" />
              <div className="absolute h-4 w-4 rounded-full bg-violet-400/20 animate-ping" />
            </div>

            <span className="text-xs font-medium text-violet-300">
              AI Engine Online
            </span>

          </div>

          {/* Notifications */}
          <button
            className="
              relative
              h-9
              w-9
              rounded-lg
              border
              border-white/10
              bg-white/[0.04]
              text-gray-400
              hover:bg-white/[0.08]
              hover:text-white
              transition-all
            "
          >
            🔔

            {/* Notification Dot */}
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-400" />
          </button>

          {/* Settings */}
          <button
            className="
              h-9
              w-9
              rounded-lg
              border
              border-white/10
              bg-white/[0.04]
              text-gray-400
              hover:bg-white/[0.08]
              hover:text-white
              transition-all
            "
          >
            ⚙️
          </button>

          {/* User */}
          <button className="ml-1 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2 pr-3 h-9 hover:bg-white/[0.06] transition-all">

            <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px] font-medium text-emerald-300">
              U
            </div>

            <div className="hidden xl:block text-left">
              <p className="text-xs text-white">
                User
              </p>

              <p className="text-[10px] text-gray-500">
                Free Plan
              </p>
            </div>

          </button>

        </div>

      </div>

    </div>
  );
}