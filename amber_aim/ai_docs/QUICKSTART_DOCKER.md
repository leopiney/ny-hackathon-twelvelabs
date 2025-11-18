# 🚀 Quick Start: Docker Deployment

Get your Amber AIM backend running with Docker in 5 minutes!

## ⚡ TL;DR

```bash
# 1. Verify your .env file has all required variables
cat .env

# 2. Test the Docker setup
./docker-test.sh

# 3. Run with Docker Compose
docker-compose up
```

That's it! Your API is now running at http://localhost:8000

## 📋 Prerequisites Checklist

- [ ] Docker installed and running
- [ ] `.env` file with all required variables (see below)
- [ ] AWS S3 bucket created
- [ ] TwelveLabs account with API key and index IDs
- [ ] OpenAI API key

## 🔑 Environment Variables

Your `.env` file should contain:

```bash
# AWS (required)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your_bucket
AWS_REGION=us-east-1

# TwelveLabs (required)
TWELVE_LABS_API_KEY=your_key
TWELVE_LABS_CREATORS_INDEX_ID=your_index
TWELVE_LABS_ADS_INDEX_ID=your_index

# OpenAI (required)
OPENAI_API_KEY=your_key

# Optional
LOG_LEVEL=INFO
```

## 🎯 Three Ways to Run

### Option 1: Docker Compose (Recommended)

```bash
docker-compose up
```

### Option 2: Makefile Commands

```bash
make up        # Start
make logs      # View logs
make down      # Stop
```

### Option 3: Direct Docker Commands

```bash
docker build -t amber-aim-backend .
docker run -p 8000:8000 --env-file .env amber-aim-backend
```

## ✅ Verify It's Working

```bash
# Health check
curl http://localhost:8000/health

# Should return:
# {"status":"healthy","timestamp":"2025-11-18T..."}

# View API docs
open http://localhost:8000/docs
```

## 🚀 Deploy to Fly.io

```bash
# 1. Install Fly CLI
brew install flyctl  # macOS
# or visit https://fly.io/docs/hands-on/install-flyctl/

# 2. Login
fly auth login

# 3. Launch app (first time)
fly launch --no-deploy

# 4. Set secrets
fly secrets set \
  AWS_ACCESS_KEY_ID="..." \
  AWS_SECRET_ACCESS_KEY="..." \
  AWS_S3_BUCKET="..." \
  TWELVE_LABS_API_KEY="..." \
  TWELVE_LABS_CREATORS_INDEX_ID="..." \
  TWELVE_LABS_ADS_INDEX_ID="..." \
  OPENAI_API_KEY="..."

# 5. Deploy
fly deploy

# 6. Open your app
fly open
```

## 🐛 Troubleshooting

### Can't connect to Docker daemon
```bash
# Start Docker Desktop
# or
sudo systemctl start docker  # Linux
```

### Port 8000 already in use
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9

# Or use a different port
docker run -p 8001:8000 --env-file .env amber-aim-backend
```

### Container starts but health check fails
```bash
# Check logs
docker logs amber-aim

# Verify environment variables
docker exec amber-aim env | grep -E "AWS|TWELVE|OPENAI"
```

### Build fails
```bash
# Try rebuilding without cache
docker build --no-cache -t amber-aim-backend .

# Or with Makefile
make rebuild
```

## 📚 Next Steps

- Read [README.Docker.md](./README.Docker.md) for detailed documentation
- Check [DOCKER_SUMMARY.md](./DOCKER_SUMMARY.md) for implementation details
- Run `make help` to see all available commands
- Set up CI/CD with the included GitHub Actions workflow

## 💡 Useful Commands

```bash
# View logs in real-time
docker logs -f amber-aim
# or
make logs

# Stop everything
docker-compose down
# or
make down

# Clean up (remove containers and images)
make clean

# Run automated tests
./docker-test.sh
# or
make test

# Check resource usage
docker stats amber-aim
# or
make stats

# Open shell in container
docker exec -it amber-aim /bin/bash
# or
make shell
```

## 🎉 Success!

If you can access http://localhost:8000/health and see a healthy response, you're all set!

Your FastAPI backend is now running in Docker and ready to:
- ✅ Generate S3 upload URLs
- ✅ Analyze videos with TwelveLabs
- ✅ Suggest relevant ads
- ✅ Handle video processing

## 🤔 Need Help?

- **Detailed docs**: [README.Docker.md](./README.Docker.md)
- **Implementation**: [DOCKER_SUMMARY.md](./DOCKER_SUMMARY.md)
- **Main README**: [README.md](./README.md)
- **API docs**: http://localhost:8000/docs (when running)

---

**Pro tip**: Use `make help` to see all available commands!

