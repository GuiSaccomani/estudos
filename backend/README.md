# Backend Estudos

API Express + Prisma (PostgreSQL) para persistir os dados da plataforma.

## Requisitos

- Node.js 18+
- PostgreSQL

## Configuracao

1) Copie o arquivo de ambiente:

```bash
copy .env.example .env
```

2) Preencha o DATABASE_URL com o banco no Render.

3) Instale dependencias:

```bash
npm install
```

4) Gere o client e rode migracoes:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5) Inicie em modo dev:

```bash
npm run dev
```

A API sobe em http://localhost:4000
