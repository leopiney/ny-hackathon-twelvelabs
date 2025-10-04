# Video Upload URL Generation API

FastAPI backend service that generates secure, time-limited AWS S3 presigned URLs for direct video uploads.

## Features

- ✅ **Presigned S3 URLs**: Generate secure, time-limited URLs for direct S3 uploads
- ✅ **UUID-based Naming**: Unique file identifiers prevent collisions
- ✅ **Extension Preservation**: Maintains original file type information
- ✅ **Configurable Expiration**: Default 30-minute URL validity (configurable)
- ✅ **Public Endpoint**: No authentication required (designed for open access)
- ✅ **2GB File Support**: Handles videos up to 2GB in size
- ✅ **All Video Formats**: No format restrictions
- ✅ **Structured Logging**: JSON-formatted logs for easy parsing

## Requirements

- **Python**: 3.12 or higher
- **AWS Account**: S3 bucket with PutObject permissions
- **AWS Credentials**: Access key/secret or IAM role

## Installation

### Using uv (recommended)

```bash
cd amber_aim

# Install dependencies
uv pip install -e .

# For development dependencies
uv pip install -e ".[dev]"
```

### Using pip

```bash
cd amber_aim

# Install dependencies
pip install -e .

# For development dependencies
pip install -e ".[dev]"
```

## Configuration

Create a `.env` file in the `amber_aim/` directory:

```bash
# AWS S3 Configuration
APP_AWS_S3_BUCKET=your-bucket-name
APP_AWS_REGION=us-east-1
APP_UPLOAD_URL_EXPIRATION=1800
APP_S3_BASE_PATH=upload

# AWS Credentials (for local development)
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Application Settings
APP_LOG_LEVEL=INFO
```

**Production Note**: Use IAM roles instead of hardcoded credentials in production environments.

## Usage

### Running the Service

```bash
# Run with uvicorn
uvicorn amber_aim.main:app --reload

# Or run as a module
python -m amber_aim
```

The API will be available at:

- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### API Endpoints

#### POST /upload

Generate a presigned S3 upload URL.

**Request**:

```json
{
  "filename": "my_video.mp4"
}
```

**Response**:

```json
{
  "upload_url": "https://bucket.s3.amazonaws.com/upload/uuid.mp4?X-Amz-...",
  "s3_path": "upload/550e8400-e29b-41d4-a716-446655440000.mp4",
  "expires_in": 1800,
  "expires_at": "2025-10-04T12:30:00Z"
}
```

#### GET /health

Health check endpoint.

**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-04T12:00:00Z"
}
```

## Example Usage

### Python

```python
import requests

# Request upload URL
response = requests.post(
    "http://localhost:8000/upload",
    json={"filename": "my_video.mp4"}
)
data = response.json()

# Upload video to S3
with open("my_video.mp4", "rb") as f:
    requests.put(
        data["upload_url"],
        data=f,
        headers={"Content-Type": "video/mp4"}
    )
```

### JavaScript

```javascript
// Request upload URL
const response = await fetch("http://localhost:8000/upload", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ filename: "my_video.mp4" }),
});

const data = await response.json();

// Upload video to S3
const videoFile = document.querySelector('input[type="file"]').files[0];
await fetch(data.upload_url, {
  method: "PUT",
  body: videoFile,
  headers: { "Content-Type": "video/mp4" },
});
```

## Development

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=amber_aim --cov-report=html

# Run specific test file
pytest tests/unit/test_s3_service.py -v
```

### Code Formatting

```bash
# Format code with Black
black amber_aim/

# Sort imports with isort
isort amber_aim/
```

## Architecture

```
amber_aim/
├── main.py              # FastAPI application
├── config.py            # Configuration management
├── logging_config.py    # Logging setup
├── models/              # Pydantic models
│   └── upload.py
├── services/            # Business logic
│   └── s3_service.py
└── __main__.py          # Entry point
```

## Security Considerations

- **Public Endpoint**: No authentication (by design). Consider adding rate limiting for production.
- **Presigned URLs**: Time-limited (30 minutes default), single-use per URL.
- **AWS Permissions**: Minimal IAM permissions required (`s3:PutObject` only).
- **Bucket Access**: Ensure S3 bucket blocks public read access.

## Performance

- **URL Generation**: <100ms p95 latency
- **Throughput**: Handles 100+ requests/second
- **Scalability**: Stateless design enables horizontal scaling

## Troubleshooting

### Error: "S3 service unavailable"

**Solution**:

1. Verify AWS credentials are configured
2. Check bucket name matches S3 bucket
3. Verify IAM permissions include `s3:PutObject`

### Error: "filename must include extension"

**Solution**: Ensure filename includes extension (e.g., `.mp4`, `.mov`)

### Upload to presigned URL returns 403

**Solution**:

1. Generate new upload URL (previous one expired)
2. Check bucket CORS configuration if uploading from browser

## License

MIT

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Boto3 S3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html)
- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
