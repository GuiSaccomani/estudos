# Lumenos - Estudos Inteligentes

Plataforma pessoal de estudos com foco em produtividade, revisao ativa e filosofia viva. Todo o conteudo e salvo localmente no navegador via LocalStorage.

## Requisitos

- Node.js 18+

## Comandos

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Backend (Express + PostgreSQL)

O backend esta em [backend](backend). Ele expoe endpoints REST para materias, flashcards, metas, calendario, filosofia e pomodoro.

### Rodar localmente

```bash
cd backend
npm install
copy .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## Estrutura principal

- src/app: rotas e layout
- src/components: UI e secoes
- src/data: dados mockados
- src/hooks: hooks customizados
- src/store: estado global com persistencia

## Notas

- Nao existe login, backend ou API remota.
- Todos os dados persistem localmente no navegador.
