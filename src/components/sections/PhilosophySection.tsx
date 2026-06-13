"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Network, Quote, Sparkle, Trash2 } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/sections/SectionHeader";

type PhilosophyTheme = {
  id: string;
  theme: string;
  focus: string;
  philosophers: string[];
  insight: string;
};

type Reflection = {
  id: string;
  title: string;
  content: string;
  philosophers: string[];
};

export function PhilosophySection() {
  const [themes, setThemes] = useState<PhilosophyTheme[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [themeTitle, setThemeTitle] = useState("");
  const [focus, setFocus] = useState("");
  const [philosophers, setPhilosophers] = useState("");
  const [insight, setInsight] = useState("");
  const [reflectionTitle, setReflectionTitle] = useState("");
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionPhilosophers, setReflectionPhilosophers] = useState("");

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    Promise.all([
      apiFetch<PhilosophyTheme[]>("/api/philosophy"),
      apiFetch<Reflection[]>("/api/reflections"),
    ])
      .then(([themesData, reflectionsData]) => {
        if (!isMounted) return;
        setThemes(themesData);
        setReflections(reflectionsData);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message || "Erro ao carregar filosofia");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const graphData = useMemo(() => {
    if (!themes.length) {
      return { nodes: [], links: [] as Array<{ from: string; to: string }> };
    }
    const theme = themes[0];
    const focusWords = theme.focus.split(" ").slice(0, 3).filter(Boolean);
    const nodeLabels = [theme.theme, ...theme.philosophers, ...focusWords];
    const nodes = nodeLabels.map((label, index) => ({
      id: `${label}-${index}`,
      label,
    }));
    const links = nodes.slice(1).map((node) => ({
      from: nodes[0].id,
      to: node.id,
    }));
    return { nodes, links };
  }, [themes]);

  const initialPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const radius = 90;
    const centerX = 160;
    const centerY = 110;
    const count = graphData.nodes.length;
    graphData.nodes.forEach((node, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(1, count);
      positions[node.id] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    });
    return positions;
  }, [graphData.nodes]);

  const [nodePositions, setNodePositions] = useState(initialPositions);
    useEffect(() => {
      setNodePositions(initialPositions);
    }, [initialPositions]);

  const dragState = useRef<{ id: string; offsetX: number; offsetY: number } | null>(
    null
  );

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    nodeId: string
  ) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    dragState.current = {
      id: nodeId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    target.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const container = event.currentTarget;
    const bounds = container.getBoundingClientRect();
    const nextX = Math.min(
      bounds.width - 40,
      Math.max(0, event.clientX - bounds.left - dragState.current.offsetX)
    );
    const nextY = Math.min(
      bounds.height - 40,
      Math.max(0, event.clientY - bounds.top - dragState.current.offsetY)
    );
    setNodePositions((prev) => ({
      ...prev,
      [dragState.current?.id ?? ""]: { x: nextX, y: nextY },
    }));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragState.current = null;
  };

  const handleThemeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!themeTitle.trim()) return;
    const payload = {
      theme: themeTitle.trim(),
      focus: focus.trim() || "Reflexao principal",
      philosophers: philosophers
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean),
      insight: insight.trim() || "Insight principal ainda em construcao.",
    };
    try {
      const created = await apiFetch<PhilosophyTheme>("/api/philosophy", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setThemes([created, ...themes]);
      setThemeTitle("");
      setFocus("");
      setPhilosophers("");
      setInsight("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar tema");
    }
  };

  const handleReflectionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reflectionTitle.trim() || !reflectionText.trim()) return;
    const payload = {
      title: reflectionTitle.trim(),
      content: reflectionText.trim(),
      philosophers: reflectionPhilosophers
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean),
    };
    try {
      const created = await apiFetch<Reflection>("/api/reflections", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setReflections([created, ...reflections]);
      setReflectionTitle("");
      setReflectionText("");
      setReflectionPhilosophers("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar reflexao");
    }
  };

  const handleRemoveTheme = async (themeId: string) => {
    try {
      await apiFetch<void>(`/api/philosophy/${themeId}`, { method: "DELETE" });
      setThemes(themes.filter((item) => item.id !== themeId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover tema");
    }
  };

  const handleRemoveReflection = async (reflectionId: string) => {
    try {
      await apiFetch<void>(`/api/reflections/${reflectionId}`, { method: "DELETE" });
      setReflections(reflections.filter((item) => item.id !== reflectionId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover reflexao");
    }
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <SectionHeader
          eyebrow="Filosofia Viva"
          title="Conexoes filosoficas"
          description="Carregando suas conexoes..."
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Filosofia Viva"
        title="Conexoes filosoficas"
        description="Transforme temas atuais em mapas mentais e analises criticas visuais."
      />

      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mapa mental interativo</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Conexoes animadas entre temas, conceitos e filosofos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="relative h-64 w-full rounded-3xl border border-white/10 bg-white/5"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <svg className="absolute inset-0 h-full w-full">
                {graphData.links.map((connection) => {
                  const from = nodePositions[connection.from];
                  const to = nodePositions[connection.to];
                  return (
                    <line
                      key={`${connection.from}-${connection.to}`}
                      x1={from?.x ?? 0}
                      y1={from?.y ?? 0}
                      x2={to?.x ?? 0}
                      y2={to?.y ?? 0}
                      stroke="rgba(141,180,255,0.6)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
              {graphData.nodes.map((node, index) => {
                const position = nodePositions[node.id];
                return (
                  <motion.div
                    key={node.id}
                    className="absolute"
                    style={{ left: position?.x ?? 0, top: position?.y ?? 0 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div
                      onPointerDown={(event) => handlePointerDown(event, node.id)}
                      className="cursor-grab rounded-2xl border border-white/15 bg-glass px-4 py-2 text-xs font-medium active:cursor-grabbing"
                    >
                      {node.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-6 space-y-4">
              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-base">Novo tema atual</CardTitle>
                  <CardDescription>Relacione eventos atuais com filosofos.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="grid gap-3 md:grid-cols-2" onSubmit={handleThemeSubmit}>
                    <Input
                      value={themeTitle}
                      onChange={(event) => setThemeTitle(event.target.value)}
                      placeholder="Tema atual"
                    />
                    <Input
                      value={focus}
                      onChange={(event) => setFocus(event.target.value)}
                      placeholder="Foco ou interpretacao"
                    />
                    <Input
                      value={philosophers}
                      onChange={(event) => setPhilosophers(event.target.value)}
                      placeholder="Filosofos (separados por virgula)"
                    />
                    <Input
                      value={insight}
                      onChange={(event) => setInsight(event.target.value)}
                      placeholder="Insight principal"
                    />
                    <Button type="submit" className="md:col-span-2">
                      Salvar conexao
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {themes.map((theme) => (
                  <Card key={theme.id} className="border-white/10 bg-white/5">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{theme.theme}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveTheme(theme.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>{theme.focus}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {theme.philosophers.map((philosopher) => (
                          <Badge key={philosopher} variant="soft">
                            {philosopher}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{theme.insight}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dashboard filosofico</CardTitle>
                <BrainCircuit className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Indicadores do seu universo intelectual.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Filosofo mais estudado</span>
                <span className="font-semibold text-foreground">Bauman</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Temas atuais analisados</span>
                <span className="font-semibold text-foreground">14</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Conexoes criadas</span>
                <span className="font-semibold text-foreground">58</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tempo de estudo filosofico</span>
                <span className="font-semibold text-foreground">6h 20m</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Timeline filosofica</CardTitle>
                <Quote className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Linhas de tempo conectadas a eventos atuais.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reflections.slice(0, 3).map((item) => (
                <div key={item.id} className="space-y-1 border-l-2 border-accent/50 pl-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Reflexão
                  </p>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
                </div>
              ))}
              {reflections.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Crie reflexões para preencher sua linha do tempo filosófica.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Modo estudo profundo</CardTitle>
                <Sparkle className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Ambiente minimalista para reflexao guiada.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                &quot;A liberdade nao e um refugio, e uma exigencia.&quot; — Sartre
              </p>
              <p>
                Ative a leitura guiada, sons ambientes e transicoes suaves para
                uma imersao total.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Reflexoes pessoais</CardTitle>
              <CardDescription>Salve pensamentos e analises criticas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="space-y-3" onSubmit={handleReflectionSubmit}>
                <Input
                  value={reflectionTitle}
                  onChange={(event) => setReflectionTitle(event.target.value)}
                  placeholder="Titulo da reflexao"
                />
                <textarea
                  value={reflectionText}
                  onChange={(event) => setReflectionText(event.target.value)}
                  placeholder="Escreva sua reflexao"
                  className="min-h-[90px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                />
                <Input
                  value={reflectionPhilosophers}
                  onChange={(event) => setReflectionPhilosophers(event.target.value)}
                  placeholder="Filosofos relacionados"
                />
                <Button type="submit" className="w-full">
                  Salvar reflexao
                </Button>
              </form>
              <div className="space-y-3">
                {reflections.map((reflection) => (
                  <div key={reflection.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{reflection.title}</p>
                        <p className="text-xs text-muted-foreground">{reflection.content}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveReflection(reflection.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {reflection.philosophers.map((philosopher) => (
                        <Badge key={philosopher} variant="soft">
                          {philosopher}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
