"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Script from "next/script";
import GenieModal from "./components/genie/GenieModal";

import { NotificationProvider } from "./contexts/NotificationContext";
import ClientWrapper from "./components/ClientWrapper";
import { GenieRuntimeProvider } from "./contexts/GenieRuntimeContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-W3ERYPVTN7"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;

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

        <NotificationProvider>
          <ClientWrapper>
            <GenieRuntimeProvider>
              {children}

              {pathname === "/" && <GenieModal />}
            </GenieRuntimeProvider>
          </ClientWrapper>
        </NotificationProvider>
      </body>
    </html>
  );
}