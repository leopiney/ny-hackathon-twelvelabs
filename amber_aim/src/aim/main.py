"""FastAPI application for video upload URL generation."""

import logging
from datetime import datetime, timezone
from typing import Literal, Any

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from twelvelabs import IndexSchema, VideoVector

from aim.config import Settings
from aim.logging_config import setup_logging
from aim.models.ads import SuggestAdsRequest, SuggestAdsResponse
from aim.models.analyze import AnalyzeRequest, AnalyzeResponse
from aim.models.placement import PlacementResult
from aim.models.upload import UploadURLRequest, UploadURLResponse
from aim.services.agent import find_best_ads
from aim.services.s3_service import S3Service, S3ServiceError
from aim.services.twelve_labs_service import (
    TwelveLabsService,
    TwelveLabsServiceError,
)

# Load settings and setup logging
settings = Settings()
setup_logging(settings.log_level)

logger = logging.getLogger(__name__)

# Initialize FastAPI application
app = FastAPI(
    title="Video Upload URL Generation API",
    description="Generate presigned S3 URLs for direct video uploads and analyze videos with TwelveLabs",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize S3 service
s3_service = S3Service(
    bucket_name=settings.aws_s3_bucket,
    region=settings.aws_region,
    base_path=settings.s3_base_path,
)

# Initialize TwelveLabs service
twelve_labs_service = TwelveLabsService(
    api_key=settings.twelve_labs_api_key,
    creators_index_id=settings.twelve_labs_creators_index_id,
    ads_index_id=settings.twelve_labs_ads_index_id,
    s3_service=s3_service,
)


@app.get("/health")
def health_check() -> dict[str, str]:
    """Health check endpoint.

    Returns:
        Health status and current timestamp
    """
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


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


def start_analyze_video_task(
    index_id: str, video_id: str, type: Literal["creator", "ad"]
) -> None:
    """Uses FastAPI background tasks to analyze a video using TwelveLabs.

    Args:
        index_id: Index ID for the video
        video_id: ID of the video
        video_path: Path to the video
        type: Type of video (creator or ad)
    """
    twelve_labs_service.analyze_video(index_id, video_id, type)


@app.post("/analyze")
def analyze_video(
    request: AnalyzeRequest, background_tasks: BackgroundTasks
) -> dict[str, Any]:
    """Analyze a video using TwelveLabs.

    Creates a video indexing task in TwelveLabs based on the video type.
    Videos are routed to different indexes based on whether they are
    creator content or advertisements.

    Args:
        request: Analyze request with video URL and type

    Raises:
        HTTPException: 400 for invalid video type, 500 for TwelveLabs errors
    """
    try:
        if request.video_path is not None:
            # Create video indexing task in TwelveLabs
            task_result = twelve_labs_service.create_video_indexing_task(
                video_path=str(request.video_path), video_type=request.type
            )

            # Create response from task result
            response = AnalyzeResponse(
                id=task_result["id"], video_id=task_result["video_id"]
            )

            logger.info(
                "Video analysis task created successfully",
                extra={
                    "task_id": task_result["id"],
                    "video_id": task_result["video_id"],
                    "video_type": request.type,
                },
            )
            video_id = task_result["video_id"]
        elif request.video_id is not None:
            video_id = request.video_id
        else:
            raise HTTPException(
                status_code=400,
                detail={
                    "detail": "Either video_path or video_id must be provided",
                    "error_code": "INVALID_REQUEST",
                },
            )

        background_tasks.add_task(
            start_analyze_video_task,
            index_id=settings.twelve_labs_creators_index_id,
            video_id=video_id,
            type=request.type,
        )

        return {"video_id": video_id}

    except TwelveLabsServiceError as e:
        if e.error_code == "INVALID_VIDEO_TYPE":
            logger.warning("Invalid video type", extra={"video_type": request.type})
            raise HTTPException(
                status_code=400, detail={"detail": str(e), "error_code": e.error_code}
            ) from e
        else:
            logger.error("TwelveLabs service error", exc_info=True)
            raise HTTPException(
                status_code=500, detail={"detail": str(e), "error_code": e.error_code}
            ) from e

    except Exception as e:
        logger.error("Unexpected error in analyze endpoint", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "detail": "Internal server error",
                "error_code": "INTERNAL_ERROR",
            },
        ) from e


@app.post("/suggest", response_model=SuggestAdsResponse)
async def suggest_ads(request: SuggestAdsRequest) -> SuggestAdsResponse:
    """Suggest relevant ads for a video based on its placement analysis.

    Loads the placement result for a video and uses an AI agent to search
    for relevant ads from the ads index. The agent analyzes the video's
    themes, keywords, and emotional content to find matching advertisements.

    Args:
        request: Request containing the video_id

    Returns:
        SuggestAdsResponse with suggested ads and placement information

    Raises:
        HTTPException: 404 if placement file not found, 500 for other errors
    """
    try:
        # Load placement result from local file
        placement_file = f"results/placement_{request.video_id}.json"
        logger.info(
            "Loading placement result",
            extra={"video_id": request.video_id, "file": placement_file},
        )

        placement_result_json = s3_service.download_json_file(placement_file)
        if placement_result_json is None:
            logger.warning(
                "Placement file not found",
                extra={"video_id": request.video_id, "file": placement_file},
            )
            return SuggestAdsResponse(
                video_id=request.video_id,
                suggested_ads=[],
                placement_count=0,
            )

        placement_result = PlacementResult.model_validate(placement_result_json)

        logger.info(
            "Placement result loaded",
            extra={
                "video_id": request.video_id,
                "placement_count": len(placement_result.placements),
            },
        )

        # Use the ads agent to find relevant ads
        logger.info(
            "Running ads agent",
            extra={"video_id": request.video_id},
        )

        ads_response = await find_best_ads(
            request.video_id,
            s3_service,
            placement_result,
            twelve_labs_service.search_ads,
        )

        # Create response
        response = SuggestAdsResponse(
            video_id=request.video_id,
            suggested_ads=ads_response.results,
            placement_count=len(placement_result.placements),
            placements=placement_result.placements,
        )

        logger.info(
            "Ads suggestion completed",
            extra={
                "video_id": request.video_id,
                "suggested_ads_count": len(response.suggested_ads),
            },
        )

        return response

    except HTTPException:
        raise

    except TwelveLabsServiceError as e:
        logger.error("TwelveLabs service error in suggest endpoint", exc_info=True)
        raise HTTPException(
            status_code=500, detail={"detail": str(e), "error_code": e.error_code}
        ) from e

    except Exception as e:
        logger.error("Unexpected error in suggest endpoint", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "detail": "Internal server error",
                "error_code": "INTERNAL_ERROR",
            },
        ) from e


@app.get("/12/index")
def get_indexes() -> list[IndexSchema]:
    """Get a video from S3.

    Args:
        video_id: ID of the video
    """
    return [index for index in twelve_labs_service.client.indexes.list()]


@app.get("/12/index/{index_id}/video")
def get_index_videos(index_id: str) -> list[VideoVector]:
    """Get a video from S3.

    Args:
        index_id: ID of the index
    """
    return [
        video
        for video in twelve_labs_service.client.indexes.videos.list(index_id=index_id)
    ]


@app.get("/12/index/{index_id}/video/{video_id}")
def get_index_video(index_id: str, video_id: str) -> VideoVector:
    """Get a video from S3.

    Args:
        index_id: ID of the index
    """
    video = [
        video
        for video in twelve_labs_service.client.indexes.videos.list(index_id=index_id)
        if video.id == video_id
    ][0]

    return video
