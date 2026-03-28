# Contributing to Caseflow

Welcome! We're excited to have you join our mission to build the future of medical education.

## Getting Started

1.  **Fork and Clone**:
    ```bash
    git clone https://github.com/your-username/caseflow.git
    cd caseflow
    ```

2.  **Environment Setup**:
    -   Copy `.env.example` to `.env` in the root and in `apps/api/`.
    -   Fill in the required variables (DATABASE_URL, JWT_SECRET, etc.).

3.  **Install Dependencies**:
    ```bash
    npm install
    ```

4.  **Database Initialisation**:
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Start Local AI**:
    Ensure [Ollama](https://ollama.ai/) is installed and running:
    ```bash
    ollama pull meditron
    ollama pull llama3
    ```

6.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Branching Strategy

-   `feature/*`: For new features or improvements.
-   `content/*`: For adding or updating medical cases.
-   `fix/*`: For bug fixes.

## Pull Request Process

1.  Describe your changes in detail in the PR description.
2.  Link any relevant issues.
3.  Ensure all CI checks pass (lint, build, typecheck).
4.  Request a review from at least one maintainer.

## Code Style Rules

-   **TypeScript**: Strict mode is enabled. Avoid `any` at all costs.
-   **Exports**: Use named exports only (except for Next.js pages).
-   **Validation**: All API inputs must be validated with Zod.
-   **UI**: Follow the design system in `apps/web/src/components/ui`.

## Testing and Linting

Before submitting a PR, run:
```bash
npm run lint
npm run build
```
