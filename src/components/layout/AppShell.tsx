import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const focusMode = useUIStore((state) => state.focusMode);

  return (
    <div className="flex min-h-screen">
      {!focusMode && <Sidebar />}
      <main className={cn(
        "flex-1 transition-all duration-300",
        focusMode ? "px-4 py-6 sm:px-12 sm:py-12 lg:px-24 lg:py-16" : "px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10"
      )}>
        <div className={cn(
          "mx-auto flex w-full flex-col gap-10",
          focusMode ? "max-w-4xl" : "max-w-5xl xl:max-w-7xl"
        )}>
          {children}
        </div>
      </main>
      {!focusMode && <MobileNav />}
    </div>
  );
}
