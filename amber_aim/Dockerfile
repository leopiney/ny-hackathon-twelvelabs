# Use Python 3.12 slim image as base
FROM python:3.12-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_SYSTEM_PYTHON=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

# Install build dependencies and curl for health checks
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv from official Docker image
COPY --from=ghcr.io/astral-sh/uv:0.6.13 /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Install dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

# Copy the project into the image
COPY src ./src
COPY prompts ./prompts
COPY .python-version ./
COPY README.md ./

# Sync the project
RUN uv sync --frozen

# Expose port 8000 for FastAPI
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application using UV
CMD ["uv", "run", "python", "-m", "aim"]

