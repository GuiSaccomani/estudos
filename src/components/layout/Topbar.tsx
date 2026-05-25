"use client";

import { useMemo, useState } from "react";
import { Bell, Moon, Search, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const pathname = usePathname();

  const isDark = theme === "dark";
  const pageMeta = useMemo(() => {
    switch (pathname) {
      case "/estudos":
        return {
          title: "Materias em fluxo",
          subtitle: "Organize conteudos, topicos e anotacoes com clareza.",
        };
      case "/flashcards":
        return {
          title: "Revisao inteligente",
          subtitle: "Espacamento, dificuldade e modo quiz em um so painel.",
        };
      case "/pomodoro":
        return {
          title: "Pomodoro ativo",
          subtitle: "Ritmo, pausas e historico de foco continuo.",
        };
      case "/produtividade":
        return {
          title: "Evolucao semanal",
          subtitle: "Visualize consistencia e horarios de maior energia.",
        };
      case "/filosofia":
        return {
          title: "Filosofia viva",
          subtitle: "Conecte temas atuais, conceitos e filosofos em mapas visuais.",
        };
      case "/metas":
        return {
          title: "Metas inteligentes",
          subtitle: "Acompanhe progresso diario, semanal e mensal.",
        };
      case "/calendario":
        return {
          title: "Agenda de estudos",
          subtitle: "Planeje revisoes, provas e eventos com cores claras.",
        };
      default:
        return {
          title: "Bom dia, Isabel",
          subtitle: "Sua jornada de estudos esta focada em profundidade e clareza.",
        };
    }
  }, [pathname]);

  return (
    <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-glass px-6 py-5 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Dashboard pessoal
        </p>
        <h2 className="text-lg sm:text-2xl font-semibold">{pageMeta.title}</h2>
        <p className="text-sm text-muted-foreground">
          {pageMeta.subtitle}
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-10"
            placeholder="Buscar temas, filosofos, flashcards"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Alternar tema"
          >
            {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="soft" size="sm" aria-label="Notificacoes">
            <Bell className="h-4 w-4" />
            3
          </Button>
        </div>
      </div>
    </header>
  );
}
