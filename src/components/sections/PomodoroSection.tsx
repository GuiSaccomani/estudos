"use client";

import { useEffect, useMemo, useState } from "react";
import { Headphones, Pause, Play, RotateCcw, Timer } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { useStudyStore } from "@/store/useStudyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/sections/SectionHeader";

type PomodoroSession = {
  id: string;
  label: string;
  minutes: number;
  completedAt: string;
};

export function PomodoroSection() {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addSession } = useStudyStore();
  const [label, setLabel] = useState("Revisao ativa");
  const [duration, setDuration] = useState("50");
  const [remaining, setRemaining] = useState(50 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const durationSeconds = useMemo(() => {
    const minutes = Number(duration) || 25;
    return Math.max(1, minutes) * 60;
  }, [duration]);

  useEffect(() => {
    setRemaining(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    apiFetch<PomodoroSession[]>("/api/pomodoro")
      .then((data) => {
        if (isMounted) setSessions(data);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message || "Erro ao carregar sessoes");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setIsRunning(false);
          const minutes = Math.round(durationSeconds / 60);
          const completedAt = new Date().toISOString();
          const payload = {
            label,
            minutes,
            completedAt,
          };
          apiFetch<PomodoroSession>("/api/pomodoro", {
            method: "POST",
            body: JSON.stringify(payload),
          })
            .then((created) => {
              setSessions((prevSessions) => [created, ...prevSessions].slice(0, 20));
              addSession({
                id: created.id,
                label: created.label,
                minutes: created.minutes,
                completedAt: created.completedAt,
              });
              setError(null);
            })
            .catch((err: Error) => {
              setError(err.message || "Erro ao salvar sessao");
            });
          return durationSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [addSession, durationSeconds, isRunning, label]);

  const progress = useMemo(() => {
    return ((durationSeconds - remaining) / durationSeconds) * 100;
  }, [durationSeconds, remaining]);

  const minutesLeft = Math.floor(remaining / 60);
  const secondsLeft = remaining % 60;

  const handleReset = () => {
    setIsRunning(false);
    setRemaining(durationSeconds);
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <SectionHeader
          eyebrow="Pomodoro"
          title="Ritual de foco"
          description="Carregando historico..."
        />
        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-4 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-4 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Pomodoro"
        title="Ritual de foco"
        description="Timer inteligente, sons leves e historico completo de sessoes."
      />
      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Timer ativo</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Personalize o ciclo de foco.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 md:grid-cols-[2fr,1fr,auto]">
              <Input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Nome da sessao"
              />
              <Input
                type="number"
                min={5}
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                placeholder="Minutos"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={() => setIsRunning((prev) => !prev)} className="w-full sm:w-auto">
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isRunning ? "Pausar" : "Iniciar"}
                </Button>
                <Button variant="ghost" onClick={handleReset} className="w-full sm:w-auto">
                  <RotateCcw className="h-4 w-4" />
                  Resetar
                </Button>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-semibold">
                  {String(minutesLeft).padStart(2, "0")}:
                  {String(secondsLeft).padStart(2, "0")}
                </p>
                <p className="text-xs text-muted-foreground">restantes</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground">
                Meta diaria: 3 sessoes
              </div>
            </div>
            <Progress value={progress} />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Headphones className="h-4 w-4" />
              Playlist Lo-fi ativada
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sessoes recentes</CardTitle>
            <CardDescription>Ultimas atividades de foco.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {sessions.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                Nenhuma sessao registrada ainda.
              </div>
            ) : null}
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{session.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.minutes} min
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(session.completedAt).toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
