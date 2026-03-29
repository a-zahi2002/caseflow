# Caseflow — Architecture Document

This document outlines the architecture, technology stack, and design principles of the Caseflow platform. Caseflow is an AI-powered simulation platform designed for medical education, specifically focused on Case-Based Learning (CBL) and Scenario-Based Learning (SBL).

## 1. Project Overview

Caseflow is a comprehensive platform that enables medical students to practice clinical decision-making through dynamic, AI-driven patient simulations. It solves the problem of limited access to diverse clinical cases and the need for immediate, personalized feedback in a safe, risk-free environment.

- **Target Users**: Students (medical, nursing, healthcare), Educators/Faculty, and System Administrators.
- **Core Value Proposition**: A free, open-source, AI-powered, and self-hostable solution that democratizes high-quality medical simulation training.

---

## 2. Tech Stack

| Component | Technology | Version / Details |
|-----------|------------|-------------------|
| **Monorepo** | Turborepo | 2.x with npm workspaces |
| **Frontend** | Next.js | 14 App Router (React, TypeScript) |
| **Backend** | Hono | Node.js with `@hono/node-server` |
| **Database** | PostgreSQL | 16 via Prisma ORM |
| **AI Runtime** | Ollama | Local inference, no cloud API dependency |
| **AI Models** | mistral:7b / llama3.2:3b | Simulation (mistral), Extraction (llama3.2) |
| **Auth** | JWT / bcryptjs | jsonwebtoken for tokens, bcryptjs for hashing |
| **UI** | Tailwind CSS / shadcn/ui | Modern, responsive component-based styling |
| **Language** | TypeScript | Strict mode enabled across all packages |
| **WebSocket** | @hono/node-ws | Real-time bi-directional patient simulation |

---

## 3. Monorepo Structure

The project is structured as a Turborepo monorepo to ensure clean separation of concerns and shared logic.

```
caseflow/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   └── api/                    # Hono backend
├── packages/
│   ├── ai/                     # Ollama client + prompt engineering
│   ├── db/                     # Prisma schema + singleton client
│   ├── types/                  # Shared TypeScript interfaces
│   └── ui/                     # Shared UI components (internal stub)
├── content/
│   └── cases/                  # Community case JSON files
├── docs/                       # Documentation
├── .env.example                # Template for environment variables
├── turbo.json                  # Turborepo configuration
├── tsconfig.base.json          # Shared TypeScript configuration
└── package.json                # Root dependencies and workspace config
```

### Internal App & Package Structure

#### `apps/api/src/`
- `index.ts`: Entry point for the Hono server. Configures CORS, logger, error handlers, and route mounting.
- `lib/config.ts`: Centralized configuration using Zod for validation; ensures the app fails fast if envs are missing.
- `lib/errors.ts`: Standardized error classes (AppError, UnauthorizedError, ForbiddenError, etc.).
- `lib/response.ts`: Utility functions `success()` and `error()` for consistent API response structures.
- `lib/ollama-client.ts`: Singleton instance of the Ollama client for backend-wide access.
- `middleware/auth.ts`: Middleware for JWT verification and population of `jwtPayload` in Hono context.
- `middleware/require-role.ts`: Factory function to create role-based access control guards.
- `routes/`: Modular route handlers for `auth`, `cases`, `simulation`, `uploads`, `progress`, and `discussions`.
- `types.ts`: TypeScript definitions for the Hono environment and context typing.

#### `apps/web/src/`
- `app/(auth)/`: Authentication pages (login/register) with a centered card layout.
- `app/(student)/`: Student interface with sidebar layout, case library, and active simulations.
- `app/(educator)/`: Educator interface for managing personal cases and viewing analytics.
- `app/(admin)/`: Administrative interface for user and platform-wide management.
- `lib/api-client.ts`: Typed fetch wrapper for API communication, handling baseURL and auth headers.
- `lib/auth.ts`: Helpers for managing JWTs in localStorage and role-based dashboard redirection.
- `lib/config.ts`: Client-side configuration (e.g., `NEXT_PUBLIC_API_URL`).
- `lib/simulation.ts`: WebSocket wrapper to manage streaming data during patient simulations.

