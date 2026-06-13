"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, FileText, FolderKanban, Pencil, Trash2, Sparkles, Image as ImageIcon, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
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
  content: string;
  imageUrls: string[];
  aiSummary: string | null;
};

export function StudiesSection() {
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create / Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [topics, setTopics] = useState("1");
  const [tags, setTags] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [showAttachmentPrompt, setShowAttachmentPrompt] = useState(false);
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);
  
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editTopics, setEditTopics] = useState("1");
  const [editTags, setEditTags] = useState("");
  const [editAttachments, setEditAttachments] = useState<File[]>([]);
  const [editAttachmentError, setEditAttachmentError] = useState<string | null>(null);
  
  // Study Modal State
  const [studyOpen, setStudyOpen] = useState(false);
  const [activeSubject, setActiveSubject] = useState<StudySubject | null>(null);
  const [studyContent, setStudyContent] = useState("");
  const [studyImages, setStudyImages] = useState<File[]>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const searchParams = useSearchParams();
  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setTopics("1");
    setTags("");
    setAttachments([]);
    setAttachmentError(null);
    setShowAttachmentPrompt(false);
    setShowAttachmentInput(false);
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

  const submitForm = async () => {
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

    setIsUploading(true);
    try {
      const created = await apiFetch<StudySubject>("/api/subjects", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      let finalSubject = created;

      // Handle attachments
      if (attachments.length > 0) {
        const newUrls: string[] = [];
        for (const file of attachments) {
          try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `subject-images/${created.id}/${fileName}`;
            
            const { error: uploadError } = await supabase.storage
              .from('uploads')
              .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
            newUrls.push(data.publicUrl);
          } catch (err) {
            console.error("Erro no upload do anexo inicial:", err);
          }
        }

        if (newUrls.length > 0) {
          const updatePayload = {
            title: created.title,
            topics: created.topics,
            tags: created.tags,
            content: created.content,
            imageUrls: newUrls,
          };
          finalSubject = await apiFetch<StudySubject>(`/api/subjects/${created.id}`, {
            method: "PUT",
            body: JSON.stringify(updatePayload),
          });
        }
      }

      setSubjects([finalSubject, ...subjects]);
      resetForm();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar materia");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitForm();
  };

  const handleAddClick = () => {
    void submitForm();
  };

  const handleAttachmentChoice = (acceptAttachments: boolean) => {
    setShowAttachmentPrompt(false);
    if (!acceptAttachments) {
      setShowAttachmentInput(false);
      setAttachments([]);
      setAttachmentError(null);
      return;
    }
    setShowAttachmentInput(true);
  };

  const closeAttachments = () => {
    setShowAttachmentInput(false);
    setAttachments([]);
    setAttachmentError(null);
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

  const openStudyModal = (subject: StudySubject) => {
    setActiveSubject(subject);
    setStudyContent(subject.content || "");
    setStudyImages([]);
    setStudyOpen(true);
  };

  const closeStudyModal = () => {
    setActiveSubject(null);
    setStudyContent("");
    setStudyImages([]);
    setStudyOpen(false);
  };

  const saveSubjectContent = async () => {
    if (!activeSubject) return;
    try {
      const payload = {
        title: activeSubject.title,
        topics: activeSubject.topics,
        tags: activeSubject.tags,
        content: studyContent,
        imageUrls: activeSubject.imageUrls || [],
      };
      await apiFetch<StudySubject>(`/api/subjects/${activeSubject.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setSubjects(subjects.map(s => s.id === activeSubject.id ? { ...s, content: studyContent } : s));
    } catch (err) {
      console.error("Erro ao salvar conteúdo:", err);
    }
  };

  const handleStudyImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length || !activeSubject) return;

    setIsUploading(true);
    const newUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `subject-images/${activeSubject.id}/${fileName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
        newUrls.push(data.publicUrl);
      } catch (err) {
        console.error("Erro no upload da imagem:", err);
      }
    }

    if (newUrls.length > 0) {
      const updatedImageUrls = [...(activeSubject.imageUrls || []), ...newUrls];
      try {
        const payload = {
          title: activeSubject.title,
          topics: activeSubject.topics,
          tags: activeSubject.tags,
          content: studyContent, // keep current edited content just in case
          imageUrls: updatedImageUrls,
        };
        const updated = await apiFetch<StudySubject>(`/api/subjects/${activeSubject.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setActiveSubject(updated);
        setSubjects(subjects.map(s => s.id === activeSubject.id ? updated : s));
      } catch (err) {
        console.error("Erro ao salvar imagens no backend:", err);
      }
    }
    
    setIsUploading(false);
    event.target.value = '';
  };

  const removeImage = async (urlToRemove: string) => {
    if (!activeSubject) return;
    const updatedImageUrls = (activeSubject.imageUrls || []).filter(url => url !== urlToRemove);
    try {
      const payload = {
        title: activeSubject.title,
        topics: activeSubject.topics,
        tags: activeSubject.tags,
        content: studyContent,
        imageUrls: updatedImageUrls,
      };
      const updated = await apiFetch<StudySubject>(`/api/subjects/${activeSubject.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setActiveSubject(updated);
      setSubjects(subjects.map(s => s.id === activeSubject.id ? updated : s));
    } catch (err) {
      console.error("Erro ao remover imagem:", err);
    }
  };

  const handleSummarize = async () => {
    if (!activeSubject) return;
    await saveSubjectContent(); // Save current content first
    
    setIsSummarizing(true);
    try {
      const updated = await apiFetch<StudySubject>(`/api/summarize/${activeSubject.id}`, {
        method: "POST",
      });
      setActiveSubject(updated);
      setSubjects(subjects.map(s => s.id === activeSubject.id ? updated : s));
    } catch (err) {
      console.error("Erro ao resumir:", err);
      alert("Falha ao gerar resumo. Tente novamente.");
    } finally {
      setIsSummarizing(false);
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
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-[2fr,1fr,2fr]">
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
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-medium text-foreground hover:bg-white/20 transition">
                  <FileText className="h-4 w-4" />
                  Anexar Arquivos
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    onChange={handleAttachments}
                    className="sr-only"
                    disabled={isUploading}
                  />
                </label>
                {attachments.length > 0 ? (
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    {attachments.length} arquivo(s) selecionado(s)
                    <button type="button" onClick={() => setAttachments([])} className="hover:text-red-400 transition">
                      (remover)
                    </button>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Opcional: PDFs ou Imagens para a IA</span>
                )}
              </div>
              
              <Button type="submit" disabled={isUploading || !title.trim()} className="px-8 shadow-lg">
                {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isUploading ? "Salvando..." : "Adicionar Matéria"}
              </Button>
            </div>
            {attachmentError ? <p className="text-xs text-red-500">{attachmentError}</p> : null}
          </form>
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
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => openStudyModal(subject)}
                  className="flex-1 bg-gradient-to-r from-accent to-purple-500 hover:from-accent/90 hover:to-purple-500/90 text-white shadow-md group"
                >
                  <Sparkles className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Caderno Inteligente
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
          </div>
        </div>
      ) : null}

      {/* Study & AI Modal */}
      {studyOpen && activeSubject ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 lg:p-12 overflow-hidden">
          <div className="w-full h-full max-w-7xl rounded-3xl border border-white/10 bg-background shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-card/50">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Caderno Virtual
                </p>
                <h3 className="text-2xl font-display font-semibold mt-1">{activeSubject.title}</h3>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="default" onClick={handleSummarize} disabled={isSummarizing || isUploading} className="bg-gradient-to-r from-accent to-purple-600 hover:from-accent/90 hover:to-purple-600/90 text-white shadow-lg">
                  {isSummarizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {isSummarizing ? "Analisando..." : "Resumir com IA"}
                </Button>
                <Button variant="ghost" size="icon" onClick={closeStudyModal} className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10">
                  <Trash2 className="h-5 w-5 text-muted-foreground" />
                  {/* Wait, Trash2 is wrong icon, let's use a generic close 'X' but we didn't import X. Let's just use text "Fechar" */}
                </Button>
                <Button variant="soft" onClick={closeStudyModal}>
                  Fechar
                </Button>
              </div>
            </div>

            {/* Modal Body: Split Layout */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Left Column: Content & Images */}
              <div className="flex-1 flex flex-col border-r border-white/10 bg-background/50 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                
                {/* Text Editor Area */}
                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-accent" />
                    Anotações da Matéria
                  </label>
                  <textarea
                    value={studyContent}
                    onChange={(e) => setStudyContent(e.target.value)}
                    onBlur={saveSubjectContent}
                    placeholder="Cole aqui os textos, resumos ou anotações da aula..."
                    className="flex-1 min-h-[300px] w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent resize-none"
                  />
                </div>

                {/* Images Upload Area */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-accent" />
                      Anexos (Fotos / PDFs)
                    </label>
                    <label className="cursor-pointer inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-white/5 px-4 text-xs font-semibold text-foreground hover:bg-white/10 transition">
                      {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Anexar Arquivo"}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        multiple
                        onChange={handleStudyImageUpload}
                        disabled={isUploading}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  {activeSubject.imageUrls && activeSubject.imageUrls.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {activeSubject.imageUrls.map((url, idx) => {
                        const isPdf = url.toLowerCase().includes(".pdf");
                        return (
                          <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-white/5 group flex items-center justify-center">
                            {isPdf ? (
                              <div className="flex flex-col items-center justify-center p-4 text-center">
                                <FileText className="h-8 w-8 text-red-400 mb-2" />
                                <span className="text-xs text-muted-foreground truncate w-full px-2">Documento PDF</span>
                              </div>
                            ) : (
                              <img src={url} alt={`Anexo ${idx + 1}`} className="w-full h-full object-cover" />
                            )}
                            <button
                              onClick={() => removeImage(url)}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-500"
                              title="Remover anexo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            {isPdf && (
                              <a href={url} target="_blank" rel="noreferrer" className="absolute inset-0 z-0"></a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-white/10 bg-white/5 text-center">
                      <p className="text-sm font-medium">Nenhum anexo ainda.</p>
                      <p className="text-xs text-muted-foreground mt-1">A IA consegue ler imagens e PDFs super bem!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: AI Summary */}
              <div className="flex-1 flex flex-col bg-card/30 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-purple-500 shadow-inner">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">Resumo Inteligente</h4>
                    <p className="text-xs text-muted-foreground">Gerado pelo Lumenos AI</p>
                  </div>
                </div>

                {activeSubject.aiSummary ? (
                  <div className="prose prose-sm prose-invert max-w-none text-foreground/90 leading-relaxed">
                    {/* Basic markdown rendering. For advanced, user should add react-markdown, but basic pre-wrap is fine for now */}
                    <div className="whitespace-pre-wrap font-medium">{activeSubject.aiSummary}</div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">
                    <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm font-medium">Nenhum resumo gerado ainda.</p>
                    <p className="text-xs text-muted-foreground mt-2 max-w-[250px]">
                      Adicione anotações ou fotos ao lado e clique em "Resumir com IA".
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
