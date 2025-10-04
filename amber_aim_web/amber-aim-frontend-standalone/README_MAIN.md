# Amber AIM Frontend - Standalone Package

AI-Powered Video Ad Insertion Platform Frontend - Fully integrated with FastAPI backend.

## 🎯 What This Is

This is a **complete, production-ready Next.js frontend** that integrates with the Amber AIM FastAPI backend for AI-powered video ad placement analysis.

## ✨ Features

- 🎥 **Video Upload**: Direct S3 upload via presigned URLs
- 🤖 **TwelveLabs Integration**: Automatic video content analysis
- 🎯 **AI Ad Matching**: Intelligent ad placement recommendations
- ⏱️ **Interactive Timeline**: Visual representation of ad breakpoints
- 📊 **Match Scores**: AI-generated relevance scores and rationale
- 🎨 **Modern UI**: Gradient-based design with Tailwind CSS v4

## 📋 Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **Running Backend**: FastAPI backend must be running on `http://localhost:8000`

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
amber-aim-frontend-standalone/
├── src/
│   └── app/
│       ├── page.tsx                    # Main upload & workflow UI
│       ├── layout.tsx                  # Root layout
│       ├── globals.css                 # Global styles
│       └── api/
│           ├── upload/route.ts         # Upload API proxy
│           ├── analyze/route.ts        # Analysis API proxy
│           └── suggest/route.ts        # Suggestions API proxy
├── components/
│   └── Timeline.tsx                    # Timeline visualization component
├── utils/
│   └── videoThumbnails.ts             # Video thumbnail extraction
├── public/                             # Static assets
├── package.json                        # Dependencies
├── next.config.ts                     # Next.js config (S3 domains)
├── tsconfig.json                      # TypeScript config
├── .env.local.example                 # Environment template
├── INTEGRATION.md                     # Integration documentation
└── README_MAIN.md                     # This file
```

## 🔌 Backend Integration

This frontend expects the following backend endpoints:

### POST /upload
Get presigned S3 upload URL
- **Request**: `{ filename: string }`
- **Response**: `{ upload_url, s3_path, expires_in, expires_at }`

### POST /analyze
Start video analysis
- **Request**: `{ video_path: string, type: "creator" | "ad" }`
- **Response**: `{ id: string, video_id: string }`

### POST /suggest
Get ad suggestions
- **Request**: `{ video_id: string }`
- **Response**: `{ video_id, suggested_ads[], placement_count }`

### GET /health
Health check
- **Response**: `{ status: "healthy", timestamp }`

## 🎬 User Workflow

1. **Upload Video**
   - User selects video file
   - Frontend gets presigned S3 URL from backend
   - Video uploads directly to S3

2. **Analysis Starts**
   - Frontend calls `/analyze` with S3 path
   - Backend creates TwelveLabs indexing task
   - Returns `task_id` and `video_id`

3. **Background Processing**
   - TwelveLabs analyzes video content
   - AI agents extract placement data
   - Ad matching runs automatically

4. **Results Display**
   - Frontend fetches suggestions after 30 seconds
   - Timeline shows ad breakpoints
   - Match scores and rationale displayed

## 🛠️ Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run code linting
npm run format    # Format code with Biome
```

## ⚙️ Configuration

### Next.js Image Domains

Already configured in `next.config.ts`:
- `placehold.co` - Placeholder images
- `**.s3.amazonaws.com` - S3 bucket images
- `s3.amazonaws.com` - S3 general

**Note:** If using a custom S3 bucket domain, add it to `next.config.ts`:

```typescript
{
  protocol: 'https',
  hostname: 'your-bucket.s3.region.amazonaws.com',
}
```

### CORS Requirements

Your S3 bucket must have CORS enabled:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## 🎨 Components Overview

### Main Page (`src/app/page.tsx`)

The main application page handles:
- File upload UI
- API integration workflow
- State management
- Status updates
- Timeline display

**Key Features:**
- Upload progress tracking
- Analysis status monitoring
- Error handling with retry
- Data transformation from backend to UI format

