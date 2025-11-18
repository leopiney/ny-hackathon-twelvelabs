#!/bin/bash
# Test script for Docker deployment

set -e

echo "🐳 Amber AIM Backend - Docker Test Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo ""
    echo "Please create a .env file with the required environment variables."
    echo "You can use the following template:"
    echo ""
    echo "# AWS Configuration"
    echo "AWS_ACCESS_KEY_ID=your_aws_access_key_here"
    echo "AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here"
    echo "AWS_S3_BUCKET=your_s3_bucket_name"
    echo "AWS_REGION=us-east-1"
    echo ""
    echo "# TwelveLabs Configuration"
    echo "TWELVE_LABS_API_KEY=your_twelve_labs_api_key_here"
    echo "TWELVE_LABS_CREATORS_INDEX_ID=your_creators_index_id"
    echo "TWELVE_LABS_ADS_INDEX_ID=your_ads_index_id"
    echo ""
    echo "# OpenAI Configuration"
    echo "OPENAI_API_KEY=your_openai_api_key_here"
    echo ""
    echo "# Application Configuration (Optional)"
    echo "LOG_LEVEL=INFO"
    echo "S3_BASE_PATH=videos"
    echo "UPLOAD_URL_EXPIRATION=1800"
    exit 1
fi

echo "✅ Found .env file"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    echo "Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Build the Docker image
echo "🏗️  Building Docker image..."
docker build -t amber-aim-backend . || {
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
}

echo -e "${GREEN}✅ Docker image built successfully${NC}"
echo ""

# Stop and remove existing container if running
if docker ps -a | grep -q amber-aim-test; then
    echo "🧹 Removing existing test container..."
    docker stop amber-aim-test > /dev/null 2>&1 || true
    docker rm amber-aim-test > /dev/null 2>&1 || true
fi

# Run the container
echo "🚀 Starting container..."
docker run -d \
    -p 8000:8000 \
    --env-file .env \
    --name amber-aim-test \
    amber-aim-backend

echo -e "${GREEN}✅ Container started${NC}"
echo ""

# Wait for the service to be ready
echo "⏳ Waiting for service to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Service is ready!${NC}"
        break
    fi
    attempt=$((attempt + 1))
    sleep 1
    echo -n "."
done

echo ""

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ Service failed to start within 30 seconds${NC}"
    echo ""
    echo "Container logs:"
    docker logs amber-aim-test
    echo ""
    echo "Cleaning up..."
    docker stop amber-aim-test > /dev/null 2>&1
    docker rm amber-aim-test > /dev/null 2>&1
    exit 1
fi

echo ""
echo "🧪 Running health check..."
response=$(curl -s http://localhost:8000/health)
echo "Response: $response"
echo ""

if echo "$response" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    docker logs amber-aim-test
    docker stop amber-aim-test > /dev/null 2>&1
    docker rm amber-aim-test > /dev/null 2>&1
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Docker deployment test completed successfully!${NC}"
echo "=========================================="
echo ""
echo "The API is now running at http://localhost:8000"
echo ""
echo "Available endpoints:"
echo "  - Health: http://localhost:8000/health"
echo "  - Docs:   http://localhost:8000/docs"
echo ""
echo "To view logs:"
echo "  docker logs -f amber-aim-test"
echo ""
echo "To stop the container:"
echo "  docker stop amber-aim-test"
echo ""
echo "To remove the container:"
echo "  docker rm amber-aim-test"
echo ""

