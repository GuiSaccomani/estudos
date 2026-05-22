"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  CalendarDays,
  ChartLine,
  LayoutDashboard,
  Sparkles,
  Target,
  Timer,
  Wand2,
} from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Estudos", icon: Brain, href: "/estudos" },
  { label: "Flashcards", icon: Sparkles, href: "/flashcards" },
  { label: "Pomodoro", icon: Timer, href: "/pomodoro" },
  { label: "Produtividade", icon: ChartLine, href: "/produtividade" },
  { label: "Filosofia Viva", icon: Wand2, href: "/filosofia" },
  { label: "Metas", icon: Target, href: "/metas" },
  { label: "Calendario", icon: CalendarDays, href: "/calendario" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 flex-col gap-6 border-r border-white/10 bg-sidebar/90 px-6 py-8 text-sidebar-foreground backdrop-blur lg:flex">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Estudos pessoais
        </p>
        <h1 className="text-2xl font-semibold">Lumenos</h1>
        <p className="text-sm text-muted-foreground">
          Produtividade e filosofia em um so lugar.
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition",
                isActive
                  ? "bg-foreground text-background"
                  : "text-sidebar-foreground hover:bg-white/10"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-3xl border border-white/10 bg-glass p-4 text-xs text-muted-foreground">
        <p className="text-sm font-semibold text-foreground">
          Sequencia ativa: 12 dias
        </p>
        <p className="mt-2">Continue sua rotina inteligente hoje.</p>
      </div>
    </aside>
  );
}
