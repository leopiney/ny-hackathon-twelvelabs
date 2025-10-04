// API Types matching the backend
export interface IndexSchema {
  id: string;
  name: string;
  engines: Array<{
    engine_name: string;
    engine_options: string[];
  }>;
  video_count?: number;
  created_at?: string;
}

export interface VideoVector {
  id: string;
  metadata?: {
    filename?: string;
    duration?: number;
  };
  system_metadata?: {
    filename?: string;
    duration?: number;
    fps?: number;
    width?: number;
    height?: number;
    size?: number;
  };
  created_at?: string;
  updated_at?: string;
  indexed_at?: string | null;
  hls?: {
    video_url?: string;
    thumbnail_urls?: string[];
    status?: string;
    updated_at?: string;
  };
}

export interface UploadURLRequest {
  filename: string;
}

export interface UploadURLResponse {
  upload_url: string;
  s3_path: string;
  expires_at: string;
  expires_in: number;
}

export interface AnalyzeRequest {
  video_path?: string;
  video_id?: string;
  type: "creator" | "ad";
}

export interface AnalyzeResponse {
  id?: string;
  video_id: string;
}

export interface SuggestAdsRequest {
  video_id: string;
}

export interface AdClip {
  score: number;
  start: number;
  end: number;
  video_id: string;
  confidence: string;
  thumbnail_url: string;
  transcription: string | null;
}

export interface Placement {
  timestamp: number;
  reason: string;
  situation_description: string;
  themes: string[];
  ad_keywords: string[];
}

export interface SuggestedAd {
  // New API format
  id?: string;
  clips?: AdClip[];
  // Legacy format
  ad_video_id?: string;
  ad_name?: string;
  placement_id?: string;
  placement_timestamp?: number;
  relevance_score?: number;
  reasoning?: string;
  // Additional fields from transformation
  score?: number;
  adVideo?: VideoVector | null;
  // Placement information
  placement?: Placement;
}

export interface SuggestAdsResponse {
  video_id: string;
  suggested_ads: SuggestedAd[];
  placement_count: number;
  placements?: Placement[];
}
