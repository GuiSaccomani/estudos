"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Layers, Pencil, Play, Trash2 } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/sections/SectionHeader";

type Flashcard = {
  id: string;
  front: string;
  back: string;
  difficulty: "Baixa" | "Media" | "Alta" | string;
};

export function FlashcardsSection() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [difficulty, setDifficulty] =
    useState<Flashcard["difficulty"]>("Media");
  const [flipped, setFlipped] = useState<string[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);

  const isEditing = useMemo(() => editingId !== null, [editingId]);
  const quizCard = cards[quizIndex];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    apiFetch<Flashcard[]>("/api/flashcards")
      .then((data) => {
        if (isMounted) setCards(data);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message || "Erro ao carregar flashcards");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!cards.length) {
      setQuizIndex(0);
    } else if (quizIndex >= cards.length) {
      setQuizIndex(0);
    }
  }, [cards.length, quizIndex]);

  useEffect(() => {
    if (!editingId) return;
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [editingId]);

  const resetForm = () => {
    setEditingId(null);
    setFront("");
    setBack("");
    setDifficulty("Media");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!front.trim() || !back.trim()) return;
    const payload = {
      front: front.trim(),
      back: back.trim(),
      difficulty,
    };

    try {
      if (editingId) {
        const updated = await apiFetch<Flashcard>(`/api/flashcards/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setCards(cards.map((card) => (card.id === editingId ? updated : card)));
      } else {
        const created = await apiFetch<Flashcard>("/api/flashcards", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setCards([created, ...cards]);
      }
      resetForm();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar flashcard");
    }
  };

  const handleEdit = (card: Flashcard) => {
    setEditingId(card.id);
    setFront(card.front);
    setBack(card.back);
    setDifficulty(card.difficulty);
  };

  const handleDelete = async (cardId: string) => {
    try {
      await apiFetch<void>(`/api/flashcards/${cardId}`, { method: "DELETE" });
      setCards(cards.filter((card) => card.id !== cardId));
      setFlipped((prev) => prev.filter((id) => id !== cardId));
      if (editingId === cardId) resetForm();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover flashcard");
    }
  };

  const toggleFlip = (cardId: string) => {
    setFlipped((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const nextQuiz = () => {
    setShowAnswer(false);
    setQuizIndex((prev) => (cards.length ? (prev + 1) % cards.length : 0));
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <SectionHeader
          eyebrow="Flashcards"
          title="Revisao inteligente"
          description="Carregando seus cards..."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`skel-${index}`}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
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
        eyebrow="Flashcards"
        title="Revisao inteligente"
        description="Espacamento ativo, dificuldade adaptativa e modo quiz com animacoes suaves."
      />

      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]" ref={formRef}>
        <Card className={editingId ? "ring-1 ring-accent/60" : undefined}>
          <CardHeader>
            <CardTitle>{isEditing ? "Editar flashcard" : "Novo flashcard"}</CardTitle>
            <CardDescription>
              Crie perguntas e respostas para revisao ativa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-[2fr,2fr,1fr,auto]" onSubmit={handleSubmit}>
              <Input
                value={front}
                onChange={(event) => setFront(event.target.value)}
                placeholder="Pergunta ou frente"
              />
              <Input
                value={back}
                onChange={(event) => setBack(event.target.value)}
                placeholder="Resposta"
              />
              <select
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(event.target.value as Flashcard["difficulty"])
                }
                className="h-11 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm"
              >
                <option value="Baixa">Baixa</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="w-full sm:w-auto">{isEditing ? "Salvar" : "Adicionar"}</Button>
                {isEditing ? (
                  <Button type="button" variant="ghost" onClick={resetForm} className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Modo quiz</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Revise um card por vez.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quizCard ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                  <p className="font-semibold">{quizCard.front}</p>
                  {showAnswer ? (
                    <p className="mt-2 text-muted-foreground">{quizCard.back}</p>
                  ) : null}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="soft" onClick={() => setShowAnswer((prev) => !prev)} className="w-full sm:w-auto">
                    {showAnswer ? "Ocultar resposta" : "Mostrar resposta"}
                  </Button>
                  <Button onClick={nextQuiz} className="w-full sm:w-auto">Proximo</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Adicione flashcards para iniciar o quiz.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nenhum flashcard ainda</CardTitle>
              <CardDescription>Crie um card para iniciar a revisao.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{card.front}</CardTitle>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>
                  {flipped.includes(card.id) ? "Verso" : "Frente"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative h-40 w-full [perspective:1000px]">
                  <motion.div
                    className="relative h-full w-full cursor-pointer [transform-style:preserve-3d]"
                    animate={{ rotateY: flipped.includes(card.id) ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    onClick={() => toggleFlip(card.id)}
                  >
                    <div className="absolute inset-0 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground [backface-visibility:hidden]">
                      {card.front}
                      <p className="mt-3 text-xs text-muted-foreground">
                        Clique para virar
                      </p>
                    </div>
                    <div className="absolute inset-0 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      {card.back}
                    </div>
                  </motion.div>
                </div>
                <Badge variant="soft" className="flex w-fit items-center gap-1">
                  <Flame className="h-3 w-3" />
                  {card.difficulty}
                </Badge>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(card)} className="w-full sm:w-auto">
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(card.id)} className="w-full sm:w-auto">
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
