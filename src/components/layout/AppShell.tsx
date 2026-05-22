import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-6 py-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
          {children}
        </div>
      </main>
    </div>
  );
}