### Timeline Component (`components/Timeline.tsx`)

Visual timeline showing:
- Video segments with thumbnails
- Ad breakpoint markers
- Recommendation cards with:
  - Match scores (percentage)
  - AI-generated rationale
  - Matching terms
  - Video/ad context tags

**Props:**
```typescript
interface TimelineProps {
  clips: VideoClip[];          // Video segments
  totalDuration: number;        // Total video length
  videoUrl?: string;            // Video URL for preview
  breakPoints?: BreakPoint[];   // Ad insertion points
}
```

### Video Utilities (`utils/videoThumbnails.ts`)

Utilities for extracting thumbnails from videos:
- Uses HTML5 Canvas API
- Extracts frames at specific timestamps
- Returns base64 data URLs

**Functions:**
- `extractThumbnailFromVideo(url, timestamp)` - Extract single frame
- `generateThumbnailsForClips(url, clips)` - Generate thumbnails for all clips

## 🔄 Data Flow

```
User Upload
    ↓
S3 Upload (presigned URL)
    ↓
Start Analysis (/analyze)
    ↓
Background: TwelveLabs → AI Agents → Placement Data
    ↓
Fetch Suggestions (/suggest)
    ↓
Transform Data → Display Timeline
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Backend running on `http://localhost:8000`
- [ ] S3 bucket configured with credentials
- [ ] TwelveLabs API key valid
- [ ] Frontend `.env.local` configured
- [ ] Upload a test video
- [ ] Verify upload progress
- [ ] Wait for analysis (30+ seconds)
- [ ] Check ad suggestions appear
- [ ] Verify timeline displays correctly
- [ ] Test retry button if needed

### Common Issues

**"Failed to get upload URL"**
- Backend not running on port 8000
- Check backend logs

**"Failed to analyze video"**
- TwelveLabs API key invalid
- Index IDs incorrect
- S3 path not accessible

**"PLACEMENT_NOT_FOUND"**
- Analysis still processing (wait longer)
- Click "Retry Fetch Suggestions"
- Check backend for analysis errors

**CORS Errors**
- Enable CORS on S3 bucket
- Add bucket domain to `next.config.ts`

## 📊 Tech Stack

- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS v4** - Styling
- **Biome 2.2.0** - Linting & formatting

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables in Production

Add to Vercel/hosting platform:
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

### Build for Production

```bash
npm run build
npm run start
```

## 📝 API Integration Details

See [INTEGRATION.md](INTEGRATION.md) for:
- Complete API documentation
- Data transformation logic
- Backend requirements
- Production improvements needed
- Troubleshooting guide

## 🔐 Security Notes

- API keys never exposed to frontend
- All backend calls proxied through Next.js API routes
- Presigned URLs have 30-minute expiration
- S3 direct upload (no server middleware)

## 🚧 Known Limitations

1. **Fixed 30-second timeout** before fetching suggestions
   - May be too short for long videos
   - May be too long for short videos

2. **No real-time progress** during analysis
   - User sees "Processing..." without updates

3. **Manual retry** required if analysis takes longer

4. **S3 CORS required** for video thumbnails

## 🔮 Future Improvements

- [ ] Add polling mechanism for task status
- [ ] WebSocket integration for real-time updates
- [ ] Progress bar during analysis
- [ ] Video duration auto-detection
- [ ] Enhanced data mapping (themes, keywords)
- [ ] Actual video segment generation
- [ ] Ad preview functionality
- [ ] Export placement timeline

## 📄 License

MIT

## 👥 Support

For integration issues, see [INTEGRATION.md](INTEGRATION.md)

For backend setup, refer to the backend repository documentation.

## 🎯 Backend Repository

This frontend requires the Amber AIM FastAPI backend.

**Backend Requirements:**
- Python 3.12+
- FastAPI
- AWS S3 bucket
- TwelveLabs API account
- OpenAI API key

Contact your backend team for setup instructions.

---

**Built for NY Hackathon with TwelveLabs** 🚀
