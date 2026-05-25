"use client";

import Link from "next/link";
import { Brain, ChartLine, LayoutDashboard, Sparkles, Timer } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Estudos", icon: Brain, href: "/estudos" },
  { label: "Flashcards", icon: Sparkles, href: "/flashcards" },
  { label: "Pomodoro", icon: Timer, href: "/pomodoro" },
  { label: "Produtividade", icon: ChartLine, href: "/produtividade" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-4 z-50 mx-auto w-full max-w-3xl px-6 sm:hidden">
      <div className="backdrop-blur rounded-3xl border border-white/10 bg-glass p-2 flex items-center justify-between">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition ${
                isActive ? "bg-foreground text-background" : "text-sidebar-foreground hover:bg-white/5"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
