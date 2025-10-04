"use client";

import { useState, useRef } from "react";
import Timeline from "../../components/Timeline";

interface AdClip {
  score: number;
  start: number;
  end: number;
  video_id: string;
  confidence: string;
  thumbnail_url?: string;
  transcription?: string;
}

interface AdSearchResult {
  id: string;
  clips: AdClip[];
}

interface BreakPoint {
  id: string;
  timestamp: number;
  label?: string;
  recommendedAd?: {
    title: string;
    brand: string;
    duration: number;
    thumbnailUrl?: string;
    rationale?: string;
    matchScore?: number;
    videoTags?: string[];
    adTags?: string[];
    matchingTerms?: string[];
  };
}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [s3Path, setS3Path] = useState<string>("");
  const [videoId, setVideoId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>("");
  const [breakPoints, setBreakPoints] = useState<BreakPoint[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setAnalysisStatus("Uploading video...");

    try {
      // Step 1: Get presigned URL from backend
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name }),
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { upload_url, s3_path } = await uploadResponse.json();

      // Step 2: Upload video to S3
      const s3Response = await fetch(upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!s3Response.ok) {
        throw new Error("Failed to upload video to S3");
      }

      // Step 3: Construct public S3 URL
      const bucketUrl = upload_url.split("?")[0];
      setVideoUrl(bucketUrl);
      setS3Path(s3_path);

      setIsUploading(false);
      setAnalysisStatus("Video uploaded successfully! Starting analysis...");

      // Step 4: Start video analysis
      await analyzeVideo(s3_path);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload video. Please try again.");
      setIsUploading(false);
      setAnalysisStatus("");
    }
  };

  const analyzeVideo = async (videoPath: string) => {
    setIsAnalyzing(true);
    setAnalysisStatus("Analyzing video with TwelveLabs...");

    try {
      // Call analyze endpoint (type: "creator" for creator videos)
      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_path: videoPath,
          type: "creator",
        }),
      });

      if (!analyzeResponse.ok) {
        throw new Error("Failed to start video analysis");
      }

      const { id, video_id } = await analyzeResponse.json();
      setVideoId(video_id);

      setAnalysisStatus(
        `Analysis started (Task ID: ${id}). Processing in background...`
      );

      // Note: The backend processes this in the background
      // In a production app, you'd poll for completion or use websockets
      // For now, we'll wait a bit then try to get suggestions
      setTimeout(() => {
        setAnalysisStatus("Analysis complete! Fetching ad suggestions...");
        fetchAdSuggestions(video_id);
      }, 30000); // Wait 30 seconds for analysis to complete
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze video. Please try again.");
      setIsAnalyzing(false);
      setAnalysisStatus("");
    }
  };

  const fetchAdSuggestions = async (vid: string) => {
    setIsFetchingSuggestions(true);

    try {
      const suggestResponse = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: vid }),
      });

      if (!suggestResponse.ok) {
        const error = await suggestResponse.json();
        if (error.error_code === "PLACEMENT_NOT_FOUND") {
          // Analysis not ready yet
          setAnalysisStatus(
            "Analysis still processing. Please wait and try again..."
          );
          setIsFetchingSuggestions(false);
          setIsAnalyzing(false);
          return;
        }
        throw new Error("Failed to get ad suggestions");
      }

      const { suggested_ads, placement_count } = await suggestResponse.json();

      // Transform backend data to frontend format
      const transformedBreakpoints = transformSuggestedAds(suggested_ads);
      setBreakPoints(transformedBreakpoints);

      setAnalysisStatus(
        `Complete! Found ${placement_count} ad placements with ${suggested_ads.length} suggested ads.`
      );
      setIsFetchingSuggestions(false);
      setIsAnalyzing(false);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      alert(
        "Failed to get ad suggestions. The analysis may still be processing."
      );
      setIsFetchingSuggestions(false);
      setIsAnalyzing(false);
      setAnalysisStatus(
        "Analysis may still be processing. Please try fetching suggestions again later."
      );
    }
  };

  const transformSuggestedAds = (
    suggestedAds: AdSearchResult[]
  ): BreakPoint[] => {
    return suggestedAds.map((ad, index) => {
      const topClip = ad.clips[0]; // Use the top scoring clip
      const avgScore =
        ad.clips.reduce((sum, clip) => sum + clip.score, 0) / ad.clips.length;

      return {
        id: `bp-${index}`,
        timestamp: Math.round(topClip?.start || 0),
        label: `Ad Break ${index + 1}`,
        recommendedAd: {
          title: `Ad ${ad.id}`,
          brand: "Advertiser",
          duration: Math.round((topClip?.end || 0) - (topClip?.start || 0)),
          thumbnailUrl: topClip?.thumbnail_url,
          matchScore: Math.round(avgScore * 100),
          rationale:
            topClip?.transcription ||
            "AI-matched ad based on video content analysis",
          matchingTerms: [], // Could be extracted from placement data
          videoTags: [],
          adTags: [],
        },
      };
    });
  };

  const retryFetchSuggestions = () => {
    if (videoId) {
      setAnalysisStatus("Retrying to fetch ad suggestions...");
      fetchAdSuggestions(videoId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            VibePoint
          </h1>
          <p className="text-gray-600 mt-2">
            AI-Powered Video Ad Insertion Platform
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* File Upload Section */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Upload Creator Video
          </h2>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isAnalyzing || isFetchingSuggestions}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {isUploading || isAnalyzing || isFetchingSuggestions ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span>Upload Video</span>
              </>
            )}
          </button>

          {/* Status Message */}
          {analysisStatus && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">{analysisStatus}</p>
              {analysisStatus.includes("try again") && (
                <button
                  onClick={retryFetchSuggestions}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry Fetch Suggestions
                </button>
              )}
            </div>
          )}
        </div>

        {/* Video Preview */}
        {videoUrl && (
          <div className="mb-8 bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Video Preview
            </h3>
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg shadow-lg"
              crossOrigin="anonymous"
            />
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">S3 Path:</span>{" "}
                <code className="text-blue-600">{s3Path}</code>
              </p>
              {videoId && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Video ID:</span>{" "}
                  <code className="text-blue-600">{videoId}</code>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Timeline - Only show if we have breakpoints */}
        {breakPoints.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <Timeline
              clips={[]} // We'll populate this if needed
              totalDuration={100} // Placeholder - would come from video metadata
              videoUrl={videoUrl}
              breakPoints={breakPoints}
            />
          </div>
        )}
      </main>
    </div>
  );
}
