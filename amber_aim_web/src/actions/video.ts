"use server";

import {
  getIndexes,
  getIndexVideos,
  getVideo,
  generateUploadUrl,
  analyzeVideo,
  suggestAds,
} from "@/lib/api";
import type {
  IndexSchema,
  VideoVector,
  UploadURLRequest,
  UploadURLResponse,
  AnalyzeRequest,
  AnalyzeResponse,
  SuggestAdsRequest,
  SuggestAdsResponse,
} from "@/lib/types";

export async function fetchIndexes(): Promise<IndexSchema[]> {
  try {
    return await getIndexes();
  } catch (error) {
    console.error("Error fetching indexes:", error);
    throw error;
  }
}

export async function fetchIndexVideos(
  indexId: string
): Promise<VideoVector[]> {
  try {
    return await getIndexVideos(indexId);
  } catch (error) {
    console.error(`Error fetching videos for index ${indexId}:`, error);
    throw error;
  }
}

export async function fetchVideo(
  indexId: string,
  videoId: string
): Promise<VideoVector> {
  try {
    return await getVideo(indexId, videoId);
  } catch (error) {
    console.error(`Error fetching video ${videoId}:`, error);
    throw error;
  }
}

export async function createUploadUrl(
  filename: string
): Promise<UploadURLResponse> {
  try {
    const request: UploadURLRequest = { filename };
    return await generateUploadUrl(request);
  } catch (error) {
    console.error("Error creating upload URL:", error);
    throw error;
  }
}

export async function createAnalyzeTask(
  request: AnalyzeRequest
): Promise<AnalyzeResponse> {
  try {
    return await analyzeVideo(request);
  } catch (error) {
    console.error("Error creating analyze task:", error);
    throw error;
  }
}

export async function fetchSuggestedAds(
  videoId: string
): Promise<SuggestAdsResponse> {
  try {
    const request: SuggestAdsRequest = { video_id: videoId };
    return await suggestAds(request);
  } catch (error) {
    console.error(`Error fetching suggested ads for video ${videoId}:`, error);
    throw error;
  }
}
