"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { suggestAds } from "@/lib/api";

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
      await suggestAds({
        video_id: videoId,
        force: true,
      });

      // Refresh the page after a short delay to show updated status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Re-analysis failed");
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
        {isAnalyzing ? "Re-analyzing..." : "Re-analyze"}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
