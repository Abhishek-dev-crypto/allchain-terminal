'use client';

import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-[#050816] text-white flex overflow-hidden">

      {/* SIDEBAR (fixed width, no scroll bleed) */}
      <div className="h-full shrink-0">
        <Sidebar />
      </div>

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">

        {/* TOPBAR (fixed height, sticky behavior) */}
        <div className="shrink-0 z-30">
          <Topbar />
        </div>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4">

          {/* Inner container for future grid control */}
          <div className="min-h-full w-full">

            {children}

          </div>

        </main>

      </div>

    </div>
  );
}