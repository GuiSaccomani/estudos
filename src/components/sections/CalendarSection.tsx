"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Trash2 } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/sections/SectionHeader";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
};

export function CalendarSection() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const hasEvents = useMemo(() => events.length > 0, [events.length]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    apiFetch<CalendarEvent[]>("/api/calendar")
      .then((data) => {
        if (isMounted) setEvents(data);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message || "Erro ao carregar eventos");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      date: date || "Sem data",
      time: time || "Sem horario",
    };
    try {
      const created = await apiFetch<CalendarEvent>("/api/calendar", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setEvents([created, ...events]);
      setTitle("");
      setDate("");
      setTime("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar evento");
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      await apiFetch<void>(`/api/calendar/${eventId}`, { method: "DELETE" });
      setEvents(events.filter((event) => event.id !== eventId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover evento");
    }
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <SectionHeader
          eyebrow="Calendario"
          title="Agenda de estudos"
          description="Carregando eventos..."
        />
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Calendario"
        title="Agenda de estudos"
        description="Planeje revisoes, provas e eventos com organizacao por cores."
      />

      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Novo evento</CardTitle>
          <CardDescription>Agende suas revisoes e provas.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[2fr,1fr,1fr,auto]" onSubmit={handleSubmit}>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Titulo do evento"
            />
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
            <Input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
            <Button type="submit">Adicionar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Proximos eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>
            {hasEvents ? "Semana organizada para alto desempenho." : "Sem eventos ainda."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasEvents ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
              Nenhum evento cadastrado. Adicione o primeiro acima.
            </div>
          ) : null}
          {events.map((eventItem) => (
            <div
              key={eventItem.id}
              className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-semibold">{eventItem.title}</p>
                <p className="text-xs text-muted-foreground">{eventItem.date}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-4 w-4" />
                {eventItem.time}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(eventItem.id)}
              >
                <Trash2 className="h-4 w-4" />
                Remover
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
