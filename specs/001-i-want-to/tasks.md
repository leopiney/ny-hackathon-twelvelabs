# Implementation Tasks: Video Upload URL Generation API

**Feature**: 001-i-want-to  
**Branch**: `001-i-want-to`  
**Date**: October 4, 2025  
**Mode**: Implementation Only (No Testing)

## Overview

This task list covers the implementation of a FastAPI backend service that generates AWS S3 presigned URLs for direct video uploads. Tasks are ordered by dependencies and marked with [P] for parallel execution where applicable.

**Note**: Per user request, this task list focuses on implementation only and does not include test generation tasks.

## Task Summary

- **Setup**: 3 tasks
- **Models**: 3 tasks (parallel)
- **Services**: 2 tasks
- **Endpoints**: 2 tasks
- **Configuration**: 2 tasks (parallel)
- **Documentation**: 2 tasks (parallel)
- **Total**: 14 tasks

---

## Phase 1: Project Setup

### T001: Setup Project Dependencies

**File**: `amber_aim/pyproject.toml`

Update project dependencies to include all required packages:

**Dependencies to add**:

```toml
[project]
dependencies = [
    "fastapi>=0.104.0",
    "boto3>=1.29.0",
    "pydantic>=2.5.0",
    "pydantic-settings>=2.1.0",
    "uvicorn[standard]>=0.24.0",
    "python-dotenv>=1.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-cov>=4.1.0",
    "pytest-asyncio>=0.21.0",
    "httpx>=0.25.0",
    "moto>=4.2.0",
    "black>=23.11.0",
    "isort>=5.12.0",
]
```

**Actions**:

1. Update `pyproject.toml` with production dependencies
2. Add development dependencies under `[project.optional-dependencies]`
3. Ensure Python version requirement is `>=3.12`

**Validation**: Run `uv pip install -e .` successfully

---

### T002: Create Environment Configuration Template

**File**: `amber_aim/.env.example`

Create environment variable template for configuration:

```bash
# AWS S3 Configuration
APP_AWS_S3_BUCKET=your-bucket-name
APP_AWS_REGION=us-east-1
APP_UPLOAD_URL_EXPIRATION=1800
APP_S3_BASE_PATH=upload

# AWS Credentials (for local development)
# In production, use IAM roles instead
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Application Settings
APP_LOG_LEVEL=INFO
```

**Actions**:

1. Create `.env.example` with all required configuration
2. Add comments explaining each variable
3. Document production vs development credential strategies

**Dependencies**: None [P]

---

### T003: Setup Logging Configuration

**File**: `amber_aim/logging_config.py`

Create logging configuration module with structured JSON logging:

**Requirements**:

- Configure Python `logging` module with JSON formatter
- Log levels configurable via environment variable
- Include timestamp, level, message, and context
- Log to stdout for container environments

**Implementation**:

```python
import logging
import json
from datetime import datetime


class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
        }
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_data)


def setup_logging(log_level: str = "INFO") -> None:
    """Configure application logging"""
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(handler)
```

**Dependencies**: None [P]

---

## Phase 2: Data Models

### T004: Implement UploadURLRequest Model [P]

**File**: `amber_aim/models/upload.py`

Create Pydantic request model with validation:

**Requirements**:

- Field: `filename: str` (required)
- Validator: Must contain file extension (has `.`)
- Validator: Cannot be empty or whitespace
- Validator: Maximum length 255 characters
- Use modern Python 3.12+ type hints

**Implementation Reference**: See `data-model.md` section 1

**Key Points**:

- Use `pydantic.BaseModel`
- Use `@field_validator` decorator
- Include descriptive error messages

**Dependencies**: T001

---

### T005: Implement UploadURLResponse Model [P]

**File**: `amber_aim/models/upload.py`

Create Pydantic response model with factory method:

**Requirements**:

- Fields: `upload_url`, `s3_path`, `expires_in`, `expires_at`
- Factory method `create()` to calculate expiration timestamp
- ISO 8601 timestamp format for `expires_at`
- Modern Python 3.12+ type hints

**Implementation Reference**: See `data-model.md` section 2

**Key Points**:

- Include `@classmethod` factory method
- Calculate `expires_at` from `expires_in`
- Use `datetime.utcnow()` for timestamp generation

**Dependencies**: T001

---

### T006: Implement Settings Configuration Model [P]

**File**: `amber_aim/config.py`

Create Pydantic Settings model for environment configuration:

**Requirements**:

- Field: `aws_s3_bucket: str` (required)
- Field: `aws_region: str` (default: "us-east-1")
- Field: `upload_url_expiration: int` (default: 1800)
- Field: `s3_base_path: str` (default: "upload")
- Use `pydantic-settings` for .env loading

