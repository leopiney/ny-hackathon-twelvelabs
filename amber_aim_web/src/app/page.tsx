import Link from "next/link";
import { Video, PlayCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadDialog } from "@/components/upload-dialog";
import { fetchIndexes, fetchIndexVideos } from "@/actions/video";

export default async function DashboardPage() {
  const indexes = await fetchIndexes();

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
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
            <UploadDialog />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:border-blue-900 dark:from-blue-950 dark:to-gray-950">
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

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:border-blue-900 dark:from-blue-950 dark:to-gray-950">
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

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:border-blue-900 dark:from-blue-950 dark:to-gray-950">
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
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {index.name}
                  </h2>
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
                    <Link
                      key={video.id}
                      href={`/video/${index.id}/${video.id}`}
                      className="group"
                    >
                      <Card className="overflow-hidden transition-all hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20">
                        <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-950">
                          {video.hls?.thumbnail_urls?.[0] ? (
                            <img
                              src={video.hls.thumbnail_urls[0]}
                              alt={
                                video.metadata?.filename || "Video thumbnail"
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <PlayCircle className="h-12 w-12 text-blue-600" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/10" />
                        </div>
                        <CardHeader>
                          <CardTitle className="line-clamp-1 text-base">
                            {video.metadata?.filename ||
                              `Video ${video.id.slice(0, 8)}`}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {video.metadata?.duration
                              ? `${Math.floor(
                                  video.metadata.duration / 60
                                )}:${String(
                                  Math.floor(video.metadata.duration % 60)
                                ).padStart(2, "0")}`
                              : "Duration unknown"}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
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
                No indexes found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload your first video to get started
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
