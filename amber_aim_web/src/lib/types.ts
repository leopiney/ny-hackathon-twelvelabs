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
  thumbnail_url?: string;
  transcription?: string | null;
}

export interface Character {
  name: string;
  arc: string;
}

export interface Narration {
  timestamp: number;
  narration: string;
  situation_description: string;
  themes: string[];
  narrative_trope?: string | null;
  act?: string | null;
  emotional_arc?: string | null;
  hero_journey_stage?: string | null;
}

export interface Placement {
  timestamp: number;
  reason: string;
  situation_description: string;
  themes: string[];
  ad_keywords: string[];
}

export interface PlacementResult {
  summary: string;
  tags: string[];
  themes: string[];
  artistic_style: string;
  general_color_tone: string;
  obstacles: string[];
  emotional_parts: string[];
  segment_labels: string[];
  tone_classification: string[];
  characeters?: Character[]; // Note: typo in backend model "characeters"
  characters?: Character[]; // Handle potential fix
  natural_breakpoints: string[];
  narrative_structure: Narration[];
  placements: Placement[];
}

export interface AdSearchResult {
  id: string;
  clips: AdClip[];
  // Hydrated fields for UI
  adVideo?: VideoVector | null;
}

export interface AdSearchResponseData {
  results: AdSearchResult[];
  query: string;
}

export interface AdSearchResponse {
  data: AdSearchResponseData[];
  placement: Placement;
}

export interface SuggestAdsResponse {
  video_id: string;
  suggested_ads: AdSearchResponse[];
  placement_count: number;
  placements_result: PlacementResult;
}

// Type for the timeline player
export interface SuggestedAd {
  placement_timestamp: number;
  adVideo?: VideoVector | null;
  ad_video_id?: string;
  ad_name?: string;
}
