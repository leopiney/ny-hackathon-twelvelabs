"""Upload request and response models."""

from datetime import datetime, timedelta

from pydantic import BaseModel, Field, field_validator


class UploadURLRequest(BaseModel):
    """Request model for generating an upload URL.

    Attributes:
        filename: Original filename with extension (e.g., "video.mp4")
    """

    filename: str = Field(
        ...,
        description="Original filename with extension",
        examples=["video.mp4", "recording.mov"],
    )

    @field_validator("filename")
    @classmethod
    def validate_filename(cls, v: str) -> str:
        """Validate that filename contains extension and is not empty.

        Args:
            v: The filename to validate

        Returns:
            The validated filename

        Raises:
            ValueError: If filename is invalid
        """
        if not v or not v.strip():
            raise ValueError("filename cannot be empty")
        if "." not in v:
            raise ValueError("filename must include extension")
        if len(v) > 255:
            raise ValueError("filename too long (max 255 chars)")
        return v.strip()


class UploadURLResponse(BaseModel):
    """Response model containing presigned URL and metadata.

    Attributes:
        upload_url: AWS S3 presigned URL for video upload (PUT request)
        s3_path: S3 object key where video will be stored
        expires_in: Seconds until URL expires
        expires_at: ISO 8601 timestamp when URL expires (UTC)
    """

    upload_url: str = Field(
        ..., description="Presigned S3 URL for video upload (PUT request)"
    )
    s3_path: str = Field(
        ...,
        description="S3 object key where video will be stored",
        examples=["upload/550e8400-e29b-41d4-a716-446655440000.mp4"],
    )
    expires_in: int = Field(
        ..., description="Seconds until URL expires", gt=0, examples=[1800]
    )
    expires_at: str = Field(
        ...,
        description="ISO 8601 timestamp when URL expires (UTC)",
        examples=["2025-10-04T12:30:00Z"],
    )

    @classmethod
    def create(
        cls, upload_url: str, s3_path: str, expires_in: int
    ) -> "UploadURLResponse":
        """Factory method to create response with calculated expiration.

        Args:
            upload_url: The presigned S3 URL
            s3_path: The S3 object key
            expires_in: Expiration time in seconds

        Returns:
            UploadURLResponse instance with calculated expiration timestamp
        """
        expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        return cls(
            upload_url=upload_url,
            s3_path=s3_path,
            expires_in=expires_in,
            expires_at=expires_at.isoformat() + "Z",
        )
