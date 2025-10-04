# Component Documentation

This document provides an overview of the custom components built for the Amber AIM web application.

## Layout Components

### `upload-dialog.tsx`

A modal dialog component for uploading videos to the platform.

**Features:**

- File picker with video type validation
- Video type selection (Creator/Ad)
- Direct S3 upload using presigned URLs
- Progress indicators during upload process
- Automatic video analysis triggering
- Success/error state handling

**Usage:**

```tsx
<UploadDialog onUploadComplete={() => router.refresh()} />
```

## Video Detail Components

### `video-timeline.tsx`

An interactive timeline visualization showing video segments and ad break markers.

**Features:**

- Visual representation of video duration
- Color-coded timeline segments (Intro, Main Content, Outro)
- Red markers indicating ad break positions
- Time labels for easy reference
- Responsive design with gradient styling

**Props:**

```typescript
interface VideoTimelineProps {
  duration: number; // Total video duration in seconds
  suggestedAds: SuggestedAd[]; // Array of ad placement suggestions
}
```

**Usage:**

```tsx
<VideoTimeline
  duration={videoDuration}
  suggestedAds={suggestedAds.suggested_ads}
/>
```

### `ad-placement-card.tsx`

A detailed card component displaying AI-recommended ad placements.

**Features:**

- Gradient thumbnail preview (rotates through 4 color schemes)
- Ad metadata display (name, ID, relevance score)
- Placement timestamp badge
- "Why this ad?" reasoning section with info icon
- Matching trends extracted from reasoning
- Video content and ad category tags
- Duration and placement type information
- Responsive two-column layout (thumbnail + details)

**Props:**

```typescript
interface AdPlacementCardProps {
  ad: SuggestedAd; // Ad suggestion data from backend
  index: number; // Card index for gradient rotation
}
```

**Usage:**

```tsx
{
  suggestedAds.suggested_ads.map((ad, index) => (
    <AdPlacementCard key={index} ad={ad} index={index} />
  ));
}
```

## UI Components (shadcn/ui)

### `button.tsx`

Reusable button component with variants.

**Variants:**

- `default`: Primary blue button
- `destructive`: Red button for dangerous actions
- `outline`: Outlined button
- `secondary`: Light blue secondary button
- `ghost`: Transparent button with hover effect
- `link`: Link-styled button

**Sizes:**

- `default`: Standard height (h-10)
- `sm`: Small (h-9)
- `lg`: Large (h-11)
- `icon`: Square icon button (h-10 w-10)

### `card.tsx`

Container component for content sections.

**Sub-components:**

- `Card`: Main container
- `CardHeader`: Header section
- `CardTitle`: Title text
- `CardDescription`: Subtitle/description text
- `CardContent`: Main content area
- `CardFooter`: Footer section

### `badge.tsx`

Small label component for tags and status indicators.

**Variants:**

- `default`: Blue badge
- `secondary`: Light blue badge
- `destructive`: Red badge
- `outline`: Outlined badge

### `dialog.tsx`

Modal dialog component built on Radix UI.

**Sub-components:**

- `Dialog`: Root component
- `DialogTrigger`: Button to open dialog
- `DialogContent`: Modal content container
- `DialogHeader`: Header section
- `DialogTitle`: Dialog title
- `DialogDescription`: Dialog description
- `DialogFooter`: Footer with action buttons

### `spinner.tsx`

Loading indicator components.

**Components:**

- `Spinner`: Animated loading spinner
- `LoadingScreen`: Full-screen loading state with optional message

**Sizes:**

- `sm`: Small (h-4 w-4)
- `md`: Medium (h-8 w-8)
- `lg`: Large (h-12 w-12)

## Design System

### Color Scheme

The application uses a blue-toned color palette:

**Primary Colors:**

- Blue 600 (#2563eb): Main actions and primary elements
- Blue 500 (#3b82f6): Hover states and accents
- Blue 50/100: Light backgrounds and highlights

**Accent Colors:**

- Red 500: Ad break markers and warnings
- Green 600: Success states and high match scores
- Purple/Indigo: Tags and secondary accents

**Gradient Combinations:**

- `from-blue-50 to-white`: Page backgrounds
- `from-blue-400 to-blue-600`: Timeline bars
- `from-red-100 to-red-200`: Ad card thumbnails (rotates)

### Typography

- **Headings**: Bold, large sizes with proper hierarchy
- **Body Text**: Regular weight with good line height
- **Monospace**: Used for IDs and technical data
- **Small Text**: 0.75rem (12px) for metadata and labels

### Spacing

- **Component Padding**: p-4 to p-6 (1rem to 1.5rem)
- **Section Gaps**: gap-4 to gap-8 (1rem to 2rem)
- **Card Spacing**: Consistent internal spacing with pt-0 for CardContent

### Responsive Design

All components are built mobile-first with responsive breakpoints:

- `sm`: 640px and up
- `md`: 768px and up
- `lg`: 1024px and up
- `xl`: 1280px and up

## Best Practices

1. **Server Components by Default**: Use React Server Components for data fetching
2. **Client Components When Needed**: Add `"use client"` only for interactive components
3. **Type Safety**: All components have proper TypeScript types
4. **Accessibility**: Components use semantic HTML and proper ARIA labels
5. **Dark Mode**: All components support dark mode with `dark:` variants
6. **Loading States**: Show appropriate loading indicators during async operations
7. **Error Handling**: Gracefully handle missing data and API errors

## Future Enhancements

Potential improvements for components:

- **Video Timeline**: Add click-to-seek functionality
- **Ad Cards**: Add preview video playback on hover
- **Upload Dialog**: Add drag-and-drop support
- **Timeline**: Show actual video thumbnails in segments
- **Ad Cards**: Fetch and display real ad thumbnails
- **Timeline**: Add zoom/pan controls for long videos
