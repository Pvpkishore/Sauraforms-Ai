"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, FileChartColumnIncreasing, LayoutDashboard, Layers3, Send } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentFormId } from "@/lib/storage";
import { getForms } from "@/lib/storageAdapter";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [responsesHref, setResponsesHref] = useState("/builder");

  useEffect(() => {
    const load = async () => {
      const currentFormId = getCurrentFormId();
      if (currentFormId) {
        setResponsesHref(`/responses/${currentFormId}`);
        return;
      }
      const forms = await getForms();
      if (forms.length) {
        setResponsesHref(`/responses/${forms[0].id}`);
      }
    };
    void load();
  }, []);

  const items = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/builder", label: "Builder", icon: Layers3 },
    { href: "/preview", label: "Live preview", icon: Send },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: responsesHref, label: "Responses", icon: FileChartColumnIncreasing }
  ];

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-4">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Control tower</CardTitle>
            <CardDescription>Jump across the builder, preview, analytics, and response views.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.label === "Responses" && pathname.startsWith("/responses/"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-muted-foreground transition hover:border-white/10 hover:bg-white/5 hover:text-foreground",
                    active && "border-white/10 bg-white/10 text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="animated-border bg-gradient-to-br from-primary/10 via-transparent to-cyan-400/10">
          <CardHeader>
            <CardTitle>Zero-backend sharing</CardTitle>
            <CardDescription>
              Forms persist in local storage and can also be copied with a portable snapshot link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </aside>
  );
}