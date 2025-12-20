FROM python:3.11-slim

# Build arguments for versioning
ARG VERSION=1.0.1
ARG BUILD_DATE
ARG GIT_COMMIT

# 1. Stop the "debconf" errors (Tells Linux "I am a robot, don't ask me questions")
ENV DEBIAN_FRONTEND=noninteractive

# 2. Stop the "pip root" warning (Tells pip "I know I am root, it's okay")
ENV PIP_ROOT_USER_ACTION=ignore

# Set version environment variables
ENV APP_VERSION=${VERSION}
ENV BUILD_DATE=${BUILD_DATE}
ENV GIT_COMMIT=${GIT_COMMIT}

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
