"""Analyze request and response models."""

from typing import Literal

from pydantic import BaseModel


class Placement(BaseModel):
    timestamp: int
    reason: str
    situation_description: str
    themes: list[str]
    ad_keywords: list[str]


class Narration(BaseModel):
    timestamp: int
    narration: str
    situation_description: str
    themes: list[str]
    narrative_trope: (
        Literal[
            "narrative_hook",
            "setup",
            "inciting_incident",
            "rising_action",
            "midpoint",
            "climax",
            "resolution",
            "denouement",
            "flashback",
            "flashforward",
        ]
        | None
    ) = None
    act: Literal["act_1_setup", "act_2_confrontation", "act_3_resolution"] | None = None
    emotional_arc: (
        Literal["positive", "negative", "neutral", "turning_point"] | None
    ) = None
    hero_journey_stage: (
        Literal[
            "ordinary_world",
            "call_to_adventure",
            "refusal",
            "meeting_mentor",
            "crossing_threshold",
            "tests_allies_enemies",
            "approach",
            "ordeal",
            "reward",
            "road_back",
            "resurrection",
            "return_with_elixir",
        ]
        | None
    ) = None


class Character(BaseModel):
    name: str
    arc: str


class PlacementResult(BaseModel):
    """Result model for placing ads in a video."""

    summary: str
    tags: list[str]
    themes: list[str]
    artistic_style: str
    general_color_tone: str
    obstacles: list[str]
    emotional_parts: list[str]
    segment_labels: list[str]
    tone_classification: list[str]
    characeters: list[Character]

    natural_breakpoints: list[str]
    narrative_structure: list[Narration]
    placements: list[Placement]
