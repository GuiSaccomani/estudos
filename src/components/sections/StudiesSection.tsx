"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, FileText, FolderKanban, Pencil, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

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
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editTopics, setEditTopics] = useState("1");
  const [editTags, setEditTags] = useState("");
  const [editAttachments, setEditAttachments] = useState<File[]>([]);
  const [editAttachmentError, setEditAttachmentError] = useState<string | null>(null);
  const searchParams = useSearchParams();


  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setTopics("1");
    setTags("");
    setAttachments([]);
    setAttachmentError(null);
  };

  const resetEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditTopics("1");
    setEditTags("");
    setEditAttachments([]);
    setEditAttachmentError(null);
    setEditOpen(false);
  };

  const handleAttachments = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const invalid = files.find(
      (file) => !(file.type.startsWith("image/") || file.type === "application/pdf")
    );
    if (invalid) {
      setAttachmentError("Somente imagens ou PDF sao aceitos.");
      setAttachments([]);
      return;
    }

    const tooLarge = files.find((file) => file.size > 10 * 1024 * 1024);
    if (tooLarge) {
      setAttachmentError("Cada arquivo deve ter ate 10MB.");
      setAttachments([]);
      return;
    }

    setAttachmentError(null);
    setAttachments(files);
  };

  const handleEditAttachments = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const invalid = files.find(
      (file) => !(file.type.startsWith("image/") || file.type === "application/pdf")
    );
    if (invalid) {
      setEditAttachmentError("Somente imagens ou PDF sao aceitos.");
      setEditAttachments([]);
      return;
    }

    const tooLarge = files.find((file) => file.size > 10 * 1024 * 1024);
    if (tooLarge) {
      setEditAttachmentError("Cada arquivo deve ter ate 10MB.");
      setEditAttachments([]);
      return;
    }

    setEditAttachmentError(null);
    setEditAttachments(files);
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
      const created = await apiFetch<StudySubject>("/api/subjects", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSubjects([created, ...subjects]);
      resetForm();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar materia");
    }
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;
    const parsedTags = editTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const payload = {
      title: editTitle.trim(),
      topics: Number(editTopics) || 1,
      tags: parsedTags.length ? parsedTags : ["Revisao"],
    };

    if (!payload.title) return;

    try {
      const updated = await apiFetch<StudySubject>(`/api/subjects/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setSubjects(subjects.map((subject) => (subject.id === editingId ? updated : subject)));
      resetEdit();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar materia");
    }
  };

  const handleEdit = (subject: StudySubject) => {
    setEditingId(subject.id);
    setEditTitle(subject.title);
    setEditTopics(String(subject.topics));
    setEditTags(subject.tags.join(", "));
    setEditAttachments([]);
    setEditAttachmentError(null);
    setEditOpen(true);
  };

  const handleDelete = async (subjectId: string) => {
    try {
      await apiFetch<void>(`/api/subjects/${subjectId}`, { method: "DELETE" });
      setSubjects(subjects.filter((subject) => subject.id !== subjectId));
      if (editingId === subjectId) {
        resetEdit();
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover materia");
    }
  };

  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const filteredSubjects = useMemo(() => {
    if (!query) return subjects;
    return subjects.filter((subject) => {
      const text = [subject.title, ...subject.tags].join(" ").toLowerCase();
      return text.includes(query);
    });
  }, [subjects, query]);

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
          <CardTitle>Nova materia</CardTitle>
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
              <Button type="submit">Adicionar</Button>
            </div>
          </form>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr,auto] sm:items-center">
            <input
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={handleAttachments}
              className="text-sm text-muted-foreground"
            />
            {attachments.length ? (
              <span className="text-xs text-muted-foreground">
                {attachments.length} arquivo(s) anexado(s)
              </span>
            ) : null}
          </div>
          {attachmentError ? (
            <p className="text-xs text-red-500">{attachmentError}</p>
          ) : null}
        </CardContent>
      </Card>

      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {filteredSubjects.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nenhuma materia criada</CardTitle>
              <CardDescription>
                {query
                  ? "Nenhuma materia encontrada para a busca."
                  : "Adicione sua primeira materia para comecar."}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}
        {filteredSubjects.map((subject) => (
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

      {editOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-background p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Editar materia
                </p>
                <h3 className="text-lg font-semibold">Atualizar conteudo</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={resetEdit}>
                Fechar
              </Button>
            </div>
            <form className="mt-4 grid gap-3 md:grid-cols-[2fr,1fr,2fr,auto]" onSubmit={handleEditSubmit}>
              <Input
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                placeholder="Ex: Filosofia Contemporanea"
              />
              <Input
                type="number"
                min={1}
                value={editTopics}
                onChange={(event) => setEditTopics(event.target.value)}
                placeholder="Topicos"
              />
              <Input
                value={editTags}
                onChange={(event) => setEditTags(event.target.value)}
                placeholder="Tags separadas por virgula"
              />
              <div className="flex gap-2">
                <Button type="submit">Salvar</Button>
                <Button type="button" variant="ghost" onClick={resetEdit}>
                  Cancelar
                </Button>
              </div>
            </form>
            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr,auto] sm:items-center">
              <input
                type="file"
                accept="image/*,application/pdf"
                multiple
                onChange={handleEditAttachments}
                className="text-sm text-muted-foreground"
              />
              {editAttachments.length ? (
                <span className="text-xs text-muted-foreground">
                  {editAttachments.length} arquivo(s) anexado(s)
                </span>
              ) : null}
            </div>
            {editAttachmentError ? (
              <p className="text-xs text-red-500">{editAttachmentError}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
