# Ads Suggestion API

## Overview

The `/suggest` endpoint provides AI-powered ad suggestions for videos based on their placement analysis.

## Endpoint

### POST /suggest

Suggests relevant ads for a video based on its placement analysis.

**Request Body:**

```json
{
  "video_id": "68e1899a830688fe0b91e228"
}
```

**Response:**

```json
{
  "video_id": "68e1899a830688fe0b91e228",
  "suggested_ads": [
    {
      "id": "ad_video_id_1",
      "clips": [
        {
          "score": 95.5,
          "start": 0.0,
          "end": 30.0,
          "video_id": "ad_video_id_1",
          "confidence": "high",
          "thumbnail_url": "https://...",
          "transcription": "..."
        }
      ]
    }
  ],
  "placement_count": 3
}
```

## How It Works

1. **Load Placement Analysis**: The endpoint loads the placement analysis from `video_{video_id}_placement.json`
2. **Extract Keywords**: Extracts themes, keywords, artistic style, and tone from the placement analysis
3. **Generate Queries**: Creates multiple search queries combining:
   - Video themes
   - Ad keywords from placement points
   - Artistic style and emotional tone
4. **Search Ads**: Uses TwelveLabs search API to find matching ads
5. **Rank Results**: Deduplicates and ranks results by relevance score

## Search Strategy

The agent generates diverse search queries:

- Combined main themes (top 3)
- Unique ad keywords from placement points (top 5)
- Artistic style + emotional tone

Results are deduplicated by video ID and sorted by average clip score.

## Requirements

- Placement analysis file must exist: `video_{video_id}_placement.json`
- TwelveLabs ads index must be configured
- Ads must be indexed in TwelveLabs

## Example Usage

```bash
curl -X POST http://localhost:8000/suggest \
  -H "Content-Type: application/json" \
  -d '{"video_id": "68e1899a830688fe0b91e228"}'
```

## Error Responses

- **404**: Placement analysis not found for the video
- **500**: TwelveLabs service error or internal error
