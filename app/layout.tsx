"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Script from "next/script";

import { NotificationProvider } from "./contexts/NotificationContext";
import ClientWrapper from "./components/ClientWrapper";
import Warning from "./components/Warning";
import NavBar from "./components/Navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-W3ERYPVTN7"
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-W3ERYPVTN7');
        `}
      </Script>

      <body>
        <NotificationProvider>
          {pathname !== "/" && <Warning />}

          <ClientWrapper>{children}</ClientWrapper>

          <div className="border-t border-black bg-yellow-300 px-4 py-2 text-center text-[10px] font-extrabold tracking-widest text-black">
            SIMULATION MODE ACTIVE — ALLCHAIN CURRENTLY OPERATES IN A PAPER
            TRADING ENVIRONMENT
          </div>
        </NotificationProvider>
      </body>
    </html>
  );
}