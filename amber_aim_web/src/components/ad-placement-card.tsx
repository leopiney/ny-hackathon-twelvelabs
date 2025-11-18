"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AdSearchResponse, AdSearchResult, AdClip } from "@/lib/types";
import { Play, Pause, ChevronRight, ChevronLeft } from "lucide-react";

interface AdPlacementCardProps {
  response: AdSearchResponse;
  index: number;
}

export function AdPlacementCard({ response, index }: AdPlacementCardProps) {
  const [activeQueryIndex, setActiveQueryIndex] = useState(0);
  const [activeAdIndex, setActiveAdIndex] = useState<Record<number, number>>({});

  const placement = response.placement;
  const queries = response.data;
  const activeQueryData = queries[activeQueryIndex];
  const activeAdIdx = activeAdIndex[activeQueryIndex] || 0;
  const activeAd = activeQueryData?.results[activeAdIdx];

  const formatTime = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handleAdSelect = (queryIdx: number, adIdx: number) => {
    setActiveAdIndex(prev => ({ ...prev, [queryIdx]: adIdx }));
  };

  return (
    <Card className="overflow-hidden border-l-4 border-l-blue-500 mb-6">
      <CardHeader className="bg-gray-50 dark:bg-gray-900/50 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 border-blue-200">
                Placement #{index + 1}
              </Badge>
              <span className="font-mono font-bold text-lg">
                {formatTime(placement.timestamp)}
              </span>
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {placement.reason.split('.')[0]}
            </h3>
          </div>
          <div className="text-right max-w-[40%]">
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              {placement.situation_description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Left: Query Strategies & Results List */}
          <div className="lg:w-1/3 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Search Strategies</h4>
              <div className="flex flex-wrap gap-2">
                {queries.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveQueryIndex(i)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors text-left truncate max-w-full ${
                      activeQueryIndex === i
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    Strategy {i + 1}
                  </button>
                ))}
              </div>
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs text-gray-600 dark:text-gray-300 italic">
                "{activeQueryData?.query}"
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              <h4 className="text-xs font-semibold text-gray-500 uppercase px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
                Ad Candidates ({activeQueryData?.results.length || 0})
              </h4>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {activeQueryData?.results.map((result, idx) => (
                  <button
                    key={result.id}
                    onClick={() => handleAdSelect(activeQueryIndex, idx)}
                    className={`w-full text-left p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex gap-3 ${
                      activeAdIdx === idx ? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="w-20 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0 relative">
                      {result.clips[0]?.thumbnail_url ? (
                        <img 
                          src={result.clips[0].thumbnail_url} 
                          alt="Ad thumbnail" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 text-xs">
                          No Img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium truncate block">
                          {result.adVideo?.metadata?.filename || result.adVideo?.system_metadata?.filename || `Ad ${result.id.slice(0, 6)}`}
                        </span>
                        <Badge variant={result.clips[0].score > 75 ? "default" : "secondary"} className="text-[10px] h-5">
                          {result.clips[0].score.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate">
                         {result.clips.length} clip(s) found
                      </div>
                    </div>
                  </button>
                ))}
                {activeQueryData?.results.length === 0 && (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No ads found for this strategy.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Active Ad Detail & Player */}
          <div className="lg:w-2/3 p-4 bg-slate-50/50 dark:bg-slate-900/20">
            {activeAd ? (
              <div className="space-y-4">
                 {/* Player */}
                 <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg relative">
                  {activeAd.adVideo?.hls?.video_url ? (
                    <video
                      controls
                      className="w-full h-full"
                      poster={activeAd.clips[0]?.thumbnail_url}
                      key={activeAd.id} // Force reload on change
                    >
                      <source src={activeAd.adVideo.hls.video_url} type="application/x-mpegURL" />
                    </video>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                         <Play className="w-8 h-8 opacity-50" />
                      </div>
                      <p>Video preview unavailable</p>
                      <p className="text-xs text-gray-400 mt-2">ID: {activeAd.id}</p>
                    </div>
                  )}
                 </div>

                 {/* Details */}
                 <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">
                        {activeAd.adVideo?.metadata?.filename || `Ad ${activeAd.id}`}
                      </h3>
                      <div className="flex gap-2">
                        <Badge variant="outline">Confidence: {activeAd.clips[0]?.confidence}</Badge>
                      </div>
                    </div>
                    
                    {activeAd.clips[0]?.transcription && (
                      <div className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-800">
                        <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Transcription</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                          "{activeAd.clips[0].transcription}"
                        </p>
                      </div>
                    )}

                    <div className="mt-4">
                      <span className="text-xs font-semibold text-gray-500 uppercase block mb-2">Relevant Clips</span>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {activeAd.clips.map((clip, i) => (
                          <div key={i} className="flex-shrink-0 bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-800 min-w-[120px]">
                            <div className="text-xs font-mono mb-1">
                              {formatTime(clip.start)} - {formatTime(clip.end)}
                            </div>
                            <div className="text-xs font-bold text-blue-600">
                              Score: {clip.score.toFixed(1)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm p-12">
                Select an ad candidate to view details
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
