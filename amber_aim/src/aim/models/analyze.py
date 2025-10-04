"""Analyze request and response models."""

from typing import Literal

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    """Request model for analyzing a video with TwelveLabs.

    Attributes:
        video_path: Public URL of the video to analyze
        type: Type of video - either "creator" or "ad"
    """

    video_path: str | None = Field(
        None,
        description="Path to the video to analyze",
        examples=["/path/to/video.mp4"],
    )
    video_id: str | None = Field(
        None,
        description="ID of the video to analyze",
    )
    type: Literal["creator", "ad"] = Field(
        ...,
        description="Type of video to analyze",
        examples=["creator", "ad"],
    )


class AnalyzeResponse(BaseModel):
    """Response model containing TwelveLabs task information.

    Attributes:
        id: The unique identifier of the video indexing task
        video_id: The unique identifier of the video in TwelveLabs
    """

    id: str | None = Field(
        None,
        description="The unique identifier of the video indexing task",
        examples=["550e8400-e29b-41d4-a716-446655440000"],
    )
    video_id: str | None = Field(
        None,
        description="The unique identifier of the video",
        examples=["660e8400-e29b-41d4-a716-446655440001"],
    )
