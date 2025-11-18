# Docker Deployment Guide for Amber AIM Backend

This guide explains how to build and deploy the Amber AIM FastAPI backend using Docker and UV package manager.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for local development)
- For fly.io deployment: [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/)

## Environment Variables

The following environment variables are required:

### AWS Configuration
- `AWS_ACCESS_KEY_ID` - AWS access key ID
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key
- `AWS_S3_BUCKET` - S3 bucket name for video storage
- `AWS_REGION` - AWS region (default: us-east-1)

### TwelveLabs Configuration
- `TWELVE_LABS_API_KEY` - TwelveLabs API key
- `TWELVE_LABS_CREATORS_INDEX_ID` - Index ID for creator videos
- `TWELVE_LABS_ADS_INDEX_ID` - Index ID for advertisement videos

### OpenAI Configuration
- `OPENAI_API_KEY` - OpenAI API key for AI agent functionality

### Application Configuration (Optional)
- `LOG_LEVEL` - Logging level (default: INFO)
- `S3_BASE_PATH` - Base path for S3 storage (default: videos)
- `UPLOAD_URL_EXPIRATION` - Upload URL expiration in seconds (default: 1800)

## Local Development with Docker

### 1. Create Environment File

Create a `.env` file in the `amber_aim` directory:

```bash
# AWS
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=us-east-1

# TwelveLabs
TWELVE_LABS_API_KEY=your_twelve_labs_key
TWELVE_LABS_CREATORS_INDEX_ID=your_creators_index
TWELVE_LABS_ADS_INDEX_ID=your_ads_index

# OpenAI
OPENAI_API_KEY=your_openai_key

# Optional
LOG_LEVEL=INFO
```

### 2. Build and Run with Docker Compose

```bash
# Build the image
docker-compose build

# Start the service
docker-compose up

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### 3. Build and Run with Docker (without Compose)

```bash
# Build the Docker image
docker build -t amber-aim-backend .

# Run the container
docker run -p 8000:8000 \
  --env-file .env \
  --name amber-aim \
  amber-aim-backend

# Run in detached mode
docker run -d -p 8000:8000 \
  --env-file .env \
  --name amber-aim \
  amber-aim-backend
```

### 4. Test the API

```bash
# Health check
curl http://localhost:8000/health

# Generate upload URL
curl -X POST http://localhost:8000/upload \
  -H "Content-Type: application/json" \
  -d '{"filename": "test-video.mp4"}'
```

## Deploying to Fly.io

### 1. Install Fly CLI

```bash
# macOS
brew install flyctl

# Linux/WSL
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

### 2. Login to Fly.io

```bash
fly auth login
```

### 3. Initialize Fly App (First Time)

```bash
# The fly.toml is already configured, but you can customize it
fly launch --no-deploy

# This will:
# - Create a new app on Fly.io
# - Set up the app configuration
# - NOT deploy yet (we need to set secrets first)
```

### 4. Set Secrets

Set all required environment variables as secrets:

```bash
# AWS Configuration
fly secrets set AWS_ACCESS_KEY_ID="your_access_key"
fly secrets set AWS_SECRET_ACCESS_KEY="your_secret_key"
fly secrets set AWS_S3_BUCKET="your_bucket_name"
fly secrets set AWS_REGION="us-east-1"

# TwelveLabs Configuration
fly secrets set TWELVE_LABS_API_KEY="your_twelve_labs_key"
fly secrets set TWELVE_LABS_CREATORS_INDEX_ID="your_creators_index"
fly secrets set TWELVE_LABS_ADS_INDEX_ID="your_ads_index"

# OpenAI Configuration
fly secrets set OPENAI_API_KEY="your_openai_key"

# Optional Configuration
fly secrets set LOG_LEVEL="INFO"
fly secrets set S3_BASE_PATH="videos"
```

### 5. Deploy to Fly.io

```bash
# Deploy the application
fly deploy

# Monitor deployment
fly logs

# Open the app in browser
fly open

# Check status
fly status

# Scale the app
fly scale count 2  # Run 2 instances

# Set machine resources
fly scale memory 2048  # 2GB RAM
fly scale vm shared-cpu-2x  # 2 vCPUs
```

### 6. Verify Deployment

```bash
# Get app URL
fly info

# Test health endpoint
curl https://your-app-name.fly.dev/health

# View real-time logs
fly logs
```

## Docker Image Details

### Base Image
- `python:3.12-slim` - Minimal Python 3.12 image

### UV Package Manager
- Installed via official installer script
- Manages all Python dependencies
- Uses `pyproject.toml` and `uv.lock` for reproducible builds

### Ports
- **8000** - FastAPI application port

### Health Check
- Endpoint: `GET /health`
- Interval: 30 seconds
- Timeout: 10 seconds
- Start period: 5 seconds
- Retries: 3

### Entry Point
```bash
uv run python -m aim
```

This command:
1. Uses UV to manage the Python environment
2. Runs the `aim` package as a module
3. Starts the FastAPI server via `__main__.py`

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs amber-aim

# Or with fly.io
fly logs
```

### Port already in use
```bash
# Use a different port
docker run -p 8001:8000 --env-file .env amber-aim-backend
```

### Environment variables not loaded
```bash
# Verify .env file exists and has correct values
cat .env

# Or pass variables directly
docker run -p 8000:8000 \
  -e AWS_ACCESS_KEY_ID=xxx \
  -e AWS_SECRET_ACCESS_KEY=yyy \
  amber-aim-backend
```

### Health check failing
```bash
# Check if service is running
curl http://localhost:8000/health

# Inspect container
docker exec -it amber-aim bash
```

## Production Considerations

1. **Security**
   - Never commit `.env` files to version control
   - Use secrets management (Fly.io secrets, AWS Secrets Manager, etc.)
   - Rotate credentials regularly

2. **Scaling**
   - Fly.io auto-scaling: Configure in `fly.toml`
   - Consider horizontal scaling for high traffic
   - Monitor resource usage

3. **Monitoring**
   - Set up application logging
   - Use Fly.io metrics and dashboards
   - Configure alerts for errors

4. **Backups**
   - Regular S3 bucket backups
   - Database backups if applicable
   - Configuration backups

5. **Updates**
   - Use CI/CD for automated deployments
   - Test changes in staging environment
   - Implement rolling deployments

## Additional Resources

- [UV Documentation](https://github.com/astral-sh/uv)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Fly.io Documentation](https://fly.io/docs/)

