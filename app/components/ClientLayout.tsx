"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Session } from "next-auth";
import { MyContextProvider } from "@/app/contexts/MyContext";
import { NotificationProvider } from "@/app/contexts/NotificationContext";

import "../styles/globals.css";

// ✅ Optional: Only needed if you're using React Query
const queryClient = new QueryClient();

// ✅ Navbar Component
function GlobalNav() {
  return (
    <nav className="bg-gray-800 text-white px-4 py-3 flex flex-col md:flex-row items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link href="/">
          <span className="text-2xl font-bold hover:text-blue-400 cursor-pointer">AllChain</span>
        </Link>
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
          <Link href="/dashboard"><span className="hover:text-blue-400 cursor-pointer">Dashboard</span></Link>
          <Link href="/trade"><span className="hover:text-blue-400 cursor-pointer">Trade</span></Link>
          <Link href="/security"><span className="hover:text-blue-400 cursor-pointer">Security</span></Link>
          <Link href="/legal"><span className="hover:text-blue-400 cursor-pointer">Legal</span></Link>
          <Link href="/support"><span className="hover:text-blue-400 cursor-pointer">Support</span></Link>
        </div>
      </div>
    </nav>
  );
}

// ✅ Logic for whether to show navbar
function ClientLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isLoggedIn = !!session;
  const shouldHideNav = pathname === "/" || pathname.startsWith("/auth");
  const shouldShowNav = isLoggedIn && !shouldHideNav;

  return (
    <>
      {shouldShowNav && <GlobalNav />}
      <main>{children}</main>
    </>
  );
}

// ✅ Main Layout Component
interface ClientLayoutProps {
  children: ReactNode;
  session?: Session; // You can use Session type from next-auth if needed
}

export default function ClientLayout({ children, session }: ClientLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <MyContextProvider>
          <NotificationProvider>
            <ClientLayoutInner>{children}</ClientLayoutInner>
          </NotificationProvider>
        </MyContextProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
