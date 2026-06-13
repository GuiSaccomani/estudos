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
    <aside className="hidden h-screen w-64 flex-col gap-6 border-r border-border/40 bg-sidebar/50 px-5 py-8 text-sidebar-foreground backdrop-blur-xl lg:flex transition-all">
      <div className="space-y-1 px-2">
        <h1 className="text-xl font-display font-semibold tracking-tight text-foreground flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-foreground text-background flex items-center justify-center">
            <Sparkles className="w-3 h-3" />
          </div>
          Lumenos
        </h1>
        <p className="text-xs text-muted-foreground pt-1">
          O seu universo de estudos
        </p>
      </div>
      
      <nav className="flex flex-1 flex-col gap-1 mt-4">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Menu Principal
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-foreground text-background shadow-md shadow-black/10 dark:shadow-white/5"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 transition-transform duration-200",
                isActive ? "" : "group-hover:scale-110"
              )} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="rounded-2xl border border-border/50 bg-card/50 p-4 text-xs shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="font-semibold text-foreground">Sequência Ativa</p>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          12 dias mantendo o foco. Continue sua rotina inteligente hoje.
        </p>
      </div>

      <div className="mt-2">
        <button 
          onClick={() => alert("Menu de Ações Rápidas (Criar Flashcard, Meta, etc) será aberto aqui.")}
          className="w-full group relative flex items-center justify-center gap-2 rounded-xl bg-foreground text-background px-4 py-3 text-sm font-semibold shadow-lg shadow-black/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <Sparkles className="w-4 h-4 text-background group-hover:rotate-12 transition-transform" />
          Ação Rápida
        </button>
      </div>
    </aside>
  );
}