#### `packages/ai/src/`
- `ollama.ts`: Core `OllamaClient` providing methods like `generate()`, `chat()`, and `chatStream()`.
- `patient.ts`: High-level functions for patient-specific interactions (`getPatientResponse`, `streamPatientResponse`).
- `prompts/patient.ts`: Prompt engineering logic for building dynamic system instructions based on persona and game state.
- `types.ts`: Typings for Ollama requests and responses.

#### `packages/db/src/`
- `client.ts`: Exported singleton `PrismaClient` with global caching to prevent connection leaks during development.
- `seed.ts`: Seed data script providing 5 initial clinical cases (Cardiology, Neurology, etc.).
- `index.ts`: Registry for exporting the Prisma client and all auto-generated Prisma types.

#### `packages/types/src/`
- `user.ts`: Definitions for `User`, `Role`, and `JwtPayload`.
- `case.ts`: Schemas for `Case`, `CaseStep`, `PatientPersona`, and medical-specific metadata.
- `attempt.ts`: Types for `Attempt` tracking, `SimMessage`, and evaluation results.
- `api.ts`: Standardized request/response interfaces for the API layer.

---

## 4. Database Schema

| Model | Description | Key Fields |
|-------|-------------|------------|
| **User** | System users | `id`, `name`, `email`, `role`, `totalXp`, `currentStreak`, `badges` (JSON) |
| **Case** | Clinical scenarios | `id`, `authorId`, `title`, `specialty`, `difficulty`, `patientPersona` (JSON) |
| **CaseStep**| Sequential steps | `id`, `caseId`, `order`, `type`, `content`, `expectedFindings` (JSON) |
| **Attempt** | User simulation | `id`, `userId`, `caseId`, `status`, `score`, `heartsRemaining`, `evalResult` (JSON) |
| **SimMessage**| Chat history | `id`, `attemptId`, `role` (student/patient), `content` |
| **Discussion**| Case comments | `id`, `caseId`, `userId`, `content`, `parentId` |

**Enums**: `Role` (student/educator/admin), `Difficulty`, `CaseStatus` (draft/published), `StepType`, `AttemptStatus`, `MessageRole`, `CaseOutcome`.

---

## 5. API Reference

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /health | No | Any | API health check |
| GET | /health/ai | No | Any | Ollama connectivity check |
| POST | /auth/register | No | Any | Register new user, returns JWT |
| POST | /auth/login | No | Any | Login, returns JWT |
| GET | /auth/me | Yes | Any | Get current user from JWT |
| GET | /cases | Yes | Any | List published cases with search/filter/pagination |
| GET | /cases/my | Yes | Educator/Admin | List educator's/admin's own cases |
| GET | /cases/:id | Yes | Any | Get single case details and steps |
| POST | /cases | Yes | Educator/Admin | Create new case as draft |
| PATCH | /cases/:id | Yes | Educator/Admin | Update case fields or status |
| DELETE | /cases/:id | Yes | Educator/Admin | Delete a case |
| POST | /cases/:id/steps | Yes | Educator/Admin | Add a step to a case |
| POST | /simulation/start | Yes | Any | Create attempt, returns attemptId |
| WS | /simulation/:id/ws | Yes | Any | WebSocket — real-time patient simulation |
| GET | /progress/me | Yes | Student | Get current user's performance metrics & XP |
| GET | /analytics/stats | Yes | Admin | Platform-wide usage analytics |
| GET | /discussions/:caseId | Yes | Any | Get comments for a clinical case |

---

## 6. Authentication Flow

Caseflow uses a stateless JWT-based authentication system.

1. **Registration/Login**: Input validation is followed by password hashing via `bcryptjs` (12 rounds). A JWT with a 7-day expiry is signed and returned along with user metadata.
2. **Persistence**: The JWT is stored in the browser's `localStorage` on the frontend.
3. **Protected Routes**: The `authMiddleware` in the Hono backend extracts the `Bearer` token from the `Authorization` header, verifies it, and attaches the payload to `c.get('jwtPayload')`.
4. **Role Defense**: Factory middleware `requireRole` checks the `jwtPayload.role` to ensure the user has sufficient permissions (e.g., student vs. educator).

---

## 7. AI Architecture

