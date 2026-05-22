"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Target, Trash2 } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/sections/SectionHeader";

type Goal = {
  id: string;
  label: string;
  detail: string;
  progress: number;
};

export function GoalsSection() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [detail, setDetail] = useState("");
  const [progress, setProgress] = useState("0");

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const resetForm = () => {
    setEditingId(null);
    setLabel("");
    setDetail("");
    setProgress("0");
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    apiFetch<Goal[]>("/api/goals")
      .then((data) => {
        if (isMounted) setGoals(data);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message || "Erro ao carregar metas");
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
    if (!label.trim()) return;
    const payload = {
      label: label.trim(),
      detail: detail.trim(),
      progress: Math.min(100, Math.max(0, Number(progress) || 0)),
    };
    try {
      if (editingId) {
        const updated = await apiFetch<Goal>(`/api/goals/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setGoals(goals.map((goal) => (goal.id === editingId ? updated : goal)));
      } else {
        const created = await apiFetch<Goal>("/api/goals", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setGoals([created, ...goals]);
      }
      resetForm();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar meta");
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setLabel(goal.label);
    setDetail(goal.detail);
    setProgress(String(goal.progress));
  };

  const handleDelete = async (goalId: string) => {
    try {
      await apiFetch<void>(`/api/goals/${goalId}`, { method: "DELETE" });
      setGoals(goals.filter((goal) => goal.id !== goalId));
      if (editingId === goalId) resetForm();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover meta");
    }
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <SectionHeader
          eyebrow="Metas"
          title="Sistema motivacional"
          description="Carregando metas..."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`skel-${index}`}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Metas"
        title="Sistema motivacional"
        description="Metas diarias, semanais e mensais com progresso automatico."
      />

      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar meta" : "Nova meta"}</CardTitle>
          <CardDescription>Defina metas e acompanhe o progresso.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[2fr,2fr,1fr,auto]" onSubmit={handleSubmit}>
            <Input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Nome da meta"
            />
            <Input
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              placeholder="Detalhe da meta"
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={progress}
              onChange={(event) => setProgress(event.target.value)}
              placeholder="Progresso"
            />
            <div className="flex gap-2">
              <Button type="submit">{isEditing ? "Salvar" : "Adicionar"}</Button>
              {isEditing ? (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancelar
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {goals.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Sem metas cadastradas</CardTitle>
              <CardDescription>Crie sua primeira meta para acompanhar progresso.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{goal.label}</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>{goal.detail}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={goal.progress} />
              <p className="text-xs text-muted-foreground">
                {goal.progress}% concluido
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)}>
                  <Trash2 className="h-4 w-4" />
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
