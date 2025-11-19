import type {
  IndexSchema,
  VideoVector,
  AnalyzeRequest,
  AnalyzeResponse,
  SuggestAdsRequest,
  SuggestAdsResponse,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Indexes API
export async function getIndexes(): Promise<IndexSchema[]> {
  const response = await fetch(`${API_BASE_URL}/12/index`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch indexes");
  }

  return response.json();
}

// Videos API
export async function getIndexVideos(indexId: string): Promise<VideoVector[]> {
  const response = await fetch(`${API_BASE_URL}/12/index/${indexId}/video`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch videos for index ${indexId}`);
  }

  return response.json();
}

// Video API
export async function getVideo(
  indexId: string,
  videoId: string
): Promise<VideoVector> {
  const response = await fetch(
    `${API_BASE_URL}/12/index/${indexId}/video/${videoId}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch video ${videoId}`);
  }

  const video = await response.json();
  return video;
}

// Analyze API
export async function analyzeVideo(
  request: AnalyzeRequest
): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze video");
  }

  return response.json();
}

// Suggest Ads API
export async function suggestAds(
  request: SuggestAdsRequest
): Promise<SuggestAdsResponse> {
  const response = await fetch(`${API_BASE_URL}/suggest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to suggest ads");
  }

  return response.json();
}

// Thumbnail API
export async function refreshThumbnail(
  videoId: string,
  thumbnailUrl: string
): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/thumbnail/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ video_id: videoId, thumbnail_url: thumbnailUrl }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.thumbnail_url;
  } catch (error) {
    console.error("Error refreshing thumbnail:", error);
    return null;
  }
}
