"use client";

import { useState, useEffect } from "react";
import { Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { analyzeVideo, suggestAds } from "@/lib/api";
import type { SuggestAdsResponse } from "@/lib/types";

interface AnalyzeVideoSectionProps {
  videoId: string;
  onAdsFound?: (ads: SuggestAdsResponse) => void;
}

export function AnalyzeVideoSection({
  videoId,
  onAdsFound,
}: AnalyzeVideoSectionProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    if (isAnalyzing) {
      // Poll for suggested ads every 10 seconds
      pollInterval = setInterval(async () => {
        try {
          const response = await suggestAds({ video_id: videoId });

          if (response.suggested_ads && response.suggested_ads.length > 0) {
            // Ads found! Stop polling and refresh the page
            setIsAnalyzing(false);
            if (onAdsFound) {
              onAdsFound(response);
            } else {
              // Refresh the page to show the ads
              window.location.reload();
            }
          } else {
            setPollCount((count) => count + 1);
          }
        } catch (err) {
          // Continue polling even if there's an error (analysis might not be complete)
          setPollCount((count) => count + 1);
        }
      }, 10000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isAnalyzing, videoId, onAdsFound]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    setPollCount(0);

    try {
      // Start the analysis process
      await analyzeVideo({
        video_id: videoId,
        type: "creator",
      });

      // Polling will start automatically via useEffect
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start analysis");
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Ad Suggestions</CardTitle>
          <CardDescription>
            AI-powered ad placement recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Analysis in Progress
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-4">
            Our AI is analyzing your video content to find the perfect ad
            placements. This usually takes a few minutes.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Checking for results... ({pollCount} checks)
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAnalyzing(false)}
            className="mt-4"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>Ad Suggestions</CardTitle>
        <CardDescription>
          AI-powered ad placement recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
          <Play className="h-8 w-8 text-blue-600" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Ready to Analyze
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
          Start AI-powered analysis to find the best ad placements for your
          video. Our system will analyze content, themes, and emotional beats to
          recommend optimal insertion points.
        </p>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
        )}
        <Button onClick={handleAnalyze} size="lg" className="gap-2">
          <RefreshCw className="h-5 w-5" />
          Start Analysis
        </Button>
      </CardContent>
    </Card>
  );
}
