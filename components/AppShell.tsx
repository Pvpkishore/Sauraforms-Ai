"use client";

import { usePathname } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicFormRoute = pathname.startsWith("/form/");

  if (isPublicFormRoute) {
    return (
      <div className="page-shell">
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="page-shell grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Sidebar />
        <main>{children}</main>
      </div>
    </div>
  );
}