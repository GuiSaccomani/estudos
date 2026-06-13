"use client";

import { useMemo, useState, useEffect } from "react";
import { Bell, Moon, Search, SunMedium, User } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";

import { useAuth } from "@/components/auth-provider";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const { user, requireLogin } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    setQuery(current);
  }, [searchParams]);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getUserName = () => {
    if (!user) return "Visitante";
    // Tenta extrair o nome antes do @
    const email = user.email || "";
    const namePart = email.split("@")[0];
    if (!namePart) return "Estudante";
    
    // Capitaliza a primeira letra e troca pontos por espaço (ex: isabel.cuchiaro -> Isabel Cuchiaro)
    return namePart
      .split(".")
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const isDark = theme === "dark";
  const pageMeta = useMemo(() => {
    switch (pathname) {
      case "/estudos":
        return {
          title: "Matérias em fluxo",
          subtitle: "Organize conteúdos, tópicos e anotações com clareza.",
        };
      case "/flashcards":
        return {
          title: "Revisão inteligente",
          subtitle: "Espaçamento, dificuldade e modo quiz em um só painel.",
        };
      case "/pomodoro":
        return {
          title: "Pomodoro ativo",
          subtitle: "Ritmo, pausas e histórico de foco contínuo.",
        };
      case "/produtividade":
        return {
          title: "Evolução semanal",
          subtitle: "Visualize consistência e horários de maior energia.",
        };
      case "/filosofia":
        return {
          title: "Filosofia viva",
          subtitle: "Conecte temas atuais, conceitos e filósofos em mapas visuais.",
        };
      case "/metas":
        return {
          title: "Metas inteligentes",
          subtitle: "Acompanhe progresso diário, semanal e mensal.",
        };
      case "/calendario":
        return {
          title: "Agenda de estudos",
          subtitle: "Planeje revisões, provas e eventos com cores claras.",
        };
      default:
        return {
          title: `Bom dia, ${getUserName()}`,
          subtitle: "Sua jornada de estudos está focada em profundidade e clareza.",
        };
    }
  }, [pathname, user]);

  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/40 px-6 py-4 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between transition-all">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 mb-1">
          Lumenos
        </p>
        <h2 className="text-xl sm:text-2xl font-display font-semibold tracking-tight">{pageMeta.title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {pageMeta.subtitle}
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="relative w-full max-w-full sm:max-w-xs group">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          <Input
            value={query}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="pl-10 h-10 w-full bg-background/50 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-ring transition-all hover:bg-background/80"
            placeholder="Buscar temas, filósofos..."
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Alternar tema"
          >
            {mounted ? (
              isDark ? (
                <SunMedium className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <span className="inline-block h-4 w-4" aria-hidden />
            )}
          </Button>
          <Button 
            variant="soft" 
            size="sm" 
            aria-label="Notificações"
            onClick={() => alert("Você não possui novas notificações no momento.")}
          >
            <Bell className="h-4 w-4" />
            0
          </Button>
          {mounted ? (
            user ? (
              <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Sair">
                <LogOut className="h-4 w-4 text-red-400" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={requireLogin} aria-label="Entrar">
                <User className="h-4 w-4" />
              </Button>
            )
          ) : (
            <Button variant="ghost" size="sm" aria-hidden>
              <span className="inline-block h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
