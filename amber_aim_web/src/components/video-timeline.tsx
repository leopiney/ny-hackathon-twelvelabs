"use client";

import React, { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { SuggestedAd } from "@/lib/types";

interface VideoTimelineProps {
  duration: number;
  suggestedAds: SuggestedAd[];
  currentTime?: number;
  onSeek?: (time: number) => void;
}

export function VideoTimeline({
  duration,
  suggestedAds,
  currentTime = 0,
  onSeek,
}: VideoTimelineProps) {
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !onSeek) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(clickPosition * duration, duration));

    onSeek(newTime);
  };

  const handleTimelineHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const hoverPosition = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(hoverPosition * duration, duration));

    setHoveredTime(time);
    setHoveredPosition(e.clientX - rect.left);
  };

  const handleTimelineLeave = () => {
    setHoveredTime(null);
    setHoveredPosition(null);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="shadow-none border-none">
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Video Timeline
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Total Duration: {formatTime(duration)} • Current:{" "}
            {formatTime(currentTime)}
          </p>
        </div>

        {/* Timeline Visualization */}
        <div className="bg-gradient-to-b from-gray-50/50 to-gray-100/50 dark:from-gray-900/30 dark:to-gray-800/30 rounded-lg px-4 py-2">
          {/* Legend */}
          <div className="flex gap-4 mb-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2 bg-blue-500/80 rounded" />
              <span className="text-gray-700 dark:text-gray-300">
                Video Content
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-0.5 h-4 bg-red-500/80 rounded-full" />
              <span className="text-gray-700 dark:text-gray-300">
                Ad Breaks
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-green-500/80 rounded-full" />
              <span className="text-gray-700 dark:text-gray-300">
                Current Position
              </span>
            </div>
          </div>

          {/* Timeline Track */}
          <div
            ref={timelineRef}
            className="relative h-12 bg-white/60 dark:bg-gray-950/40 rounded-lg shadow-inner overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400/50 transition-all"
            onClick={handleTimelineClick}
            onMouseMove={handleTimelineHover}
            onMouseLeave={handleTimelineLeave}
          >
            {/* Full video bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/70 via-blue-500/70 to-blue-600/70">
              {/* Segment labels */}
              <div className="absolute inset-0 flex items-center justify-around text-white text-[10px] font-medium pointer-events-none">
                <span className="opacity-90">Intro</span>
                <span className="opacity-90">Main Content</span>
                <span className="opacity-90">Outro</span>
              </div>
            </div>

            {/* Progress overlay */}
            <div
              className="absolute inset-0 bg-blue-700/30 transition-all duration-100 pointer-events-none"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Current position indicator */}
            <div
              className="absolute top-0 bottom-0 z-30 transition-all duration-100 pointer-events-none"
              style={{ left: `${progressPercent}%` }}
            >
              <div className="relative h-full">
                {/* Progress line */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-green-500/90 shadow-lg" />
                {/* Playhead circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-lg" />
              </div>
            </div>

            {/* Hover preview */}
            {hoveredTime !== null && hoveredPosition !== null && (
              <div
                className="absolute -top-8 z-40 px-2 py-1 bg-gray-900/90 text-white text-xs rounded pointer-events-none transform -translate-x-1/2"
                style={{ left: `${hoveredPosition}px` }}
              >
                {formatTime(hoveredTime)}
              </div>
            )}

            {/* Render ad insertion breakpoints */}
            {suggestedAds.map((ad, index) => {
              const leftPercent = ad.placement_timestamp
                ? (ad.placement_timestamp / duration) * 100
                : 0;
              return (
                <div
                  key={index}
                  className="absolute top-0 bottom-0 z-20 pointer-events-none"
                  style={{ left: `${leftPercent}%` }}
                >
                  {/* Marker line */}
                  <div className="relative w-0.5 h-full bg-red-500/90 shadow-lg">
                    {/* Top triangle */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[5px] border-l-transparent border-r-transparent border-t-red-500/90" />
                    {/* Bottom triangle */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-b-[5px] border-l-transparent border-r-transparent border-b-red-500/90" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time markers */}
          <div className="relative mt-1.5">
            <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
              <span>0:00</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
