"""FastAPI application for video upload URL generation."""

import logging
from datetime import datetime

from fastapi import FastAPI, HTTPException

from aim.config import Settings
from aim.logging_config import setup_logging
from aim.models.upload import UploadURLRequest, UploadURLResponse
from aim.services.s3_service import S3Service, S3ServiceError

# Load settings and setup logging
settings = Settings()
setup_logging(settings.log_level)

logger = logging.getLogger(__name__)

# Initialize FastAPI application
app = FastAPI(
    title="Video Upload URL Generation API",
    description="Generate presigned S3 URLs for direct video uploads",
    version="1.0.0",
)

# Initialize S3 service
s3_service = S3Service(
    bucket_name=settings.aws_s3_bucket,
    region=settings.aws_region,
    base_path=settings.s3_base_path,
)


@app.get("/health")
def health_check() -> dict[str, str]:
    """Health check endpoint.

    Returns:
        Health status and current timestamp
    """
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat() + "Z"}


@app.post("/upload", response_model=UploadURLResponse)
def generate_upload_url(request: UploadURLRequest) -> UploadURLResponse:
    """Generate presigned S3 upload URL for video files.

    Creates a unique S3 presigned URL for uploading a video file directly to S3.
    The endpoint generates a UUID for unique file identification, preserves the
    original file extension, and returns a presigned URL valid for 30 minutes
    (configurable).

    Args:
        request: Upload URL request with filename

    Returns:
        UploadURLResponse with presigned URL, S3 path, and expiration info

    Raises:
        HTTPException: 400 for invalid filename, 500 for S3 errors, 503 for unavailable
    """
    try:
        # Generate presigned URL
        result = s3_service.generate_upload_url(
            filename=request.filename, expiration=settings.upload_url_expiration
        )

        # Create response with expiration metadata
        response = UploadURLResponse.create(
            upload_url=result["upload_url"],
            s3_path=result["s3_path"],
            expires_in=settings.upload_url_expiration,
        )

        import ipdb

        ipdb.set_trace()

        logger.info(
            "Upload URL generated successfully",
            extra={"s3_path": result["s3_path"], "s3_filename": request.filename},
        )

        return response

    except ValueError as e:
        logger.warning("Invalid filename", extra={"filename": request.filename})
        raise HTTPException(
            status_code=400,
            detail={"detail": str(e), "error_code": "INVALID_FILENAME"},
        ) from e

    except S3ServiceError as e:
        if e.error_code == "CONFIGURATION_ERROR":
            logger.error("Configuration error", exc_info=True)
            raise HTTPException(
                status_code=500, detail={"detail": str(e), "error_code": e.error_code}
            ) from e
        else:
            logger.error("S3 service error", exc_info=True)
            raise HTTPException(
                status_code=503, detail={"detail": str(e), "error_code": e.error_code}
            ) from e

    except Exception as e:
        logger.error("Unexpected error in upload endpoint", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "detail": "Internal server error",
                "error_code": "INTERNAL_ERROR",
            },
        ) from e
