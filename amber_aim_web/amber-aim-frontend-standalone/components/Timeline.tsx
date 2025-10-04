import React from 'react';
import Image from 'next/image';

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

interface TimelineProps {
  clips: { id: string; start: number; end: number; label: string; thumbnailUrl?: string }[];
  totalDuration: number;
  videoUrl?: string;
  breakPoints?: BreakPoint[];
}

const Timeline: React.FC<TimelineProps> = ({ clips, totalDuration, videoUrl, breakPoints = [] }) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Video Timeline</h3>
        <p className="text-sm text-gray-600">Total Duration: {totalDuration} seconds</p>
      </div>

      {/* Timeline Visualization */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-6 shadow-lg">
        {/* Legend */}
        <div className="flex gap-6 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-700">Video Content</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-red-500 rounded-full"></div>
            <span className="text-gray-700">Ad Breaks</span>
          </div>
        </div>

        {/* Timeline Track */}
        <div className="relative h-32 bg-white rounded-lg shadow-inner overflow-hidden">
          {/* Render video clips */}
          {clips.map((clip) => {
            const widthPercent = ((clip.end - clip.start) / totalDuration) * 100;
            const leftPercent = (clip.start / totalDuration) * 100;
            return (
              <div
                key={clip.id}
                className="absolute h-full border-2 border-blue-400 rounded overflow-hidden transition-all hover:border-blue-600 hover:shadow-lg"
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                }}
                title={`${clip.label} (${clip.start}s - ${clip.end}s)`}
              >
                {clip.thumbnailUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={clip.thumbnailUrl}
                      alt={clip.label}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1">
                      <p className="text-white text-xs font-medium truncate">{clip.label}</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <p className="text-white text-xs font-medium">{clip.label}</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Render ad insertion breakpoints */}
          {breakPoints.map((breakPoint) => {
            const leftPercent = (breakPoint.timestamp / totalDuration) * 100;
            return (
              <div
                key={breakPoint.id}
                className="absolute top-0 bottom-0 z-20"
                style={{ left: `${leftPercent}%` }}
              >
                {/* Marker line */}
                <div className="relative w-1 h-full bg-red-500 shadow-lg">
                  {/* Top triangle */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-500"></div>
                  {/* Bottom triangle */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-red-500"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time markers */}
        <div className="relative mt-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>0:00</span>
            <span>{Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Recommended Ads Section */}
      {breakPoints.length > 0 && (
        <div className="mt-8">
          <h4 className="text-xl font-bold text-gray-800 mb-4">Recommended Ad Placements</h4>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {breakPoints.map((bp) => (
              <div key={bp.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all">
                <div className="flex flex-col md:flex-row">
                  {/* Ad Thumbnail */}
                  <div className="md:w-2/5">
                    {bp.recommendedAd?.thumbnailUrl ? (
                      <div className="relative h-48 md:h-full bg-gradient-to-br from-purple-100 to-pink-100">
                        <Image
                          src={bp.recommendedAd.thumbnailUrl}
                          alt={bp.recommendedAd.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="h-48 md:h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <div className="text-center text-white">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm font-medium">Ad Preview</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ad Details */}
                  <div className="p-5 md:w-3/5 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="font-bold text-lg text-gray-900">{bp.recommendedAd?.title || 'Recommended Ad'}</h5>
                        <p className="text-sm text-gray-600">{bp.recommendedAd?.brand || 'Brand Name'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          {bp.timestamp}s
                        </span>
                        {bp.recommendedAd?.matchScore && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            {bp.recommendedAd.matchScore}% Match
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rationale */}
                    {bp.recommendedAd?.rationale && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <h6 className="text-xs font-semibold text-blue-900 mb-1">Why this ad?</h6>
                            <p className="text-xs text-blue-800">{bp.recommendedAd.rationale}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Matching Terms */}
                    {bp.recommendedAd?.matchingTerms && bp.recommendedAd.matchingTerms.length > 0 && (
                      <div className="mb-3">
                        <h6 className="text-xs font-semibold text-gray-700 mb-2">Matching Terms:</h6>
                        <div className="flex flex-wrap gap-1.5">
                          {bp.recommendedAd.matchingTerms.map((term, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags Section */}
                    <div className="mt-auto pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {/* Video Tags */}
                        {bp.recommendedAd?.videoTags && bp.recommendedAd.videoTags.length > 0 && (
                          <div>
                            <h6 className="font-semibold text-gray-600 mb-1.5">Video Context:</h6>
                            <div className="flex flex-wrap gap-1">
                              {bp.recommendedAd.videoTags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Ad Tags */}
                        {bp.recommendedAd?.adTags && bp.recommendedAd.adTags.length > 0 && (
                          <div>
                            <h6 className="font-semibold text-gray-600 mb-1.5">Ad Category:</h6>
                            <div className="flex flex-wrap gap-1">
                              {bp.recommendedAd.adTags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        Duration: {bp.recommendedAd?.duration || 15}s
                      </span>
                      <span className="text-xs font-medium text-blue-600">{bp.label || 'Ad Break'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
