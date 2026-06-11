# Caseflow: Open Source Medical SBL/CBL Platform

Caseflow is a modern, AI-powered Case-Based Learning (CBL) and Scenario-Based Learning (SBL) platform designed for medical education. It enables educators to create high-fidelity patient simulations and students to practice clinical reasoning in a safe, interactive environment.

![Project Preview Placeholder](https://via.placeholder.com/1200x600?text=Caseflow+Platform+Dashboard)

## 🚀 Quick Start

### Self-Hosted (Docker)
The easiest way to get started is using Docker Compose:
```bash
git clone https://github.com/azahi2002/caseflow.git
cd caseflow
docker compose -f infra/docker-compose.yml up -d
```
Visit `http://localhost:3000` to start.

### Local Development (Monorepo)
```bash
npm install
npx prisma migrate dev
npm run db:seed --workspace=@caseflow/db
ollama pull meditron
npm run dev
```

### 🔐 Test Credentials
After running the seed command, use these credentials to test:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Educator** | `educator@caseflow.dev` | `password123` |
| **Student** | `student@caseflow.dev` | `password123` |
| **Admin** | `admin@caseflow.dev` | `password123` |

## 📖 Documentation

-   [Project Overview](docs/PROJECT_OVERVIEW.md) — High-level overview of the platform architecture, tech stack, and roadmap.
-   [Contributing Guide](docs/CONTRIBUTING.md) — How to join the project.
-   [Case Format Specification](docs/CASE_FORMAT.md) — How to build patient simulations.
-   [Self-Hosting Guide](docs/SELF_HOSTING.md) — Advanced deployment options.

## 🛠️ Tech Stack

-   **Monorepo**: Turborepo
-   **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Recharts
-   **Backend**: Hono.js (Node server), Prisma ORM
-   **AI**: Ollama (meditron-7b, llama3)
-   **Auth**: Better Auth (JWT)
-   **Database**: PostgreSQL
-   **Infrastructure**: Docker, GitHub Actions

## 📜 License

This project is licensed under the MIT License.

## 🤝 Contributors

Special thanks to all medical professionals and developers contributing to this project.
