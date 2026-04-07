"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/60 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 text-white shadow-glow"
          >
            <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden="true" fill="none">
              <path
                d="M46.5 15.5H24c-7.2 0-13 5.8-13 13v0c0 7.2 5.8 13 13 13h16c4.4 0 8 3.6 8 8v0c0 4.4-3.6 8-8 8H17.5"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <circle cx="48" cy="16" r="4" fill="currentColor" />
            </svg>
          </motion.div>
          <div>
            <Link href="/" className="font-display text-lg font-semibold tracking-tight">
              SAurForm
            </Link>
            <p className="text-xs text-muted-foreground">AI-powered super forms for modern teams</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Badge variant="muted">Guest mode</Badge>
          <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            {[
              ["/", "Home"],
              ["/builder", "Builder"],
              ["/preview", "Preview"],
              ["/analytics", "Analytics"]
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground",
                  pathname === href && "bg-white/10 text-foreground"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild className="hidden md:inline-flex">
            <Link href="/builder">Open studio</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}