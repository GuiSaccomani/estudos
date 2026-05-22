"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, LineChart, TrendingUp } from "lucide-react";

import { productivityHighlights } from "@/data/mock";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/sections/SectionHeader";

type PomodoroSession = {
  completedAt: string;
  minutes: number;
};

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function ProductivitySection() {
  const [heatmap, setHeatmap] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    apiFetch<PomodoroSession[]>("/api/pomodoro")
      .then((data) => {
        if (!isMounted) return;
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

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Produtividade"
        title="Evolucao constante"
        description="Acompanhe horarios, materias lideres e consistencia semanal."
      />
      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Heatmap de estudo</CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Consistencia ao longo do mes.</CardDescription>
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
                Sem dados suficientes. Inicie uma sessao de pomodoro para alimentar o heatmap.
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {heatmap.map((value, index) => (
                  <div
                    key={`heat-${index}`}
                    className="h-6 rounded-lg bg-accent/30"
                    style={{ opacity: 0.2 + (value / maxMinutes) * 0.8 }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <div className="space-y-4">
          {productivityHighlights.map((item) => (
            <Card key={item.label}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{item.value}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>{item.label}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Alta energia detectada
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
