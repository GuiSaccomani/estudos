"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, FileText, FolderKanban, Pencil, Trash2 } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/sections/SectionHeader";

type StudySubject = {
  id: string;
  title: string;
  topics: number;
  updatedAt: string;
  tags: string[];
};

export function StudiesSection() {
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [topics, setTopics] = useState("1");
  const [tags, setTags] = useState("");

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setTopics("1");
    setTags("");
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    apiFetch<StudySubject[]>("/api/subjects")
      .then((data) => {
        if (isMounted) setSubjects(data);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message || "Erro ao carregar materias");
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
    const parsedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const payload = {
      title: title.trim(),
      topics: Number(topics) || 1,
      tags: parsedTags.length ? parsedTags : ["Revisao"],
    };

    if (!payload.title) return;

    try {
      if (editingId) {
        const updated = await apiFetch<StudySubject>(`/api/subjects/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSubjects(subjects.map((subject) => (subject.id === editingId ? updated : subject)));
      } else {
        const created = await apiFetch<StudySubject>("/api/subjects", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSubjects([created, ...subjects]);
      }
      resetForm();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar materia");
    }
  };

  const handleEdit = (subject: StudySubject) => {
    setEditingId(subject.id);
    setTitle(subject.title);
    setTopics(String(subject.topics));
    setTags(subject.tags.join(", "));
  };

  const handleDelete = async (subjectId: string) => {
    try {
      await apiFetch<void>(`/api/subjects/${subjectId}`, { method: "DELETE" });
      setSubjects(subjects.filter((subject) => subject.id !== subjectId));
      if (editingId === subjectId) {
        resetForm();
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover materia");
    }
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <SectionHeader
          eyebrow="Sistema de estudos"
          title="Materias organizadas"
          description="Carregando suas materias..."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`skel-${index}`}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-3 h-3 w-32" />
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
        eyebrow="Sistema de estudos"
        title="Materias organizadas"
        description="Crie conteudos, anote insights e conecte referencias em um fluxo unico."
      />

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar materia" : "Nova materia"}</CardTitle>
          <CardDescription>
            Adicione materias, topicos e tags para manter o estudo organizado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[2fr,1fr,2fr,auto]" onSubmit={handleSubmit}>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Filosofia Contemporanea"
            />
            <Input
              type="number"
              min={1}
              value={topics}
              onChange={(event) => setTopics(event.target.value)}
              placeholder="Topicos"
            />
            <Input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="Tags separadas por virgula"
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

      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {subjects.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nenhuma materia criada</CardTitle>
              <CardDescription>Adicione sua primeira materia para comecar.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}
        {subjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{subject.title}</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>
                {subject.topics} topicos ativos · Atualizado {new Date(subject.updatedAt).toLocaleDateString("pt-BR")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {subject.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  Revisao ativa
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  PDFs anexados
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(subject)}>
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(subject.id)}>
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
