.PHONY: help build run stop clean logs test deploy-fly

# Docker image name
IMAGE_NAME := amber-aim-backend
CONTAINER_NAME := amber-aim

# Default target
help:
	@echo "Amber AIM Backend - Docker Commands"
	@echo "===================================="
	@echo ""
	@echo "Available commands:"
	@echo "  make build          - Build Docker image"
	@echo "  make run            - Run container (detached)"
	@echo "  make stop           - Stop and remove container"
	@echo "  make logs           - Show container logs (follow)"
	@echo "  make clean          - Remove container and image"
	@echo "  make test           - Run Docker test script"
	@echo "  make health         - Check service health"
	@echo ""
	@echo "Docker Compose commands:"
	@echo "  make up             - Start services with docker-compose"
	@echo "  make down           - Stop services with docker-compose"
	@echo "  make restart        - Restart services"
	@echo ""
	@echo "Fly.io deployment:"
	@echo "  make deploy-fly     - Deploy to fly.io"
	@echo "  make fly-logs       - Show fly.io logs"
	@echo "  make fly-status     - Show fly.io status"
	@echo ""

# Build Docker image
build:
	@echo "🏗️  Building Docker image..."
	docker build -t $(IMAGE_NAME) .
	@echo "✅ Build complete!"

# Run container
run: build
	@echo "🚀 Starting container..."
	@docker stop $(CONTAINER_NAME) 2>/dev/null || true
	@docker rm $(CONTAINER_NAME) 2>/dev/null || true
	docker run -d \
		-p 8000:8000 \
		--env-file .env \
		--name $(CONTAINER_NAME) \
		$(IMAGE_NAME)
	@echo "✅ Container started!"
	@echo "📍 API: http://localhost:8000"
	@echo "📖 Docs: http://localhost:8000/docs"

# Stop container
stop:
	@echo "🛑 Stopping container..."
	@docker stop $(CONTAINER_NAME) 2>/dev/null || true
	@docker rm $(CONTAINER_NAME) 2>/dev/null || true
	@echo "✅ Container stopped and removed"

# Show logs
logs:
	docker logs -f $(CONTAINER_NAME)

# Clean up
clean: stop
	@echo "🧹 Removing Docker image..."
	@docker rmi $(IMAGE_NAME) 2>/dev/null || true
	@echo "✅ Cleanup complete"

# Run test script
test:
	@bash docker-test.sh

# Health check
health:
	@echo "🏥 Checking service health..."
	@curl -s http://localhost:8000/health | python3 -m json.tool || echo "❌ Service not responding"

# Docker Compose commands
up:
	@echo "🚀 Starting services with docker-compose..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "📍 API: http://localhost:8000"

down:
	@echo "🛑 Stopping services..."
	docker-compose down
	@echo "✅ Services stopped"

restart: down up

# Fly.io deployment commands
deploy-fly:
	@echo "🚀 Deploying to fly.io..."
	fly deploy
	@echo "✅ Deployment complete!"

fly-logs:
	@echo "📋 Showing fly.io logs..."
	fly logs

fly-status:
	@echo "📊 Checking fly.io status..."
	fly status

# Development mode (with live reload)
dev:
	@echo "🔧 Starting development mode..."
	docker-compose up

# Build without cache
rebuild:
	@echo "🔨 Rebuilding without cache..."
	docker build --no-cache -t $(IMAGE_NAME) .
	@echo "✅ Rebuild complete!"

# Shell into running container
shell:
	@echo "🐚 Opening shell in container..."
	docker exec -it $(CONTAINER_NAME) /bin/bash

# Show container stats
stats:
	@echo "📊 Container stats..."
	docker stats $(CONTAINER_NAME) --no-stream

