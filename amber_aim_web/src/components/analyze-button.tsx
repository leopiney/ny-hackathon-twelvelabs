"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { analyzeVideo } from "@/lib/api";

interface AnalyzeButtonProps {
  videoId: string;
}

export function AnalyzeButton({ videoId }: AnalyzeButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      await analyzeVideo({
        video_id: videoId,
        type: "creator",
      });

      // Refresh the page after a short delay to show updated status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        variant="default"
        className="gap-2"
        onClick={handleAnalyze}
        disabled={isAnalyzing}
      >
        <Sparkles className="h-4 w-4" />
        {isAnalyzing ? "Analyzing..." : "Analyze"}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
