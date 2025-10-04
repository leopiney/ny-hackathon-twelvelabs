# Amber AIM Web

A modern video analytics dashboard built with Next.js 15, featuring AI-powered video analysis and ad placement suggestions powered by TwelveLabs.

## Features

- 🎥 **Video Dashboard**: Browse and manage video indexes and content
- ⬆️ **Direct Upload**: Upload videos directly to S3 with presigned URLs
- 🤖 **AI Analysis**: Automatic video analysis and indexing with TwelveLabs
- 💡 **Ad Suggestions**: AI-powered ad placement recommendations
- 🎨 **Modern UI**: Beautiful blue-themed interface with shadcn/ui components
- ⚡ **Fast Performance**: Built with Next.js 15 and React Server Components

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 with custom blue theme
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Linting**: Biome

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Running instance of the Amber AIM backend API (default: http://localhost:8000)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file:

```bash
# Copy the example file
cp .env.local.example .env.local
```

3. Configure your environment variables in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

```
src/
├── actions/           # Server actions for data fetching
│   └── video.ts      # Server-side data fetching functions
├── app/              # Next.js App Router pages
│   ├── video/        # Video details pages
│   │   └── [indexId]/[videoId]/
│   │       ├── page.tsx      # Enhanced video details page
│   │       └── loading.tsx   # Loading state
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Dashboard page
│   ├── loading.tsx   # Dashboard loading state
│   └── globals.css   # Global styles with blue theme
├── components/       # React components
│   ├── ui/           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   └── spinner.tsx
│   ├── upload-dialog.tsx      # Video upload modal
│   ├── video-timeline.tsx     # Interactive video timeline
│   └── ad-placement-card.tsx  # Ad placement recommendation card
└── lib/              # Utilities and API client
    ├── api.ts        # API client functions
    ├── types.ts      # TypeScript types
    └── utils.ts      # Utility functions
```

## Key Features

### Dashboard

The dashboard displays all video indexes and their associated videos:

- **Stats Overview**: View total indexes, videos, and active indexes
- **Video Grid**: Browse videos with thumbnails and metadata
- **Upload Button**: Quick access to upload new videos

### Video Upload

The upload dialog handles the complete upload workflow:

1. Select a video file and type (creator content or advertisement)
2. Generate a presigned S3 URL from the backend
3. Upload the file directly to S3 (bypassing the backend)
4. Trigger TwelveLabs analysis automatically

### Video Details

Each video has a dedicated details page showing:

- **Video Player**: HLS video player with controls and thumbnail poster
- **Metadata**: Duration, creation date, indexing status in a clean card layout
- **Interactive Timeline**: Visual timeline showing video content with ad break markers
- **AI-Powered Ad Placements**: Beautiful cards displaying:
  - Ad preview with gradient thumbnails
  - Relevance score and placement timestamp
  - "Why this ad?" reasoning section
  - Matching trends and keywords
  - Video content and ad category tags
  - Duration and placement type badges

## API Integration

The frontend communicates with the Amber AIM backend via:

- `GET /12/index` - List all indexes
- `GET /12/index/{index_id}/video` - List videos in an index
- `GET /12/index/{index_id}/video/{video_id}` - Get video details
- `POST /upload` - Generate S3 presigned upload URL
- `POST /analyze` - Create video analysis task
- `POST /suggest` - Get ad placement suggestions

## Styling

The application uses a custom blue color theme:

- **Primary**: Blue tones (#2563eb, #3b82f6)
- **Accents**: Light blue gradients
- **Dark Mode**: Automatic dark mode support
- **Components**: Consistent styling with shadcn/ui

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome

## License

MIT
