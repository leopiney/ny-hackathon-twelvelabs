"""S3 service for generating presigned upload URLs."""

import logging
from uuid import uuid4

import boto3
from botocore.exceptions import ClientError, NoCredentialsError

logger = logging.getLogger(__name__)


class S3ServiceError(Exception):
    """Custom exception for S3 service errors."""

    def __init__(self, message: str, error_code: str):
        """Initialize S3 service error.

        Args:
            message: Human-readable error message
            error_code: Machine-readable error code
        """
        super().__init__(message)
        self.error_code = error_code


class S3Service:
    """Service for generating S3 presigned upload URLs."""

    def __init__(self, bucket_name: str, region: str, base_path: str):
        """Initialize S3 service.

        Args:
            bucket_name: S3 bucket name
            region: AWS region
            base_path: Base path prefix for uploads
        """
        self.bucket_name = bucket_name
        self.region = region
        self.base_path = base_path
        self.s3_client = boto3.client("s3", region_name=region)

    def generate_upload_url(
        self, filename: str, expiration: int = 1800
    ) -> dict[str, str]:
        """Generate a presigned S3 URL for video upload.

        Args:
            filename: Original filename with extension
            expiration: URL expiration time in seconds (default: 1800)

        Returns:
            Dictionary with 'upload_url' and 's3_path' keys

        Raises:
            S3ServiceError: If S3 operation fails
            ValueError: If filename is invalid
        """
        # Extract file extension
        if "." not in filename:
            raise ValueError("Filename must include extension")

        extension = filename.rsplit(".", 1)[1]

        # Generate unique file key
        file_uuid = str(uuid4())
        s3_key = f"{self.base_path}/{file_uuid}.{extension}"

        try:
            # Generate presigned URL for PUT operation
            presigned_url = self.s3_client.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": s3_key,
                    "ContentType": "video/*",
                },
                ExpiresIn=expiration,
            )

            # Log successful URL generation
            logger.info(
                "Generated upload URL",
                extra={
                    "uuid": file_uuid,
                    "s3_path": s3_key,
                    "original_filename": filename,
                    "expires_in": expiration,
                },
            )

            return {"upload_url": presigned_url, "s3_path": s3_key}

        except NoCredentialsError as e:
            logger.error("AWS credentials not found", exc_info=True)
            raise S3ServiceError(
                "AWS credentials not configured", "CONFIGURATION_ERROR"
            ) from e

        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "Unknown")
            logger.error(
                "S3 client error",
                extra={"error_code": error_code, "bucket": self.bucket_name},
                exc_info=True,
            )
            raise S3ServiceError(
                f"Failed to generate upload URL: {error_code}", "S3_SERVICE_ERROR"
            ) from e

        except Exception as e:
            logger.error("Unexpected error generating upload URL", exc_info=True)
            raise S3ServiceError(
                "Unexpected error generating upload URL", "S3_SERVICE_ERROR"
            ) from e
