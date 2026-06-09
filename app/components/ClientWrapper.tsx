"use client";

import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

import GlobalNav from "./GlobalNav";
import Navigation from "./Navigation";
import Warning from "./Warning"; // add this

const queryClient = new QueryClient();

export default function ClientWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <QueryClientProvider client={queryClient}>

      {!isLanding && <GlobalNav />}

      {/* 🔥 MOVE WARNING HERE */}
      {!isLanding && <Warning />}

      <main className="min-h-screen">{children}</main>

      {!isLanding && <Navigation />}

    </QueryClientProvider>
  );
}