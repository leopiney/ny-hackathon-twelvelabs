"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { SuggestedAd } from "@/lib/types";

interface VideoTimelineProps {
  duration: number;
  suggestedAds: SuggestedAd[];
}

export function VideoTimeline({ duration, suggestedAds }: VideoTimelineProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Video Timeline
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Duration: {formatTime(duration)}
          </p>
        </div>

        {/* Timeline Visualization */}
        <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6">
          {/* Legend */}
          <div className="flex gap-6 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-blue-500 rounded" />
              <span className="text-gray-700 dark:text-gray-300">
                Video Content
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-red-500 rounded-full" />
              <span className="text-gray-700 dark:text-gray-300">
                Ad Breaks
              </span>
            </div>
          </div>

          {/* Timeline Track */}
          <div className="relative h-32 bg-white dark:bg-gray-950 rounded-lg shadow-inner overflow-hidden">
            {/* Full video bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
              {/* Segment labels */}
              <div className="absolute inset-0 flex items-center justify-around text-white text-xs font-medium">
                <span>Intro</span>
                <span>Main Content</span>
                <span>Outro</span>
              </div>
            </div>

            {/* Render ad insertion breakpoints */}
            {suggestedAds.map((ad, index) => {
              const leftPercent = (ad.placement_timestamp / duration) * 100;
              return (
                <div
                  key={index}
                  className="absolute top-0 bottom-0 z-20"
                  style={{ left: `${leftPercent}%` }}
                >
                  {/* Marker line */}
                  <div className="relative w-1 h-full bg-red-500 shadow-lg">
                    {/* Top triangle */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-500" />
                    {/* Bottom triangle */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-red-500" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time markers */}
          <div className="relative mt-2">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>0:00</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
