# Architecture Decisions (DECISIONS.md)

This document tracks the core architectural decisions made during the Caseflow platform renovation.

## 1. Monorepo Structure & Package Manager
**Decision:** Migrated from npm to `pnpm` workspaces.
**Reason:** npm workspaces struggled with dependency hoisting across `apps/api` and `apps/web` leading to duplicated types. `pnpm` provides strict isolation via symlinks (`.npmrc` `strict-peer-dependencies=false`), faster installation, and excellent integration with Turborepo for parallel task execution.

## 2. Database & ORM
**Decision:** Rebuilt `schema.prisma` natively using Prisma 6 with soft-delete extensions.
**Reason:** The original schema was fragmented. A unified, canonical `schema.prisma` in `packages/db` enables strong cross-package typing. The soft-delete pattern via Prisma `$extends` ensures that queries automatically filter out deleted records without muddying application logic. Included `pgvector` for future RAG expansions.

## 3. Type Safety
**Decision:** Created `@caseflow/types` with a Zod-first approach.
**Reason:** By defining Zod schemas first and inferring TypeScript types from them, we guarantee that runtime validation exactly matches compile-time types. This is heavily utilized by `@hono/zod-validator` in the API and `react-hook-form` via `@hookform/resolvers/zod` in the frontend.

## 4. Authentication
**Decision:** Replaced custom JWT implementation with `better-auth`.
**Reason:** Custom auth is prone to security flaws (like token leakage in local storage). `better-auth` provides secure, HTTP-only, cross-origin cookies natively, integrating directly with our Prisma schema, removing the need for a separate JWT rotation system.

## 5. API Layer
**Decision:** Refactored Express to `Hono` (v4).
**Reason:** Hono offers a much smaller footprint, faster routing (RegExp router), built-in Zod validation middleware, and native WebSocket support (`@hono/node-ws`), which is essential for the AI simulation streaming.

## 6. Frontend Stack
**Decision:** Next.js 15 (App Router), Tailwind CSS v4, and TanStack Query v5.
**Reason:** 
- **Tailwind v4:** A massive upgrade in developer experience. By removing `tailwind.config.ts` and relying entirely on CSS-native `@theme` configurations, the design system is vastly simplified and faster to compile.
- **TanStack Query v5:** Bypasses Next.js App Router caching quirks for highly dynamic data (like progressing simulations and XP).
- **Framer Motion:** Adds necessary micro-animations and page transitions to hit the "WOW" premium aesthetic.

## 7. AI Simulation Architecture
**Decision:** Abstracted AI provider with a Factory Pattern (`@caseflow/ai`) and implemented a stateful WebSocket `SimulationManager`.
**Reason:** 
- **Provider Abstraction:** Allows switching between local `Ollama` (cost-free dev) and `OpenAI` (high-fidelity prod) effortlessly.
- **WebSocket Manager:** The simulation must handle conversational turns, clinical notes syncing, semantic evaluations (awarding/deducting hearts), and step progression all asynchronously. REST polling is too slow and resource-intensive for this. A stateful WS class per active attempt ensures smooth, real-time feedback.
