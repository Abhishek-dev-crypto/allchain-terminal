"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Script from "next/script";

import { NotificationProvider } from "./contexts/NotificationContext";
import ClientWrapper from "./components/ClientWrapper";
import Warning from "./components/Warning";


import { GenieProvider } from "@/app/contexts/GenieContext";
import GenieOrb from "@/app/components/genie/GenieOrb";
import GenieModal from "@/app/components/genie/GenieModal";
import GenieOverlay from "@/app/components/genie/GenieOverlay";

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

      <Script id="microsoft-clarity" strategy="afterInteractive">
  {`
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "x3q6al70ce");
  `}
</Script>

      <body>
        <NotificationProvider>
           <ClientWrapper>
          <GenieProvider>
          {pathname !== "/" && <Warning />}

          {children}

          <GenieOrb />
          <GenieModal />
          <GenieOverlay />
            
          <div className="border-t border-black bg-yellow-300 px-4 py-2 text-center text-[10px] font-extrabold tracking-widest text-black">
            SIMULATION MODE ACTIVE — ALLCHAIN CURRENTLY OPERATES IN A PAPER
            TRADING ENVIRONMENT
          </div>
          </GenieProvider>
          </ClientWrapper>
        </NotificationProvider>
      </body>
    </html>
  );
}