"""Ads search request and response models."""

from pydantic import BaseModel

from aim.models.placement import Placement


class AdClip(BaseModel):
    """Model for individual ad clip from search results."""

    score: float
    start: float
    end: float
    video_id: str
    confidence: str
    thumbnail_url: str | None = None
    transcription: str | None = None


class AdSearchResult(BaseModel):
    """Model for a single ad search result (video with clips)."""

    id: str  # Video ID
    clips: list[AdClip]

    @property
    def average_score(self) -> float:
        """Calculate average score across all clips."""
        if not self.clips:
            return 0.0
        return sum(clip.score for clip in self.clips) / len(self.clips)


class AdSearchResponse(BaseModel):
    """Response model for ad search containing multiple results."""

    results: list[AdSearchResult]
    query: str


class SuggestAdsRequest(BaseModel):
    """Request model for suggesting ads for a video."""

    video_id: str


class SuggestAdsResponse(BaseModel):
    """Response model for suggested ads."""

    video_id: str
    suggested_ads: list[AdSearchResult]
    placement_count: int
    placements: list[Placement] | None = None
