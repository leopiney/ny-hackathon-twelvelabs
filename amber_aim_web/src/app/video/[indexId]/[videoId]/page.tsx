import Link from "next/link";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { VideoPlayerWithSharedTimeline } from "@/components/video-player-with-shared-timeline";
import { AdPlacementCard } from "@/components/ad-placement-card";
import { AnalyzeVideoSection } from "@/components/analyze-video-section";
import { AnalyzeButton } from "@/components/analyze-button";
import { VideoAnalysisOverview } from "@/components/video-analysis-overview";
import { fetchVideo, fetchSuggestedAds } from "@/actions/video";
import type { AdSearchResponse, SuggestedAd, VideoVector } from "@/lib/types";

interface VideoDetailsPageProps {
  params: Promise<{
    indexId: string;
    videoId: string;
  }>;
}

export default async function VideoDetailsPage({
  params,
}: VideoDetailsPageProps) {
  const { indexId, videoId } = await params;

  // Fetch video details
  const video = await fetchVideo(indexId, videoId);

  // Fetch suggested ads (might fail if analysis not complete)
  let suggestedAds;
  try {
    suggestedAds = await fetchSuggestedAds(videoId);
  } catch (error) {
    console.log("Suggested ads not available yet");
    suggestedAds = null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const videoDuration =
    video.system_metadata?.duration || video.metadata?.duration || 180; // Default to 3 minutes if not available

  // Hardcoded ad index ID
  const adIndexId = "68e185ef64ff05606e152638";

  // Collect all unique Ad Video IDs to fetch
  const adVideoIds = new Set<string>();
  suggestedAds?.suggested_ads?.forEach((response: AdSearchResponse) => {
    response.data.forEach(queryData => {
      queryData.results.forEach(result => {
        if (result.id) adVideoIds.add(result.id);
      });
    });
  });

  // Fetch ad videos in parallel
  const adVideosMap = new Map<string, VideoVector>();
  // We limit concurrency implicitly by Promise.all, but if there are too many, this might need chunking. 
  // Assuming manageable amount for now (< 50).
  await Promise.all(Array.from(adVideoIds).map(async (id) => {
    try {
      const adVideo = await fetchVideo(adIndexId, id);
      adVideosMap.set(id, adVideo);
    } catch (error) {
      console.log(`Failed to fetch ad video ${id}`);
    }
  }));

  // Hydrate the ads with video details for the UI
  const hydratedAds: AdSearchResponse[] = suggestedAds?.suggested_ads?.map((response: AdSearchResponse) => ({
    ...response,
    data: response.data.map(queryData => ({
      ...queryData,
      results: queryData.results.map(result => ({
        ...result,
        adVideo: adVideosMap.get(result.id) || null
      }))
    }))
  })) || [];

  // Create simplified list for the timeline player (pick the best/first ad for each placement)
  const timelineAds: SuggestedAd[] = hydratedAds.map(ad => {
    // Find the first available ad from the first query as the default
    // Better logic could be: find ad with highest score across all queries
    let bestAd = null;
    let bestScore = -1;

    for (const q of ad.data) {
      for (const r of q.results) {
        const score = r.clips[0]?.score || 0;
        if (score > bestScore && r.adVideo?.hls?.video_url) {
          bestScore = score;
          bestAd = r;
        }
      }
    }
    
    // Fallback to first result if no video found (to at least show marker)
    if (!bestAd && ad.data[0]?.results[0]) {
        bestAd = ad.data[0].results[0];
    }

    return {
      placement_timestamp: ad.placement.timestamp,
      adVideo: bestAd?.adVideo || null,
      ad_video_id: bestAd?.id,
      ad_name: bestAd?.adVideo?.metadata?.filename
    };
  }).filter(ad => ad !== null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {video.system_metadata?.filename ||
                  video.metadata?.filename ||
                  `Video ${video.id.slice(0, 8)}`}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-Powered Video Ad Insertion Platform
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        {/* Title Section */}
        {hydratedAds && hydratedAds.length > 0 && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Video Analysis & Ad Placements
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detailed breakdown of narrative structure and recommended ad strategies
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Video Player & Timeline */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="overflow-hidden">
              {video.hls?.video_url ? (
                <div className="w-full max-w-full">
                  <VideoPlayerWithSharedTimeline
                    videoUrl={video.hls.video_url}
                    posterUrl={video.hls.thumbnail_urls?.[0]}
                    duration={videoDuration}
                    suggestedAds={timelineAds}
                  />
                </div>
              ) : (
                <div className="relative bg-black aspect-video flex items-center justify-center max-w-full">
                  <div className="flex h-full items-center justify-center text-white">
                    <div className="text-center">
                      <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                      <p className="text-sm">Processing video...</p>
                    </div>
                  </div>
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {video.system_metadata?.filename ||
                        video.metadata?.filename ||
                        `Video ${video.id}`}
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      Video ID: {video.id}
                    </p>
                  </div>
                  <AnalyzeButton videoId={videoId} />
                </div>

                <div className="grid grid-cols-1 gap-2 mt-4">
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Duration
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDuration(
                          video.system_metadata?.duration ||
                            video.metadata?.duration
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Created
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDate(video.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Status
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {video.indexed_at ? "Indexed" : "Processing"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Recommended Ad Placements */}
          <div className="lg:col-span-8">
            {hydratedAds && hydratedAds.length > 0 ? (
              <div className="grid gap-4">
                {suggestedAds?.placements_result && (
                  <VideoAnalysisOverview result={suggestedAds.placements_result} />
                )}
                
                <div className="space-y-6">
                  {hydratedAds.map((ad, index) => (
                    <AdPlacementCard key={index} response={ad} index={index} />
                  ))}
                </div>
              </div>
            ) : (
              <AnalyzeVideoSection videoId={videoId} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
