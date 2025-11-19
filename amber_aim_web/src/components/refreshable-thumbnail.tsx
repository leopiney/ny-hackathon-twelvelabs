"use client";

import { useState, useEffect } from "react";
import { refreshThumbnail } from "@/lib/api";

export function useFreshThumbnail(initialUrl: string | undefined | null, videoId: string | undefined | null) {
  const [url, setUrl] = useState<string | undefined>(initialUrl || undefined);
  const [error, setError] = useState(false);

  useEffect(() => {
    setUrl(initialUrl || undefined);
    setError(false);
  }, [initialUrl]);

  const handleRefresh = async () => {
    if (!initialUrl || !videoId || error) return;
    
    try {
      const freshUrl = await refreshThumbnail(videoId, initialUrl);
      if (freshUrl) {
        setUrl(freshUrl);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Failed to refresh thumbnail:", err);
      setError(true);
    }
  };

  return { url, handleRefresh, error };
}

interface RefreshableThumbnailProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  videoId: string;
  initialUrl: string;
}

export function RefreshableThumbnail({ 
  videoId, 
  initialUrl, 
  alt, 
  className,
  ...props 
}: RefreshableThumbnailProps) {
  const { url, handleRefresh } = useFreshThumbnail(initialUrl, videoId);

  return (
    <img 
      src={url} 
      alt={alt || "Thumbnail"} 
      className={className} 
      onError={handleRefresh}
      {...props}
    />
  );
}
