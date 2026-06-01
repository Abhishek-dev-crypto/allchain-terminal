"use client";

import './globals.css';
import { usePathname } from "next/navigation";

import { NotificationProvider } from "./contexts/NotificationContext";
import ClientWrapper from "./components/ClientWrapper";
import Warning from "./components/Warning";
import NavBar from './components/Navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body>
  <NotificationProvider>

    {pathname !== "/" && <Warning />}

    

    <ClientWrapper>{children}</ClientWrapper>

    <div className="border-t border-black bg-yellow-300 px-4 py-2 text-center text-[10px] font-extrabold tracking-widest text-black">
      SIMULATION MODE ACTIVE — ALLCHAIN CURRENTLY OPERATES IN A PAPER TRADING ENVIRONMENT
    </div>

  </NotificationProvider>
</body>
    </html>
  );
}