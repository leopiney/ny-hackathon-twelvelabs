# Quickstart: Video Upload URL Generation API

**Feature**: 001-i-want-to  
**Phase**: 1 (Implementation Guide)  
**Date**: October 4, 2025

## Prerequisites

- Python 3.12 or higher
- AWS account with S3 access
- AWS credentials (access key or IAM role)
- S3 bucket created

## Setup

### 1. Install Dependencies

```bash
cd amber_aim

# Install dependencies using uv (preferred)
uv pip install -e ".[dev]"

# Or using pip
pip install -e ".[dev]"
```

### 2. Configure Environment

Create a `.env` file in the `amber_aim/` directory:

```bash
# AWS Configuration
APP_AWS_S3_BUCKET=your-bucket-name
APP_AWS_REGION=us-east-1
APP_UPLOAD_URL_EXPIRATION=1800
APP_S3_BASE_PATH=upload

# AWS Credentials (for local development)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

**Production Note**: In production, use IAM roles instead of hardcoded credentials.

### 3. Verify AWS Configuration

```bash
# Test AWS connectivity
python -c "import boto3; print(boto3.client('s3').list_buckets())"
```

## Running the Service

### Local Development

```bash
cd amber_aim

# Run with uvicorn (auto-reload enabled)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:

- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs (Interactive Swagger UI)
- **ReDoc**: http://localhost:8000/redoc (Alternative docs)
- **OpenAPI**: http://localhost:8000/openapi.json

### Production Deployment

```bash
# Run with production settings
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Testing the API

### 1. Health Check

```bash
curl http://localhost:8000/health
```

**Expected Response**:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-04T12:00:00Z"
}
```

### 2. Generate Upload URL

```bash
curl -X POST http://localhost:8000/upload \
  -H "Content-Type: application/json" \
  -d '{"filename": "test_video.mp4"}'
```

**Expected Response**:

```json
{
  "upload_url": "https://your-bucket.s3.amazonaws.com/upload/550e8400-e29b-41d4-a716-446655440000.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&...",
  "s3_path": "upload/550e8400-e29b-41d4-a716-446655440000.mp4",
  "expires_in": 1800,
  "expires_at": "2025-10-04T12:30:00Z"
}
```

### 3. Upload Video to S3

```bash
# Extract upload_url from previous response
UPLOAD_URL="<paste-upload-url-here>"

# Upload a video file using PUT
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: video/mp4" \
  --data-binary "@path/to/your/video.mp4"
```

**Success**: HTTP 200 with empty body

### 4. Verify Upload in S3

```bash
# List objects in the bucket
aws s3 ls s3://your-bucket-name/upload/

# Or using boto3
python -c "
import boto3
s3 = boto3.client('s3')
response = s3.list_objects_v2(Bucket='your-bucket-name', Prefix='upload/')
for obj in response.get('Contents', []):
    print(obj['Key'])
"
```

## Running Tests

### Unit Tests

```bash
cd amber_aim

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/unit/test_s3_service.py -v
```

### Integration Tests

```bash
# Run integration tests (requires AWS credentials)
pytest tests/integration/ -v

# Run with mocked S3 (using moto)
pytest tests/integration/ -v --mock-s3
```

### Contract Tests

```bash
# Validate OpenAPI contract
pytest tests/contract/test_upload_contract.py -v
```

## Example: Complete Upload Flow

### Python Client Example

```python
import requests
import os

# 1. Request upload URL
response = requests.post(
    "http://localhost:8000/upload",
    json={"filename": "my_video.mp4"}
)
data = response.json()

upload_url = data["upload_url"]
s3_path = data["s3_path"]

print(f"Upload URL: {upload_url}")
print(f"S3 Path: {s3_path}")
print(f"Expires in: {data['expires_in']} seconds")

# 2. Upload video file
video_file = "path/to/my_video.mp4"
with open(video_file, 'rb') as f:
    upload_response = requests.put(
        upload_url,
        data=f,
        headers={"Content-Type": "video/mp4"}
    )

if upload_response.status_code == 200:
    print(f"✓ Video uploaded successfully to {s3_path}")
else:
    print(f"✗ Upload failed: {upload_response.status_code}")
```

### JavaScript/TypeScript Client Example

```typescript
// 1. Request upload URL
const response = await fetch("http://localhost:8000/upload", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ filename: "my_video.mp4" }),
});

const data = await response.json();
console.log("Upload URL:", data.upload_url);
console.log("S3 Path:", data.s3_path);

// 2. Upload video file
const videoFile = document.querySelector('input[type="file"]').files[0];
const uploadResponse = await fetch(data.upload_url, {
  method: "PUT",
  body: videoFile,
  headers: { "Content-Type": "video/mp4" },
});

if (uploadResponse.ok) {
  console.log("✓ Video uploaded successfully");
} else {
  console.error("✗ Upload failed");
}
```

## Troubleshooting

### Error: "S3 service unavailable"

**Cause**: AWS credentials not configured or bucket doesn't exist

**Solution**:

1. Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set
2. Check bucket name in `.env` matches actual S3 bucket
3. Verify IAM permissions include `s3:PutObject`

### Error: "filename must include extension"

**Cause**: Request body missing file extension

**Solution**: Ensure filename includes extension (e.g., `.mp4`, `.mov`)

```json
{"filename": "video.mp4"}  // ✓ Correct
{"filename": "video"}      // ✗ Missing extension
```

### Error: Upload to presigned URL returns 403

**Cause**: URL expired or invalid

**Solution**:

1. Generate new upload URL (previous one expired after 30 minutes)
2. Verify clock synchronization (AWS signature v4 is time-sensitive)
3. Check bucket CORS configuration if uploading from browser

### Error: File larger than 2GB fails

**Cause**: S3 PUT operation limit

**Solution**: For files >2GB, implement multipart upload (future enhancement)

## Performance Notes

**Expected Latency**:

- URL generation: <100ms p95
- End-to-end (request → upload → verify): Depends on file size and network

**Throughput**:

- API can handle 100+ req/s for URL generation
- Upload throughput limited by client bandwidth and S3 region

**Scaling**:

- Service is stateless (can scale horizontally)
- No database or cache required
- Bottleneck is AWS S3 API rate limits (not typically an issue)

## Security Considerations

**Public Endpoint**:

- No authentication required (by design)
- Rate limiting recommended for production
- Monitor for abuse via CloudWatch logs

**Presigned URLs**:

- Time-limited (30 minutes default)
- Single-use per URL
- Cannot be reused after expiration

**AWS Permissions**:

- Minimal IAM permissions: `s3:PutObject` only
- Bucket should block public read access
- Enable S3 bucket logging for audit trail

## Next Steps

1. **Run Tests**: `pytest` to verify implementation
2. **Review Logs**: Check application logs for URL generation events
3. **Monitor S3**: Verify videos appearing in `upload/` prefix
4. **Production**: Configure IAM roles, add rate limiting, enable monitoring

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Boto3 S3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html)
- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [OpenAPI Spec](./contracts/upload-api.yaml)
