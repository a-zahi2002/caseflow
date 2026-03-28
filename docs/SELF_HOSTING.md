# Self-Hosting Caseflow

Caseflow is designed to be easily self-hosted using Docker Compose.

## Prerequisites

-   [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
-   At least 8 GB of RAM (16 GB recommended for Ollama models)
-   Git

## Step-by-Step Guide

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/caseflow.git
    cd caseflow
    ```

2.  **Configuration**:
    -   Copy `.env.example` to `.env`.
    -   Fill in the required variables (DATABASE_URL, JWT_SECRET, etc.).
    -   (Optional) Adjust ports or service names in `infra/docker-compose.yml`.

3.  **Start Services**:
    ```bash
    docker compose -f infra/docker-compose.yml up -d
    ```
    This will spin up:
    -   **Web Interface** (Port 3000)
    -   **API Server** (Port 4000)
    -   **PostgreSQL 15** (Port 5432)
    -   **Ollama** (Port 11434)

4.  **Wait for Ollama Models**:
    On the first boot, the `ollama-init` service will pull the required models (`meditron` and `llama3`). This may take several minutes depending on your internet speed.

5.  **Run Database Migrations**:
    Migrations run automatically on the API service startup. To run them manually inside the container:
    ```bash
    docker exec caseflow-api npx prisma migrate deploy
    ```

6.  **Update Caseflow**:
    To update to the latest version:
    ```bash
    git pull origin main
    docker compose -f infra/docker-compose.yml up -d --build
    docker exec caseflow-api npx prisma migrate deploy
    ```

## Troubleshooting

-   **Ollama Not Responding**: Check if `caseflow-ollama` is healthy. Ensure you have enough RAM allocated to Docker.
-   **Database Connection Failure**: Verify that `DATABASE_URL` matches the service name (`db`) if you are using Docker networking.
-   **File Uploads**: Ensure the `infra/uploads` directory (if configured) has the correct permissions for the Docker user.

## Support

For issues or questions, please open a GitHub issue or contact the maintainers.
