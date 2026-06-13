"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import { useUIStore } from "@/store/useUIStore";

export function Shell({ children }: { children: React.ReactNode }) {
  const focusMode = useUIStore((state) => state.focusMode);
  
  return (
    <AppShell>
      {!focusMode && <Topbar />}
      {children}
    </AppShell>
  );
}
