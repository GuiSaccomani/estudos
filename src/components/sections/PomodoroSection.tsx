"use client";

import { useEffect, useMemo, useState } from "react";
import { Headphones, Pause, Play, RotateCcw, Timer, Maximize, Minimize } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { useStudyStore } from "@/store/useStudyStore";
import { useUIStore } from "@/store/useUIStore";
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
  const { focusMode, toggleFocusMode } = useUIStore();
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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <SectionHeader
          eyebrow="Pomodoro"
          title="Ritual de foco"
          description="Timer inteligente, sons leves e historico completo de sessoes."
        />
        <Button 
          variant={focusMode ? "default" : "soft"}
          onClick={toggleFocusMode}
          className="w-full sm:w-auto transition-all shadow-sm group"
        >
          {focusMode ? <Minimize className="h-4 w-4 mr-2 group-hover:scale-90 transition-transform" /> : <Maximize className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />}
          {focusMode ? "Sair do Modo Foco" : "Modo Foco Imersivo"}
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : null}
      <div className={focusMode ? "grid gap-6 lg:grid-cols-[1fr]" : "grid gap-4 lg:grid-cols-[2fr,1fr]"}>
        <Card className={`backdrop-blur-xl bg-card/40 border-border/40 shadow-sm transition-all duration-300 ${focusMode ? 'shadow-2xl shadow-accent/5 ring-1 ring-border/50' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={focusMode ? "text-2xl font-display" : ""}>Timer ativo</CardTitle>
              <Timer className={`h-5 w-5 ${focusMode ? "text-accent animate-pulse" : "text-muted-foreground"}`} />
            </div>
            <CardDescription>Personalize o ciclo de foco.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
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
                <Button onClick={() => setIsRunning((prev) => !prev)} className={`w-full sm:w-auto ${focusMode ? 'h-12 text-lg' : ''}`}>
                  {isRunning ? <Pause className="h-5 w-5 mr-1" /> : <Play className="h-5 w-5 mr-1" />}
                  {isRunning ? "Pausar" : "Iniciar"}
                </Button>
                <Button variant="ghost" onClick={handleReset} className={`w-full sm:w-auto ${focusMode ? 'h-12' : ''}`}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Resetar
                </Button>
              </div>
            </div>
            <div className="flex items-end justify-between mt-8">
              <div>
                <p className={`font-semibold tracking-tighter ${focusMode ? 'text-7xl md:text-9xl' : 'text-5xl md:text-6xl'}`}>
                  {String(minutesLeft).padStart(2, "0")}:
                  {String(secondsLeft).padStart(2, "0")}
                </p>
                <p className="text-sm text-muted-foreground mt-2 uppercase tracking-widest font-medium">tempo restante</p>
              </div>
              {!focusMode && (
                <div className="hidden md:block rounded-2xl border border-border/50 bg-card/50 px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm">
                  Meta diária: 3 sessões
                </div>
              )}
            </div>
            <Progress value={progress} className={`bg-muted/50 ${focusMode ? 'h-4' : 'h-2'}`} />
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/80 pt-2">
              <Headphones className="h-4 w-4" />
              Playlist Lo-fi ativada para máxima concentração
            </div>
          </CardContent>
        </Card>
        
        {!focusMode && (
          <Card className="backdrop-blur-xl bg-card/40 border-border/40 shadow-sm transition-all duration-300">
            <CardHeader>
              <CardTitle>Sessões recentes</CardTitle>
              <CardDescription>Últimas atividades de foco.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {sessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/50 bg-card/20 p-6 text-center text-sm text-muted-foreground">
                  Nenhuma sessão registrada ainda.
                </div>
              ) : null}
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between group hover:bg-muted/50 p-2 rounded-lg transition-colors -mx-2">
                  <div className="px-2">
                    <p className="font-medium">{session.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.minutes} min
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground/70 px-2">
                    {new Date(session.completedAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
