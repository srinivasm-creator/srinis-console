# Srini's Console

A lightweight task manager. Next.js (App Router, TypeScript) + Tailwind CSS on the frontend, Prisma + PostgreSQL for storage.

## Stack

- **Next.js 16** — server-rendered React, API routes under `src/app/api/`
- **Tailwind CSS 4** — styling
- **Prisma 5 + PostgreSQL** — data layer (`prisma/schema.prisma`)

## Local development

You need a `DATABASE_URL` pointing at a Postgres instance. Copy `.env.example` to `.env` and fill it in:

```bash
cp .env.example .env
```

Then:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Railway)

This repo is connected to a Railway project (`srinis-console`) with two services:

- **Postgres** — managed database
- **srinis-console** (web) — this app, auto-deploys on every push to `main`

The web service's `DATABASE_URL` variable references `${{Postgres.DATABASE_URL}}`, so it always points at the project's own database automatically. On every boot, `npm start` runs `prisma db push` to keep the database schema in sync with `prisma/schema.prisma`, then starts the server.

To change the schema: edit `prisma/schema.prisma`, commit, and push — Railway takes care of the rest.