**Implementation Reference**: See `data-model.md` Configuration Model section

**Key Points**:

- Inherit from `pydantic_settings.BaseSettings`
- Set `env_prefix = "APP_"`
- Set `env_file = ".env"`

**Dependencies**: T001

---

## Phase 3: Service Layer

### T007: Implement S3 Service

**File**: `amber_aim/services/s3_service.py`

Create S3 service class for presigned URL generation:

**Requirements**:

- Initialize boto3 S3 client
- Method: `generate_upload_url(filename: str, expiration: int) -> dict[str, str]`
- Generate UUID for unique file identification
- Extract file extension from filename
- Construct S3 key: `{base_path}/{uuid}.{extension}`
- Call `s3_client.generate_presigned_url('put_object', ...)`
- Return dict with `upload_url` and `s3_path`

**Implementation Reference**: See `research.md` section 1

**Key Points**:

- Use `uuid.uuid4()` for unique IDs
- Set `ContentType: 'video/*'` in presigned URL params
- Handle boto3 exceptions gracefully
- Use modern type hints throughout

**Dependencies**: T001, T006

---

### T008: Add Error Handling to S3 Service

**File**: `amber_aim/services/s3_service.py`

Add comprehensive error handling to S3 service:

**Requirements**:

- Catch `botocore.exceptions.ClientError` for S3 errors
- Catch `botocore.exceptions.NoCredentialsError` for credential issues
- Log errors with structured logging
- Raise custom exceptions with error codes
- Never expose AWS credentials in logs or errors

**Error Codes**:

- `S3_SERVICE_ERROR`: Generic S3 service failure
- `CONFIGURATION_ERROR`: Missing credentials or bucket config

**Dependencies**: T003, T007

---

## Phase 4: API Endpoints

### T009: Implement POST /upload Endpoint

**File**: `amber_aim/main.py`

Create FastAPI endpoint for upload URL generation:

**Requirements**:

- Route: `POST /upload`
- Request body: `UploadURLRequest`
- Response: `UploadURLResponse`
- Call S3Service to generate presigned URL
- Handle validation errors (400)
- Handle S3 service errors (500/503)
- Log all URL generation requests

**Implementation Reference**: See `contracts/upload-api.yaml`

**Key Points**:

- Use `@app.post("/upload", response_model=UploadURLResponse)`
- Extract filename from request
- Create UploadURLResponse using factory method
- Return 400 for invalid filenames
- Return 503 for S3 unavailability

**Dependencies**: T004, T005, T007, T008

---

### T010: Implement GET /health Endpoint [P]

**File**: `amber_aim/main.py`

Create health check endpoint:

**Requirements**:

- Route: `GET /health`
- Response: `{"status": "healthy", "timestamp": "<iso-8601>"}`
- Always return 200 (no dependencies checked)
- Include current UTC timestamp

**Implementation**:

```python
from datetime import datetime
from fastapi import FastAPI

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
```

**Dependencies**: T001

---

## Phase 5: Application Configuration

### T011: Wire Up FastAPI Application [P]

**File**: `amber_aim/main.py`

Create and configure the FastAPI application instance:

**Requirements**:

- Initialize FastAPI app with metadata
- Load Settings configuration
- Setup logging
- Initialize S3Service with settings
- Configure CORS if needed
- Add exception handlers for custom errors

**Key Components**:

```python
from fastapi import FastAPI
from config import Settings
from logging_config import setup_logging

settings = Settings()
setup_logging(settings.log_level)

app = FastAPI(
    title="Video Upload URL Generation API",
    description="Generate presigned S3 URLs for video uploads",
    version="1.0.0"
)
```

**Dependencies**: T003, T006, T007

---

### T012: Create Application Entry Point

**File**: `amber_aim/__main__.py`

Create module entry point for running the application:

**Requirements**:

- Allow running via `python -m amber_aim`
- Use uvicorn to serve the FastAPI app
- Load settings from environment
- Configure uvicorn with appropriate settings

**Implementation**:

```python
import uvicorn
from config import Settings

if __name__ == "__main__":
    settings = Settings()
    uvicorn.run(
        "amber_aim.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Only for development
    )
```

**Dependencies**: T011

---

## Phase 6: Documentation & Polish

### T013: Create Project README [P]

**File**: `amber_aim/README.md`

Create comprehensive README documentation:

**Sections to Include**:

1. **Overview**: Brief description of the service
2. **Features**: Key capabilities (presigned URLs, UUID naming, etc.)
3. **Requirements**: Python 3.12+, AWS credentials, S3 bucket
4. **Installation**: How to install dependencies
5. **Configuration**: Environment variables documentation
6. **Usage**: How to run the service
7. **API Documentation**: Link to OpenAPI docs (/docs)
8. **Example**: Quick example of generating and using upload URL
9. **Development**: How to contribute or develop locally

