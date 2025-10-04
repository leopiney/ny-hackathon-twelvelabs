# Quick Start Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Start Development Server

```bash
npm run dev
```

## 3. Open Browser

Navigate to: http://localhost:3000

## 4. Ensure Backend is Running

The backend must be running on http://localhost:8000

You can test this by visiting: http://localhost:8000/health

## 5. Upload a Video

1. Click "Upload Video" button
2. Select a creator video
3. Wait for upload
4. Analysis will start automatically
5. After ~30 seconds, ad suggestions will appear

## Environment Variables

Already configured in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Troubleshooting

**Frontend won't start**
- Run `npm install` first
- Check Node.js version (need 18+)

**Upload fails**
- Ensure backend is running
- Check http://localhost:8000/health

**Analysis fails**
- Verify TwelveLabs API key in backend
- Check backend logs

**No suggestions**
- Wait longer (analysis may take 1-2 minutes)
- Click "Retry Fetch Suggestions" button
- Check backend for errors

## Full Documentation

See README_MAIN.md for complete documentation.
