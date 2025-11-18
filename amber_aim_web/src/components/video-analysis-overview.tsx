import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PlacementResult } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area"; // Assuming we might add this, but for now standard div overflow

interface VideoAnalysisOverviewProps {
  result: PlacementResult;
}

export function VideoAnalysisOverview({ result }: VideoAnalysisOverviewProps) {
  // Handle the typo in backend model if present
  const characters = result.characters || result.characeters || [];

  return (
    <div className="space-y-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Video Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary & Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-sm text-gray-500 uppercase mb-2">Summary</h4>
              <p className="text-gray-800 dark:text-gray-200">{result.summary}</p>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-500 uppercase mb-2">Artistic Style</h4>
                <p className="text-gray-800 dark:text-gray-200">{result.artistic_style}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-500 uppercase mb-2">Color Tone</h4>
                <p className="text-gray-800 dark:text-gray-200">{result.general_color_tone}</p>
              </div>
            </div>
          </div>

          {/* Themes & Tags */}
          <div>
            <h4 className="font-semibold text-sm text-gray-500 uppercase mb-2">Themes & Tags</h4>
            <div className="flex flex-wrap gap-2">
              {result.themes.map((theme, i) => (
                <Badge key={`theme-${i}`} variant="secondary">{theme}</Badge>
              ))}
              {result.tags.map((tag, i) => (
                <Badge key={`tag-${i}`} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>

          {/* Characters */}
          {characters.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-500 uppercase mb-2">Characters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map((char, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="font-bold text-gray-900 dark:text-white mb-1">{char.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{char.arc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Narrative Structure */}
          <div>
            <h4 className="font-semibold text-sm text-gray-500 uppercase mb-4">Narrative Structure</h4>
            <div className="relative border-l-2 border-blue-200 dark:border-blue-900 ml-3 space-y-6 pb-2">
              {result.narrative_structure.map((node, i) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-gray-950" />
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                      {Math.floor(node.timestamp / 60)}:{String(node.timestamp % 60).padStart(2, '0')}
                    </span>
                    <h5 className="font-semibold text-gray-900 dark:text-white">
                      {node.hero_journey_stage?.replace(/_/g, ' ') || node.act?.replace(/_/g, ' ')}
                    </h5>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{node.narration}</p>
                  <div className="flex flex-wrap gap-1">
                    {node.themes.slice(0, 3).map((theme, ti) => (
                      <span key={ti} className="text-[10px] text-gray-500 border border-gray-200 dark:border-gray-800 rounded px-1.5 py-0.5">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

