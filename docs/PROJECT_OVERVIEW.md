# Project Overview: Caseflow CBL/SBL Platform

Caseflow is an open-source medical education platform for Case-Based Learning (CBL) and Scenario-Based Learning (SBL). It enables students to practice clinical reasoning through interactive patient simulations while giving educators tools to author cases, monitor learner progress, and manage discussion-based case debriefs.

---

## 🚀 1. Technology Stack

Caseflow is built as a TypeScript monorepo with a focused frontend, backend, shared AI code, and a shared schema layer.

* **Monorepo Coordinator**: Turborepo 2.x with `npm workspaces` for workspace-aware builds, linting, and type-checking.
* **Frontend Application**: Next.js 14 (App Router) with Tailwind CSS, `react-hook-form`, `recharts`, and custom utility components for a responsive student/educator/admin experience.
* **Backend Application**: Hono.js with `@hono/node-server` for API routing and `@hono/node-ws` for WebSocket-based simulation streaming.
* **Database & ORM**: PostgreSQL with Prisma ORM for schema-driven models, type-safe queries, and migrations.
* **AI Engine**: Ollama local inference with configurable models:
  * `mistral:7b` for conversational patient simulation.
  * `llama3.2:3b` for document generation and structured extraction.
* **Authentication**: JWT-based stateless auth with `jsonwebtoken` and secure password hashing via `bcryptjs`.

---

## 📂 2. Directory Structure & Key Responsibilities

```text
caseflow/
├── apps/
│   ├── api/                   # Hono backend API
│   └── web/                   # Next.js frontend client
├── packages/
│   ├── ai/                    # Ollama client, prompt builders, and simulation helpers
│   ├── db/                    # Prisma schema, DB client, and seed scripts
│   ├── types/                 # Shared TypeScript interfaces and domain types
│   └── ui/                    # Shared UI component stubs
├── content/                  # Optional local clinical case JSON data
├── docs/                     # Project documentation and guides
├── infra/                    # Docker Compose and deployment helpers
├── package.json              # Root workspace and dev scripts
└── turbo.json                # Turborepo task graph
```

### apps/api

* `src/index.ts` — entrypoint, CORS/logger/global error handling, health checks, and WebSocket upgrade handling.
* `lib/` — configuration, standardized response helpers, error classes, and persistent Ollama client initialization.
* `middleware/` — JWT auth middleware and role-based access control.
* `routes/` — modular route groups for `auth`, `cases`, `simulation`, `uploads`, `progress`, `discussions`, `analytics`, and `admin`.

### apps/web

* `app/` — Next.js App Router layouts for auth, student, educator, and admin sections.
* `components/` — reusable UI elements including simulation chat, badges, leaderboard cards, and navigation.
* `lib/` — typed API client, auth helpers, simulation WebSocket manager, and utility functions.

### packages/ai

* `ollama.ts` — generalized Ollama client for `generate`, `chat`, `chatStream`, and health checking.
* `patient.ts` — patient-response streaming logic and high-level simulation helpers.
* `prompts/` — prompt engineering for patient personas, case context, and adaptive simulation behavior.
* `types.ts` — shared Ollama request/response typings.

### packages/db

* `prisma/` — database schema and generated client.
* `src/client.ts` — singleton `PrismaClient` export with development caching support.
* `src/seed.ts` — seed script that bootstraps sample users and clinical cases.

### packages/types

* Shared interfaces for `User`, `Role`, `JwtPayload`, `Case`, `Attempt`, `SimMessage`, and other domain models.

---

## 🧩 3. Core Functionality

### Student Experience
* Case browser with metadata and difficulty indicators.
* Real-time patient simulation powered by WebSockets.
* Chat-based clinical interaction with AI patient responses streamed back to the UI.
* Progress dashboard with XP, streaks, badges, and case completion stats.

### Educator Experience
* Case creation and editing workflows.
* Access to authored case lists and draft management.
* Visibility into student attempts and platform analytics.

### Admin Experience
* User management and role assignment.
* Platform-wide analytics and administrative controls.

---

## ⚙️ 4. Data Model & Runtime Architecture

### Core Database Models

* `User` — identity, role, and progression tracking.
* `Case` — clinical scenario definition, specialty, difficulty, and persona metadata.
* `CaseStep` — ordered simulation steps and expected findings.
* `Attempt` — active attempt state, hearts remaining, score, and outcome.
* `SimMessage` — complete chat history for student/patient dialogue.
* `Discussion` — case-based comments and threaded conversation.

### Runtime Behavior

* Frontend calls backend REST APIs for case discovery, attempt creation, progress, and admin operations.
* Simulation sessions begin with a new `Attempt` record and then open `/simulation/:attemptId/ws` for a live chat stream.
* Backend persists student messages and AI patient responses as `SimMessage` records during the session.
* Ollama model calls are streamed token-by-token through Hono WebSockets back to the client.

---

## 🔐 5. Security and Auth

* Passwords are hashed with `bcryptjs` before storage.
* JWTs are issued on login/registration and validated on every protected request.
* `authMiddleware` verifies the token and attaches the payload to the request context.
* `requireRole` middleware enforces access for `student`, `educator`, and `admin` endpoints.

---

## 📡 6. AI Integration

* `packages/ai` encapsulates Ollama connectivity and prompt logic.
* `apps/api` uses a singleton Ollama client with `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, and `OLLAMA_GENERATOR_MODEL` from env.
* `/health/ai` reports Ollama reachability and the configured model.
* The backend uses `chatStream` to deliver patient responses progressively in the simulation UI.

---

## 📌 7. Deployment and Local Development

### Root Scripts
* `npm run dev` — run Turborepo dev pipeline across workspaces.
* `npm run build` — build all packages and apps.
* `npm run lint` — lint across workspaces.
* `npm run type-check` — type-check all packages.
* `npm run format` — format `*.ts`, `*.tsx`, and `*.md`.

### Recommended Local Setup
* `npm install`
* `npx prisma migrate dev`
* `npm run db:seed --workspace=@caseflow/db`
* Ensure Ollama is running locally and required models are pulled.

---

## 🎯 8. Roadmap

1. **AI evaluation expansion** — add scoring logic in `packages/ai/src/evaluator.ts` to compare student responses against expected case findings.
2. **Longitudinal analytics** — expand progress reporting for student historical performance and educator dashboards.
3. **Production readiness** — complete `infra/docker-compose.yml`, automated migrations, and stable multi-service orchestration.
4. **Case authoring polish** — improve educator workflows for building, previewing, and publishing clinical cases.
