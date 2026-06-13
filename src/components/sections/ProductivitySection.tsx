"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, LineChart, TrendingUp } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/sections/SectionHeader";

type PomodoroSession = {
  completedAt: string;
  minutes: number;
  label: string;
};

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function ProductivitySection() {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [heatmap, setHeatmap] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    apiFetch<PomodoroSession[]>("/api/pomodoro")
      .then((data) => {
        if (!isMounted) return;
        setSessions(data);
        const today = new Date();
        const map = new Map<string, number>();
        data.forEach((session) => {
          const key = dateKey(new Date(session.completedAt));
          map.set(key, (map.get(key) ?? 0) + session.minutes);
        });
        const points: number[] = [];
        for (let i = 20; i >= 0; i -= 1) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          points.push(map.get(dateKey(date)) ?? 0);
        }
        setHeatmap(points);
        setError(null);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message || "Erro ao carregar produtividade");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const maxMinutes = useMemo(
    () => Math.max(1, ...heatmap, 1),
    [heatmap]
  );

  const highlights = useMemo(() => {
    if (sessions.length === 0) {
      return [
        { label: "Sessões", value: "0" },
        { label: "Tempo Total", value: "0h" },
        { label: "Foco Principal", value: "Nenhum" },
      ];
    }

    const totalMinutes = sessions.reduce((acc, s) => acc + s.minutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    const labels = sessions.reduce((acc, s) => {
      acc[s.label] = (acc[s.label] || 0) + s.minutes;
      return acc;
    }, {} as Record<string, number>);

    const topLabel = Object.keys(labels).reduce((a, b) => labels[a] > labels[b] ? a : b, "Estudos");

    return [
      { label: "Total de Sessões", value: sessions.length.toString() },
      { label: "Foco Principal", value: topLabel },
      { label: "Tempo Total", value: `${hours}h ${mins}m` },
    ];
  }, [sessions]);

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Produtividade"
        title="Evolução constante"
        description="Acompanhe sua dedicação real, tempo investido e consistência."
      />
      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card className="backdrop-blur-md bg-white/5 border-white/10 hover:border-white/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Heatmap de estudo</CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Consistência ao longo do mês.</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            {isLoading ? (
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 21 }).map((_, index) => (
                  <Skeleton key={`heat-skel-${index}`} className="h-6" />
                ))}
              </div>
            ) : heatmap.length === 0 || heatmap.every((value) => value === 0) ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                Sem dados suficientes. Inicie uma sessão de pomodoro para alimentar o heatmap.
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {heatmap.map((value, index) => (
                  <div
                    key={`heat-${index}`}
                    className="h-6 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                    style={{ opacity: 0.2 + (value / maxMinutes) * 0.8 }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <div className="space-y-4">
          {highlights.map((item) => (
            <Card key={item.label} className="backdrop-blur-md bg-white/5 border-white/10 hover:border-white/20 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.value}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>{item.label}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Estatística em tempo real
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
