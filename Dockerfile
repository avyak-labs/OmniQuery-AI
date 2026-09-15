# ==============================================================================
# OmniQuery-AI: Production Multi-Stage Dockerfile
# Stage 1: Build dependencies and wheels
# Stage 2: Minimal, secure runtime container
# ==============================================================================

# --- Stage 1: Builder ---
FROM python:3.11-slim AS builder

WORKDIR /build

# Install system compilation dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# --- Stage 2: Final Minimal Runtime ---
FROM python:3.11-slim AS runner

WORKDIR /app

# Install runtime PostgreSQL client library
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root application user
RUN groupadd -r appgroup && useradd -r -g appgroup -d /app appuser

# Copy installed Python packages from builder stage
COPY --from=builder /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Copy project source files
COPY --chown=appuser:appgroup app /app/app
COPY --chown=appuser:appgroup ui /app/ui
COPY --chown=appuser:appgroup docs /app/docs

# Switch to non-root user
USER appuser

# Expose default API and Streamlit ports
EXPOSE 8000 8501

# Healthcheck to verify container viability
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Default execution starts FastAPI backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
