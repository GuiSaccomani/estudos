"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/sections/SectionHeader";

const container = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

type PomodoroSession = { completedAt: string; minutes: number };
type Goal = { progress: number };

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function DashboardSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState(
    [] as Array<{ label: string; value: string; detail: string }>
  );
  const [weekly, setWeekly] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    Promise.all([
      apiFetch<{ id: string }[]>("/api/flashcards"),
      apiFetch<Goal[]>("/api/goals"),
      apiFetch<PomodoroSession[]>("/api/pomodoro"),
    ])
      .then(([flashcards, goals, sessions]) => {
        if (!isMounted) return;

        const today = new Date();
        const todayKey = dateKey(today);
        const sessionByDay = new Map<string, number>();
        sessions.forEach((session) => {
          const key = dateKey(new Date(session.completedAt));
          sessionByDay.set(key, (sessionByDay.get(key) ?? 0) + session.minutes);
        });

        const totalMinutesToday = sessionByDay.get(todayKey) ?? 0;
        const completedGoals = goals.filter((goal) => goal.progress >= 100).length;
        const goalLabel = `${completedGoals}/${goals.length}`;

        let streak = 0;
        const streakCursor = new Date(today);
        while (true) {
          const key = dateKey(streakCursor);
          if ((sessionByDay.get(key) ?? 0) > 0) {
            streak += 1;
            streakCursor.setDate(streakCursor.getDate() - 1);
          } else {
            break;
          }
        }

        const weeklyMinutes: number[] = [];
        for (let i = 6; i >= 0; i -= 1) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          weeklyMinutes.push(sessionByDay.get(dateKey(date)) ?? 0);
        }

        setWeekly(weeklyMinutes.map((value) => Math.min(100, value)));
        setStats([
          {
            label: "Tempo estudado hoje",
            value: `${Math.floor(totalMinutesToday / 60)}h ${totalMinutesToday % 60}m`,
            detail: totalMinutesToday ? "Atualizado agora" : "Sem sessoes hoje",
          },
          {
            label: "Sequencia atual",
            value: `${streak} dias`,
            detail: streak ? "Consistencia ativa" : "Inicie uma sessao hoje",
          },
          {
            label: "Metas do dia",
            value: goalLabel,
            detail: goals.length ? "Progresso em andamento" : "Crie sua primeira meta",
          },
          {
            label: "Revisoes inteligentes",
            value: `${flashcards.length} cards`,
            detail: flashcards.length ? "Pronto para revisar" : "Crie flashcards",
          },
        ]);
        setError(null);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message || "Erro ao carregar dashboard");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const hasWeekly = useMemo(() => weekly.some((value) => value > 0), [weekly]);
  const displayStats: ({ label: string; value: string; detail: string } | undefined)[] =
    isLoading
      ? Array.from({ length: 4 }).map(() => undefined)
      : stats;

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Painel geral"
        title="Clareza do dia"
        description="Tudo o que voce precisa para decidir o proximo passo com foco total."
      />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {displayStats.map((stat, index) => (
          <motion.div key={stat?.label ?? `stat-${index}`} variants={item}>
            <Card className="group relative overflow-hidden backdrop-blur-xl bg-card/40 border-border/40 hover:border-border/80 transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2">
                {isLoading ? (
                  <Skeleton className="h-3 w-24 bg-muted" />
                ) : (
                  <CardDescription className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{stat!.label}</CardDescription>
                )}
                {isLoading ? (
                  <Skeleton className="mt-3 h-8 w-20 bg-muted" />
                ) : (
                  <CardTitle className="text-3xl font-display font-medium tracking-tight mt-1">{stat!.value}</CardTitle>
                )}
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground pt-0">
                {isLoading ? <Skeleton className="h-3 w-32 bg-muted" /> : stat!.detail}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Gráfico de Consistência (Heatmap Style) */}
        <Card className="md:col-span-2 overflow-hidden backdrop-blur-xl bg-card/40 border-border/40 shadow-sm transition-all duration-300 hover:border-border/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-display tracking-tight flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              Ritmo Semanal
            </CardTitle>
            <CardDescription>Horas de estudo nos últimos 7 dias.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-end justify-between h-32 gap-2">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={`day-skel-${index}`} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full rounded-md bg-muted animate-pulse" style={{ height: `${Math.random() * 80 + 20}%` }} />
                    <Skeleton className="h-3 w-6" />
                  </div>
                ))}
              </div>
            ) : hasWeekly ? (
              <div className="flex items-end justify-between h-32 gap-2">
                {weekly.map((value, index) => (
                  <div key={`day-${index}`} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full relative flex-1 flex items-end justify-center bg-card border border-border/30 rounded-lg overflow-hidden group-hover:border-border/60 transition-colors">
                      <div
                        className="w-full bg-accent/80 hover:bg-accent transition-colors duration-500 rounded-b-md"
                        style={{ height: `${Math.min(100, Math.max(5, value))}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">
                      {["D", "S", "T", "Q", "Q", "S", "S"][index]}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-border/50 rounded-xl bg-card/20">
                <p className="text-sm text-muted-foreground">Sem sessões recentes.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Inicie um pomodoro para gerar dados.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Widget de Sabedoria do Dia */}
        <Card className="relative overflow-hidden backdrop-blur-xl bg-card/40 border-border/40 shadow-sm transition-all duration-300 hover:border-border/80 group">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[40px] pointer-events-none group-hover:bg-accent/10 transition-colors duration-700" />
          <CardHeader className="pb-2 relative z-10">
            <CardDescription className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Sabedoria Diária
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 flex flex-col justify-center h-[calc(100%-3rem)]">
            <blockquote className="text-lg font-display leading-tight text-foreground/90 italic">
              &quot;A educação não é o aprendizado de fatos, mas o treinamento da mente para pensar.&quot;
            </blockquote>
            <p className="text-xs text-muted-foreground font-medium mt-4 text-right">
              — Albert Einstein
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
