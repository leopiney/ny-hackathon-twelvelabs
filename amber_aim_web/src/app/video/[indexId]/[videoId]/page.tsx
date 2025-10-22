import Link from "next/link";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoPlayerSection } from "@/components/video-player-section";
import { AdPlacementCard } from "@/components/ad-placement-card";
import { AnalyzeVideoSection } from "@/components/analyze-video-section";
import { AnalyzeButton } from "@/components/analyze-button";
import { fetchVideo, fetchSuggestedAds } from "@/actions/video";

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

  // Transform placements - for each placement, get the corresponding ad
  const transformedAds = await Promise.all(
    (suggestedAds?.placements || []).map(async (placement, idx) => {
      const ad = suggestedAds?.suggested_ads?.[idx];
      if (!ad) return null;

      // Fetch the ad video
      let adVideo = null;
      if (ad.id) {
        try {
          adVideo = await fetchVideo(adIndexId, ad.id);
        } catch (error) {
          console.log(`Failed to fetch ad video ${ad.id}`);
        }
      }

      return {
        ...ad,
        placement_timestamp: placement.timestamp,
        ad_video_id: ad.id,
        score: ad.clips?.[0]?.score,
        adVideo: adVideo,
        placement: placement,
      };
    })
  ).then((ads) => ads.filter((ad) => ad !== null)); // Remove any null entries

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
        <div className="space-y-4">
          {/* Video Player Section */}
          <Card className="overflow-hidden">
            {video.hls?.video_url ? (
              <VideoPlayerSection
                videoUrl={video.hls.video_url}
                posterUrl={video.hls.thumbnail_urls?.[0]}
                duration={videoDuration}
                suggestedAds={transformedAds}
              />
            ) : (
              <div className="relative bg-black max-h-[400px] flex items-center justify-center">
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
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Duration
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatDuration(
                        video.system_metadata?.duration ||
                          video.metadata?.duration
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Created
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatDate(video.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Status
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {video.indexed_at ? "Indexed" : "Processing"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Ad Placements */}
          {transformedAds && transformedAds.length > 0 && (
            <div>
              <div className="mb-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Recommended Ad Placements
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  AI-powered ad suggestions based on video content analysis
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {transformedAds.map((ad, index) => (
                  <AdPlacementCard key={index} ad={ad} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* No Ads Available State */}
          {!suggestedAds && <AnalyzeVideoSection videoId={videoId} />}
        </div>
      </main>

      {/* <div>{JSON.stringify(suggestedAds, null, 2)}</div> */}
    </div>
  );
}
