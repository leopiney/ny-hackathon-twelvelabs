# Frontend-Backend Integration Guide

## Overview

The frontend is now fully integrated with the backend API workflow. This document explains the complete integration architecture.

## Architecture Flow

```
User Upload → S3 Upload → TwelveLabs Analysis → AI Agent Placement → Ad Matching → Display Results
```

### 1. **Video Upload** (`POST /api/upload`)
- User selects video file
- Frontend requests presigned S3 URL from backend
- Video uploads directly to S3
- S3 path stored for analysis

### 2. **Video Analysis** (`POST /api/analyze`)
- Frontend sends S3 path to backend
- Backend creates TwelveLabs indexing task
- Returns `task_id` and `video_id`
- **Background processing starts** (analysis runs async)

### 3. **Background Processing** (Backend Only)
- TwelveLabs analyzes video content
- Multiple prompts analyze different aspects
- OpenAI agent extracts structured placement data
- Results saved to `video_{video_id}_placement.json`

### 4. **Ad Suggestions** (`POST /api/suggest`)
- Frontend requests suggestions using `video_id`
- Backend loads placement result file
- AI agent searches ads index for matching content
- Returns suggested ads with placement metadata

### 5. **Display Results**
- Frontend transforms backend data to UI format
- Timeline component shows ad breakpoints
- Displays match scores, rationale, and metadata

## API Endpoints

### Upload API Route
**File:** `src/app/api/upload/route.ts`
- Proxies to `POST http://localhost:8000/upload`
- Request: `{ filename: string }`
- Response: `{ upload_url, s3_path, expires_in, expires_at }`

### Analyze API Route
**File:** `src/app/api/analyze/route.ts`
- Proxies to `POST http://localhost:8000/analyze`
- Request: `{ video_path: string, type: "creator" | "ad" }`
- Response: `{ id: string, video_id: string }`

### Suggest API Route
**File:** `src/app/api/suggest/route.ts`
- Proxies to `POST http://localhost:8000/suggest`
- Request: `{ video_id: string }`
- Response: `{ video_id, suggested_ads[], placement_count }`

## Data Transformation

### Backend Ad Search Result
```typescript
{
  id: string,              // Video ID
  clips: [{
    score: number,
    start: number,
    end: number,
    video_id: string,
    confidence: string,
    thumbnail_url?: string,
    transcription?: string
  }]
}
```

### Frontend Breakpoint Format
```typescript
{
  id: string,
  timestamp: number,       // Extracted from top clip
  label: string,
  recommendedAd: {
    title: string,         // Constructed from ad ID
    brand: string,
    duration: number,      // Calculated from clip
    thumbnailUrl?: string, // From clip
    matchScore: number,    // Average of clip scores
    rationale: string,     // From transcription
    matchingTerms: string[],
    videoTags: string[],
    adTags: string[]
  }
}
```

## Configuration

### Backend (.env in amber_aim/)
```bash
APP_AWS_S3_BUCKET=your-bucket-name
APP_AWS_REGION=us-east-1
APP_UPLOAD_URL_EXPIRATION=1800
APP_S3_BASE_PATH=upload
APP_TWELVE_LABS_API_KEY=your-api-key
APP_TWELVE_LABS_CREATORS_INDEX_ID=your-creators-index
APP_TWELVE_LABS_ADS_INDEX_ID=your-ads-index
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Frontend (.env.local in amber_aim_web/)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Components

### Main Page (`src/app/page.tsx`)
- Handles upload workflow
- Manages analysis state
- Displays status updates
- Shows Timeline with results

### Timeline Component (`components/Timeline.tsx`)
- Visualizes video segments
- Shows ad breakpoints with markers
- Displays recommendation cards with:
  - Match scores
  - Rationale explanations
  - Matching terms and tags
  - Video context

### Video Utilities (`utils/videoThumbnails.ts`)
- Extracts thumbnails from video
- Uses HTML5 canvas API
- Requires CORS configuration on S3

## Timing & Background Processing

The current implementation uses a **30-second timeout** between analysis start and fetching suggestions. This is a simplified approach for demo purposes.

### Production Improvements Needed:

1. **Polling Mechanism**
   - Poll backend for task status
   - Check when analysis is complete
   - Fetch suggestions only when ready

2. **WebSocket Integration**
   - Real-time updates on analysis progress
   - Immediate notification when complete

3. **Status Endpoint**
   - Add `GET /status/{video_id}` endpoint
   - Return analysis completion status

## Known Limitations

1. **Fixed Timeout**: Uses 30-second delay before fetching suggestions
   - May be too short for long videos
   - May be too long for short videos

2. **No Progress Updates**: User sees "Processing..." without granular status

3. **Manual Retry**: If analysis takes longer, user must manually retry

4. **S3 CORS Required**: Video thumbnails need S3 CORS enabled

## Testing Checklist

- [ ] Backend running on port 8000
- [ ] S3 bucket configured with proper permissions
- [ ] S3 bucket has CORS enabled for video access
- [ ] TwelveLabs API key configured
- [ ] Indexes created (creators and ads)
- [ ] Frontend running on port 3000
- [ ] .env.local configured with backend URL
- [ ] Test video upload
- [ ] Verify analysis starts
- [ ] Wait for background processing
- [ ] Check ad suggestions display

## Troubleshooting

### "Failed to get upload URL"
- Check backend is running on port 8000
- Verify AWS credentials in backend .env

### "Failed to analyze video"
- Ensure TwelveLabs API key is valid
- Check index IDs are correct
- Verify S3 path is accessible

### "PLACEMENT_NOT_FOUND" Error
- Analysis still processing - wait longer
- Use "Retry Fetch Suggestions" button
- Check backend logs for analysis errors

### CORS Errors on Video
- Add S3 bucket domain to `next.config.ts`
- Enable CORS on S3 bucket
- Ensure video URL is accessible

### Timeline Not Showing
- Verify breakpoints are populated
- Check browser console for errors
- Ensure Timeline component is imported correctly

## File Structure

```
amber_aim_web/
├── src/
│   └── app/
│       ├── page.tsx                    # Main UI with upload & workflow
│       ├── layout.tsx                  # Root layout
│       └── api/
│           ├── upload/route.ts         # Upload API proxy
│           ├── analyze/route.ts        # Analysis API proxy
│           └── suggest/route.ts        # Suggestions API proxy
├── components/
│   └── Timeline.tsx                    # Timeline visualization
├── utils/
│   └── videoThumbnails.ts             # Thumbnail extraction
├── next.config.ts                     # Next.js config with S3 domains
├── .env.local.example                 # Environment template
└── INTEGRATION.md                     # This file
```

## Next Steps

To improve the integration:

1. Add status polling endpoint
2. Implement real-time progress updates
3. Add error recovery mechanisms
4. Enhance data mapping (extract themes, keywords from placement data)
5. Add video duration detection
6. Generate actual video segment clips for timeline
