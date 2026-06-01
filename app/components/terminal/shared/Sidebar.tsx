'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Market', path: '/market' },
    { name: 'Sectors', path: '/sectors' },
    { name: 'Heatmap', path: '/heatmap' },
    { name: 'Alerts', path: '/alerts' },
    { name: 'News', path: '/news' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-[220px] border-r border-white/10 bg-[#070b1d] flex flex-col justify-between">

      {/* TOP */}
      <div>

        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <h1 className="text-lg font-semibold tracking-wide text-white">
            AI CORE
          </h1>

          <p className="text-[11px] text-gray-500 mt-0.5">
            Crypto Intelligence Terminal
          </p>
        </div>

        {/* Tier Switch */}
        <div className="px-3 pt-4 flex gap-2">

          <button className="flex-1 h-8 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-[11px] font-medium text-emerald-400">
            FREE
          </button>

          <button className="flex-1 h-8 rounded-md border border-violet-500/20 bg-violet-500/10 text-[11px] font-medium text-violet-300 hover:bg-violet-500/20 transition-colors">
            PREMIUM
          </button>

        </div>

        {/* Navigation */}
        <nav className="mt-5 px-2 space-y-1">

          {navItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`relative w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >

                {/* Active Indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] bg-emerald-400 rounded-full" />
                )}

                <div className="flex items-center justify-between">

                  <span className="pl-1">
                    {item.name}
                  </span>

                  {item.name === 'Alerts' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                      3
                    </span>
                  )}

                </div>

              </button>
            );
          })}

        </nav>

        {/* Upgrade Card */}
        <div className="mx-3 mt-6 rounded-2xl border border-violet-500/10 bg-gradient-to-b from-violet-500/[0.08] to-transparent p-4">

          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">
              Predictive AI
            </h3>

            <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed">
            Unlock predictive intelligence, whale tracking,
            AI probabilities and behavioral analytics.
          </p>

          <button className="mt-4 w-full h-9 rounded-lg bg-violet-500 text-xs font-medium text-white hover:bg-violet-400 transition-colors">
            Upgrade Now
          </button>

        </div>

      </div>

      {/* FOOTER USER */}
      <div className="border-t border-white/10 p-3">

        <div className="flex items-center gap-3">

          {/* Avatar */}
          <div className="h-9 w-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-sm font-medium text-gray-300">
            U
          </div>

          {/* User Info */}
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              User
            </p>

            <div className="flex items-center gap-2 mt-0.5">

              <span className="text-[11px] text-gray-500">
                Free Plan
              </span>

              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            </div>
          </div>

        </div>

      </div>

    </aside>
  );
}