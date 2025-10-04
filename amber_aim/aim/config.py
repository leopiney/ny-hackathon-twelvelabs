"""Application configuration management."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    All settings are prefixed with APP_ in environment variables.
    Example: APP_AWS_S3_BUCKET=my-bucket

    Attributes:
        aws_s3_bucket: S3 bucket name for video uploads (required)
        aws_region: AWS region for S3 bucket (default: us-east-1)
        upload_url_expiration: URL expiration time in seconds (default: 1800)
        s3_base_path: Base path prefix in S3 (default: upload)
        log_level: Logging level (default: INFO)
    """

    aws_s3_bucket: str
    aws_region: str = "us-east-1"
    upload_url_expiration: int = 1800
    s3_base_path: str = "upload"
    log_level: str = "INFO"

    class Config:
        """Pydantic settings configuration."""

        env_file = ".env"
        env_prefix = "APP_"
