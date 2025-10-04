"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { SuggestedAd } from "@/lib/types";

interface AdPlacementCardProps {
  ad: SuggestedAd;
  index: number;
}

export function AdPlacementCard({ ad, index }: AdPlacementCardProps) {
  const formatTime = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  // Generate gradient colors for different ads
  const gradients = [
    "from-red-100 to-red-200 dark:from-red-900 dark:to-red-800",
    "from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800",
    "from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800",
    "from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800",
  ];
  const gradient = gradients[index % gradients.length];

  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all">
      <div className="flex flex-col md:flex-row">
        {/* Ad Video Player/Preview */}
        <div
          className={`md:w-2/5 ${
            ad.adVideo?.hls?.video_url
              ? "bg-black"
              : `bg-gradient-to-br ${gradient}`
          }`}
        >
          {ad.adVideo?.hls?.video_url ? (
            <div className="relative h-48 md:h-full">
              <video
                controls
                className="h-full w-full"
                poster={ad.adVideo.hls.thumbnail_urls?.[0]}
              >
                <source
                  src={ad.adVideo.hls.video_url}
                  type="application/x-mpegURL"
                />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="h-48 md:h-full flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-700 dark:text-gray-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {ad.ad_name || `Ad ${index + 1}`}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-mono">
                  ID:{" "}
                  {ad.ad_video_id?.slice(0, 8) || ad.id?.slice(0, 8) || "N/A"}
                  ...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Ad Details */}
        <div className="p-6 md:w-3/5 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h5 className="font-bold text-lg text-gray-900 dark:text-white">
                {ad.ad_name || `Advertisement ${index + 1}`}
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Placement #{ad.placement_id || index + 1}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 ml-2">
              <Badge variant="destructive" className="text-xs">
                {formatTime(ad.placement_timestamp)}
              </Badge>
              {ad.score !== undefined && (
                <Badge className="text-xs bg-green-600 hover:bg-green-700">
                  Score: {ad.score.toFixed(2)}
                </Badge>
              )}
              {ad.relevance_score !== undefined && (
                <Badge className="text-xs bg-blue-600 hover:bg-blue-700">
                  {ad.relevance_score}% Match
                </Badge>
              )}
            </div>
          </div>

          {/* Placement Context */}
          {ad.placement && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h6 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm">
                Placement Context:
              </h6>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                {ad.placement.situation_description}
              </p>
            </div>
          )}

          {/* Tags Section */}
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-xs">
              {ad.placement?.themes && ad.placement.themes.length > 0 && (
                <div>
                  <h6 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Themes:
                  </h6>
                  <div className="flex flex-wrap gap-1">
                    {ad.placement.themes.map((theme, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-xs bg-gray-50 dark:bg-gray-900"
                      >
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {ad.placement?.ad_keywords &&
                ad.placement.ad_keywords.length > 0 && (
                  <div>
                    <h6 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Ad Keywords:
                    </h6>
                    <div className="flex flex-wrap gap-1">
                      {ad.placement.ad_keywords
                        .slice(0, 3)
                        .map((keyword, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200"
                          >
                            {keyword}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Duration: 30s
            </span>
            <Badge variant="outline" className="text-xs">
              Manual Ad
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
