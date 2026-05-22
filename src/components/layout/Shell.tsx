"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <Topbar />
      {children}
    </AppShell>
  );
}
