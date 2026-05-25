import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-5xl sm:max-w-6xl flex-col gap-8">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
