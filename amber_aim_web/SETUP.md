# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment

You need to set the API URL for the backend. The frontend will use this to make requests to the Amber AIM backend.

**Option 1: Create .env.local file**

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

**Option 2: Use different backend URL**

If your backend is running on a different host/port:

```bash
echo "NEXT_PUBLIC_API_URL=https://your-backend-url.com" > .env.local
```

## 3. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## 4. Start the Backend

Make sure the Amber AIM backend is running. From the `amber_aim` directory:

```bash
# Activate virtual environment (if using one)
source venv/bin/activate

# Or with uv
uv run python -m aim

# The backend should be running on http://localhost:8000
```

## 5. Access the Application

Open http://localhost:3000 in your browser. You should see:

- Dashboard with indexes and videos
- Upload button to add new videos
- Video cards that link to detail pages

## Troubleshooting

### "Failed to fetch indexes" error

**Problem**: The frontend can't connect to the backend.

**Solution**:

- Check that the backend is running on the correct port
- Verify the `NEXT_PUBLIC_API_URL` in your `.env.local` file
- Check browser console for CORS errors

### "No indexes found"

**Problem**: The backend has no indexes configured.

**Solution**:

- Check your backend TwelveLabs configuration
- Ensure you have created indexes in TwelveLabs
- Verify your TwelveLabs API key is correct

### Upload fails

**Problem**: Video upload fails after selecting file.

**Solution**:

- Check AWS S3 credentials in backend
- Verify S3 bucket permissions
- Check browser console for error details

### Video player shows "Processing video..."

**Problem**: Video hasn't finished indexing yet.

**Solution**:

- Wait for TwelveLabs to finish processing the video
- Check the backend logs for indexing status
- Refresh the page after a few minutes

## Features to Test

1. **Dashboard Navigation**

   - View all indexes and their videos
   - Click on any video card to view details

2. **Video Upload**

   - Click "Upload Video" button
   - Select a video file
   - Choose type (Creator or Ad)
   - Upload and wait for processing

3. **Video Details**
   - View video player with HLS stream
   - See metadata (duration, dates, etc.)
   - View suggested ad placements (after analysis completes)

## Production Build

To build for production:

```bash
npm run build
npm start
```

The production server will run on http://localhost:3000 by default.

## Environment Variables

| Variable              | Description     | Default                 |
| --------------------- | --------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

**Note**: The `NEXT_PUBLIC_` prefix is required for client-side environment variables in Next.js.