### Virtual Patient Flow
1. Student sends a message via the WebSocket connection.
2. `buildPatientSystemPrompt()` constructs a situational system prompt using the case's `patientPersona`, current `heartsRemaining`, and `timeElapsed`.
3. The conversation history is combined with this prompt and sent to `streamPatientResponse()`.
4. The backend interacts with the local Ollama instance's `/api/chat` endpoint with `stream: true`.
5. Tokens are transformed into `stream_chunk` WebSocket messages and sent to the frontend in real-time.
6. Upon completion, the full response is persisted to the `SimMessage` table, and a `stream_end` message is sent.

### Prompt Principles
- **Character Persistence**: The AI never breaks character or acknowledges it is an AI.
- **Natural Language**: It uses plain, non-medical language appropriate for a patient.
- **Information Control**: Information is revealed incrementally based on the student's prompts.
- **Emotional Adaptation**: The patient's tone shifts as "hearts" decrease or time runs out.
- **Conciseness**: Responses are capped at approximately 200 tokens.

---

## 8. Gamification & Progression

Caseflow incorporates a RPG-style progression system to increase student engagement and provide clear milestones for clinical proficiency.

### XP & Levels
Students earn Experience Points (XP) for completing cases and demonstrating accuracy.
- **Level Range**: 1 to 20.
- **Titles**: Ranges from "Medical Student I" (Lv.1) to "Chief of Medicine" (Lv.20).
- **Calculation**: XP required per level follows a progressive curve (500, 1000, 1800...).

### Award Logic
XP is awarded upon simulation completion based on:
- **Difficulty Multiplier**: Beginner (+180), Intermediate (+320), Advanced (+500).
- **Accuracy Bonus**: 90%+ score (+80), 80%+ score (+40).
- **Perfect Score**: Achieving 100% (+200).
- **Streaks**: Daily login and case completion bonuses.

### Badge System
The system includes 10 unique clinical badges (e.g., "Young Cardiologist", "Speed Demon", "The Diagnostician") that award significant XP and are displayed on the user's profile.

---

## 9. Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://cbl:cbl_dev_password@localhost:5433/caseflow_db` |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | Model for patient simulation | `mistral:7b` |
| `OLLAMA_GENERATOR_MODEL` | Model for document extraction | `llama3.2:3b` |
| `JWT_SECRET` | Secret for signing JWT tokens | (User Defined) |
| `NEXT_PUBLIC_API_URL` | API base URL for frontend | `http://localhost:4000` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

---

## 9. Dev Ports

| Service | Port |
|---------|------|
| Next.js Web | 3000 |
| Hono API | 4000 |
| Ollama | 11434 |
| PostgreSQL | 5433 |

---

## 10. Build Phases

### Complete
- **Phase 1 — Foundation**: Monorepo setup, auth modules, database schema, and Next.js layout.
- **Phase 2 — AI Core**: Ollama client integration, dynamic patient prompting, and WebSocket streaming.
- **Phase 3 — Case Library**: Case CRUD, pagination, search, and seed data.
- **Phase 4 — Educator Tools**: Case creation, AI-driven extraction (Partial), and "My Cases" management.
- **Phase 5 — Gamification**: XP systems, levels, badges, and student HUD integration.

### Planned
- **Phase 6 — Advanced Analytics**: AI Reasoning Evaluator deep-dives and longitudinal performance tracking.
- **Phase 7 — Admin & Polish**: User moderation, Docker Compose production layering, and CI/CD.

---

## 11. Key Design Decisions

- **Ollama for AI**: Chosen to ensure zero API costs and full data privacy (Sovereign AI). Matches institutional needs where clinical data should not leave the local network.
- **Hono over Express**: Selected for its edge-readiness, lightweight nature, and first-class TypeScript support, which aligns with modern monorepo development.
- **Turborepo**: Enables a unified development workflow where one command (`npm run dev`) launches the entire stack while sharing types and code across apps.
- **JWT in LocalStorage**: Simplifies deployment for self-hosted scenarios by removing the complexity of cross-domain cookie configurations.
- **Prisma Singleton**: Critical for Next.js development to prevent exhausting database connections during Fast Refresh cycles.
- **Zod Validation**: Used at the network boundary for both frontend and backend to ensure data integrity and provide developer-friendly error messages.
