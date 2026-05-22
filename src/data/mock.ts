export const dashboardStats = [
  {
    label: "Tempo estudado hoje",
    value: "1h 36m",
    detail: "+18% vs ontem",
  },
  {
    label: "Sequencia atual",
    value: "12 dias",
    detail: "Recorde pessoal",
  },
  {
    label: "Metas do dia",
    value: "3/5",
    detail: "60% concluido",
  },
  {
    label: "Revisoes inteligentes",
    value: "7 pendentes",
    detail: "Prioridade alta",
  },
];

export const weeklyFocus = [42, 68, 55, 80, 96, 74, 88];

export const studySubjects = [
  {
    title: "Filosofia Contemporanea",
    topics: 8,
    updatedAt: "Hoje",
    tags: ["Bauman", "Han", "Foucault"],
  },
  {
    title: "Epistemologia",
    topics: 5,
    updatedAt: "Ontem",
    tags: ["Kant", "Popper"],
  },
  {
    title: "Sociologia Digital",
    topics: 6,
    updatedAt: "2 dias",
    tags: ["Cultura", "IA"],
  },
];

export const flashcardsPreview = [
  {
    front: "Sociedade liquida",
    back: "Bauman descreve a fragilidade dos vinculos modernos.",
    difficulty: "Media",
  },
  {
    front: "Vigilancia digital",
    back: "Foucault: poder disciplinar como tecnologia social.",
    difficulty: "Alta",
  },
  {
    front: "Ansiedade existencial",
    back: "Sartre: liberdade gera angustia e responsabilidade.",
    difficulty: "Media",
  },
];

export const pomodoroSessions = [
  {
    label: "Leitura guiada",
    minutes: 25,
    status: "Concluido",
  },
  {
    label: "Revisao ativa",
    minutes: 50,
    status: "Em foco",
  },
  {
    label: "Mapa mental",
    minutes: 30,
    status: "Agendado",
  },
];

export const productivityHighlights = [
  {
    label: "Horario mais produtivo",
    value: "08:30 - 10:30",
  },
  {
    label: "Materia lider",
    value: "Filosofia Contemporanea",
  },
  {
    label: "Media diaria",
    value: "2h 10m",
  },
];

export const philosophyThemes = [
  {
    theme: "Cultura do cancelamento",
    focus: "Julgamento publico e vigilancia social",
    philosophers: ["Foucault", "Nietzsche", "Hannah Arendt", "Han"],
    insight:
      "O tribunal digital reforca moral coletiva e exposicao permanente.",
  },
  {
    theme: "Ansiedade moderna",
    focus: "Instabilidade e desempenho continuo",
    philosophers: ["Bauman", "Sartre", "Camus", "Han"],
    insight:
      "A liberdade radical convive com a pressao por produtividade.",
  },
  {
    theme: "IA e etica",
    focus: "Automacao do julgamento moral",
    philosophers: ["Aristoteles", "Kant", "Arendt"],
    insight:
      "A responsabilidade humana precisa guiar sistemas inteligentes.",
  },
];

export const philosophyGraphNodes = [
  { id: "tema", label: "Redes sociais", type: "theme" },
  { id: "dopamina", label: "Dopamina", type: "concept" },
  { id: "han", label: "Byung-Chul Han", type: "philosopher" },
  { id: "cansaco", label: "Sociedade do cansaco", type: "concept" },
  { id: "ansiedade", label: "Ansiedade", type: "concept" },
];

export const philosophyConnections = [
  { from: "tema", to: "dopamina" },
  { from: "dopamina", to: "han" },
  { from: "han", to: "cansaco" },
  { from: "cansaco", to: "ansiedade" },
];

export const goalsData = [
  {
    label: "Metas diarias",
    detail: "2h foco + 3 revisoes",
    progress: 65,
  },
  {
    label: "Metas semanais",
    detail: "6 mapas mentais + 12 flashcards",
    progress: 48,
  },
  {
    label: "Metas mensais",
    detail: "2 ensaios filosoficos",
    progress: 30,
  },
];

export const calendarEvents = [
  {
    day: "14 Mai",
    title: "Revisao inteligente - Etica",
    time: "09:30",
  },
  {
    day: "15 Mai",
    title: "Prova de Filosofia Politica",
    time: "08:00",
  },
  {
    day: "16 Mai",
    title: "Sessao IA e etica",
    time: "18:30",
  },
];

export const assistantSuggestions = [
  "Gere 5 flashcards sobre Bauman",
  "Crie perguntas criticas sobre burnout",
  "Explique a etica de Kant em 3 linhas",
  "Conecte IA com Aristoteles",
];

export const philosophicalTimeline = [
  {
    era: "Classica",
    philosopher: "Platao",
    impact: "Modelos de democracia e midia",
  },
  {
    era: "Moderna",
    philosopher: "Kant",
    impact: "Autonomia moral na tecnologia",
  },
  {
    era: "Contemporanea",
    philosopher: "Bauman",
    impact: "Vinculos liquidos e redes sociais",
  },
];
