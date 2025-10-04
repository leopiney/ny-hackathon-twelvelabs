# Research: Video Upload URL Generation

**Feature**: 001-i-want-to  
**Phase**: 0 (Research & Technical Decisions)  
**Date**: October 4, 2025

## Research Questions

### 1. AWS S3 Presigned URL Generation

**Decision**: Use boto3 `generate_presigned_url()` with `put_object` method

**Rationale**:

- Native boto3 support for generating time-limited upload URLs
- No server-side file handling required (direct client-to-S3 upload)
- Supports custom expiration times via `ExpiresIn` parameter
- Automatically includes necessary AWS signature v4 authentication

**Implementation Pattern**:

```python
import boto3
from uuid import uuid4

s3_client = boto3.client('s3')

def generate_upload_url(file_extension: str, expiration: int = 1800) -> dict[str, str]:
    file_key = f"upload/{uuid4()}.{file_extension}"

    url = s3_client.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': 'bucket-name',
            'Key': file_key,
            'ContentType': 'video/*'
        },
        ExpiresIn=expiration
    )

    return {'url': url, 'path': file_key}
```

**Alternatives Considered**:

- AWS SDK presigned POST: More complex, requires form fields
- Custom S3 signature generation: Reinventing the wheel, error-prone
- Server-side upload proxy: Defeats purpose of direct upload

**Key Constraints**:

- Maximum expiration: 7 days (AWS limit)
- Requires AWS credentials with `s3:PutObject` permission
- URL is one-time use for the specific operation

### 2. FastAPI Endpoint Design

**Decision**: Single POST endpoint with Pydantic request/response models

**Rationale**:

- RESTful design for URL generation (POST creates a resource reference)
- Pydantic provides automatic validation and serialization
- Type hints enable OpenAPI schema generation
- Modern Python patterns (3.12+ type syntax)

**Implementation Pattern**:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

class UploadURLRequest(BaseModel):
    filename: str = Field(..., description="Original filename with extension")

class UploadURLResponse(BaseModel):
    upload_url: str = Field(..., description="Presigned S3 URL")
    s3_path: str = Field(..., description="S3 object key")
    expires_in: int = Field(..., description="URL validity in seconds")
    expires_at: str = Field(..., description="ISO 8601 expiration timestamp")

@app.post("/upload", response_model=UploadURLResponse)
async def generate_upload_url(request: UploadURLRequest):
    # Implementation
    pass
```

**Alternatives Considered**:

- GET endpoint: Semantically incorrect (not idempotent, creates resource)
- Query parameters: Less clean than request body for structured data
- Multiple endpoints per file type: Unnecessary complexity

**Error Handling**:

- Invalid filename/extension: 400 Bad Request
- S3 service unavailable: 503 Service Unavailable
- AWS credential issues: 500 Internal Server Error (logged, not exposed)

### 3. AWS Credentials Management

**Decision**: boto3 default credential chain + environment variables

**Rationale**:

- Follows AWS best practices for credential management
- Supports multiple deployment scenarios (local dev, containers, EC2/ECS)
- No hardcoded credentials in code
- Automatic IAM role support in cloud environments

**Configuration Strategy**:

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    aws_s3_bucket: str
    aws_region: str = "us-east-1"
    upload_url_expiration: int = 1800  # 30 minutes
    s3_base_path: str = "upload"

    class Config:
        env_file = ".env"
        env_prefix = "APP_"
```

**Credential Chain Order** (boto3 default):

1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
2. Shared credentials file (`~/.aws/credentials`)
3. IAM role (for EC2/ECS/Lambda)

**Alternatives Considered**:

- Explicit credential passing: Less flexible, harder to manage
- AWS Secrets Manager: Overkill for simple credential management
- Custom credential provider: Unnecessary complexity

**Security Notes**:

- Never log AWS credentials
- Use IAM roles in production (no static credentials)
- Principle of least privilege: Only `s3:PutObject` permission needed

### 4. File Organization in S3

**Decision**: Flat structure with UUID filenames under base path

**Rationale**:

- UUID ensures uniqueness without coordination
- Preserving extension maintains file type information
- Base path (`upload/`) enables easy lifecycle policies
- Flat structure simplifies retrieval and avoids deep nesting issues

**Path Pattern**: `{base_path}/{uuid4}.{extension}`

**Example**: `upload/550e8400-e29b-41d4-a716-446655440000.mp4`

**Alternatives Considered**:

- Date-based hierarchy (`upload/2025/10/04/...`): Complicates retrieval, no benefit
- User-based paths: No user authentication in this feature
- Original filenames: Risk of collisions, security issues (path traversal)

**S3 Bucket Configuration** (deployment-time):

- Lifecycle policy: Optional transition to Glacier after N days
- CORS: Enable if web clients upload directly
- Versioning: Optional for data protection
- Block public access: Yes (presigned URLs provide temporary access)

### 5. Logging and Observability

**Decision**: Structured logging with Python's standard logging module

**Rationale**:

- Built-in Python logging is sufficient for this service
- Structured logs (JSON) enable easy parsing and analysis
- Log all URL generation for audit trail
- No sensitive data (URLs expire, no credentials logged)

**Log Events**:

- URL generation request (filename, UUID, expiration)
- S3 service errors (with error type, no credentials)
- Invalid requests (validation errors)
- Service health checks

**Implementation**:

```python
import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)

def log_upload_url_generation(uuid: str, s3_path: str, filename: str):
    logger.info(json.dumps({
        "event": "upload_url_generated",
        "timestamp": datetime.utcnow().isoformat(),
        "uuid": uuid,
        "s3_path": s3_path,
        "original_filename": filename,
        "expires_in": 1800
    }))
```

**Alternatives Considered**:

- Third-party logging service: Overkill for simple service
- Database logging: Adds unnecessary dependency
- No logging: Violates observability requirements

## Technology Stack Summary

**Core Dependencies**:

- `fastapi` - Web framework
- `boto3` - AWS SDK for S3
- `pydantic` - Data validation
- `pydantic-settings` - Configuration management
- `uvicorn` - ASGI server
- `python-multipart` - Form data support (if needed)

**Development Dependencies**:

- `pytest` - Testing framework
- `pytest-cov` - Coverage reporting
- `pytest-asyncio` - Async test support
- `moto` - AWS service mocking for tests
- `httpx` - HTTP client for integration tests
- `black` - Code formatting
- `isort` - Import sorting

**Deployment Requirements**:

- Python 3.12+ runtime
- AWS credentials (environment or IAM role)
- S3 bucket with PutObject permissions
- Environment variables configuration

## Open Questions Resolved

1. **S3 bucket configuration**: Single bucket via `AWS_S3_BUCKET` environment variable
2. **File size limits**: Handled client-side (S3 enforces during upload)
3. **Content-Type handling**: Set to `video/*` in presigned URL
4. **Error response format**: Standard FastAPI HTTPException with JSON

## Next Steps

Phase 1 will generate:

1. OpenAPI contract (`contracts/upload-api.yaml`)
2. Data models (`data-model.md`)
3. Quickstart guide (`quickstart.md`)
4. Agent context file (`.cursorrules`)
