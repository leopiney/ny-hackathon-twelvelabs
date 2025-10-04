import type {
  IndexSchema,
  VideoVector,
  UploadURLRequest,
  UploadURLResponse,
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

// Upload API
export async function generateUploadUrl(
  request: UploadURLRequest
): Promise<UploadURLResponse> {
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to generate upload URL");
  }

  return response.json();
}

// Upload file to S3
export async function uploadToS3(
  presignedUrl: string,
  file: File
): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/*",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file to S3");
  }
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
