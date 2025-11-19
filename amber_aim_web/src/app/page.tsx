import { Video, PlayCircle, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchIndexes, fetchIndexVideos } from "@/actions/video";
import { VideoGridItem } from "@/components/video-grid-item";

export default async function DashboardPage() {
  const CREATOR_INDEX_ID = process.env.APP_TWELVE_LABS_CREATORS_INDEX_ID;
  const ADS_INDEX_ID = process.env.APP_TWELVE_LABS_ADS_INDEX_ID;
  
  // Define target indexes in desired order
  const targetIndexIds = [CREATOR_INDEX_ID, ADS_INDEX_ID].filter(Boolean) as string[];

  const allIndexes = await fetchIndexes();
  
  // Filter and sort indexes to match the order in targetIndexIds
  const indexes = targetIndexIds
    .map(id => allIndexes.find(index => index.id === id))
    .filter((index): index is NonNullable<typeof index> => !!index);

  // Fetch videos for each index
  const indexesWithVideos = await Promise.all(
    indexes.map(async (index) => {
      try {
        const videos = await fetchIndexVideos(index.id);
        return { ...index, videos };
      } catch (error) {
        console.error(`Error fetching videos for index ${index.id}:`, error);
        return { ...index, videos: [] };
      }
    })
  );

  const getIndexType = (indexId: string): "creator" | "ad" => {
    if (indexId === ADS_INDEX_ID) return "ad";
    return "creator";
  };

  const getIndexDisplayName = (indexId: string, originalName: string) => {
    const type = getIndexType(indexId);
    if (type === "ad") return "Ads Library";
    if (type === "creator") return "Creator Content";
    return originalName;
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  VibePoint
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Video Analytics Dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="border-blue-200 bg-linear-to-br from-blue-50 to-white dark:border-blue-900 dark:from-blue-950 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Indexes
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {indexes.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-linear-to-br from-blue-50 to-white dark:border-blue-900 dark:from-blue-950 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Videos
              </CardTitle>
              <PlayCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {indexesWithVideos.reduce(
                  (acc, index) => acc + index.videos.length,
                  0
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-linear-to-br from-blue-50 to-white dark:border-blue-900 dark:from-blue-950 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Indexes
              </CardTitle>
              <Video className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {indexesWithVideos.filter((i) => i.videos.length > 0).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Indexes with Videos */}
        <div className="space-y-8">
          {indexesWithVideos.map((index) => (
            <div key={index.id}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {getIndexDisplayName(index.id, index.name)}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Index ID: {index.id}
                  </p>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {index.videos.length}{" "}
                  {index.videos.length === 1 ? "video" : "videos"}
                </Badge>
              </div>

              {index.videos.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {index.videos.map((video) => (
                    <VideoGridItem
                      key={video.id}
                      video={video}
                      indexId={index.id}
                      type={getIndexType(index.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <PlayCircle className="mb-4 h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No videos in this index yet
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>

        {indexes.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Video className="mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                No configured indexes found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please check your environment configuration
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