**Reference**: Use `quickstart.md` as source material

**Dependencies**: None [P]

---

### T014: Add Module Docstrings and Type Hints

**Files**: All Python files in `amber_aim/`

Add comprehensive docstrings and ensure type hints:

**Requirements**:

- Module-level docstrings for all `.py` files
- Function docstrings with Google-style format
- Type hints on ALL function signatures (parameters and return values)
- Use modern Python 3.12+ syntax (`str | None`, `dict[str, str]`, etc.)
- No imports from `typing` module

**Example**:

```python
"""S3 service for generating presigned upload URLs."""

from uuid import uuid4
import boto3

def generate_upload_url(
    filename: str,
    expiration: int = 1800
) -> dict[str, str]:
    """Generate a presigned S3 URL for video upload.

    Args:
        filename: Original filename with extension
        expiration: URL expiration time in seconds

    Returns:
        Dictionary with 'upload_url' and 's3_path' keys

    Raises:
        ValueError: If filename is invalid
        S3ServiceError: If S3 operation fails
    """
    # Implementation
```

**Dependencies**: All implementation tasks

---

## Task Execution Order

### Sequential Execution (Recommended)

```bash
# Phase 1: Setup (3 tasks)
T001 → T002, T003 (parallel)

# Phase 2: Models (3 tasks, all parallel after T001)
T001 → T004, T005, T006 (parallel)

# Phase 3: Services (2 tasks)
T006, T001 → T007 → T008
T003 (for logging in T008)

# Phase 4: Endpoints (2 tasks)
T004, T005, T007, T008 → T009
T001 → T010 (parallel with T009)

# Phase 5: Configuration (2 tasks)
T003, T006, T007 → T011 → T012

# Phase 6: Documentation (2 tasks, parallel)
(any time) → T013, T014 (parallel)
```

### Parallel Execution Groups

**Group 1** (after T001):

- T002: Environment template
- T003: Logging config
- T004: UploadURLRequest model
- T005: UploadURLResponse model
- T006: Settings model
- T010: Health endpoint

**Group 2** (after T007, T008):

- T009: Upload endpoint (depends on models + service)

**Group 3** (anytime):

- T013: README
- T014: Docstrings and type hints

---

## Validation Checklist

After completing all tasks, verify:

- [x] Service starts with `uvicorn amber_aim.main:app`
- [x] OpenAPI docs accessible at `http://localhost:8000/docs`
- [x] POST /upload returns valid presigned URL
- [x] GET /health returns healthy status
- [x] Environment variables load correctly from .env
- [x] All functions have type hints
- [x] Logging outputs structured JSON
- [x] README documentation is complete

## Implementation Status: COMPLETE ✅

All 14 tasks have been successfully implemented:

### Phase 1: Project Setup ✅

- [x] **T001**: Dependencies installed via `uv add`
- [x] **T002**: `.env.example` template created
- [x] **T003**: Logging configuration with JSON formatter

### Phase 2: Data Models ✅

- [x] **T004**: `UploadURLRequest` model with validation
- [x] **T005**: `UploadURLResponse` model with factory method
- [x] **T006**: `Settings` configuration model

### Phase 3: Service Layer ✅

- [x] **T007**: S3 service with presigned URL generation
- [x] **T008**: Comprehensive error handling

### Phase 4: API Endpoints & Configuration ✅

- [x] **T009**: POST /upload endpoint
- [x] **T010**: GET /health endpoint
- [x] **T011**: FastAPI application wiring
- [x] **T012**: Application entry point

### Phase 6: Documentation ✅

- [x] **T013**: Comprehensive README
- [x] **T014**: Module docstrings and type hints

**Implementation Date**: October 4, 2025  
**Total Time**: ~30 minutes  
**Lines of Code**: ~500 LOC

---

## Implementation Notes

**Modern Python 3.12+ Syntax**:

- Use `str | None` instead of `Optional[str]`
- Use `dict[K, V]` instead of `Dict[K, V]`
- Use `list[T]` instead of `List[T]`
- NO imports from `typing` module

**Error Handling**:

- Use FastAPI's `HTTPException` for HTTP errors
- Custom exceptions for service-layer errors
- Never expose sensitive data (AWS credentials) in errors

**Security**:

- No hardcoded credentials
- Use environment variables or IAM roles
- Log sanitization (no sensitive data in logs)

**Code Quality**:

- Follow Black formatting standards
- Use isort for import organization
- Type hints on all function signatures
- Comprehensive docstrings

---

_Generated from plan.md, data-model.md, contracts/upload-api.yaml, and research.md_
