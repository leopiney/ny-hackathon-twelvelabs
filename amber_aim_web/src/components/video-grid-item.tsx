"use client";

import Link from "next/link";
import { PlayCircle } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { VideoVector } from "@/lib/types";

interface VideoGridItemProps {
  video: VideoVector;
  indexId: string;
  type: "creator" | "ad";
}

export function VideoGridItem({ video, indexId, type }: VideoGridItemProps) {
  const VideoCard = () => (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 h-full">
      <div className="relative aspect-video bg-linear-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-950">
        {video.hls?.thumbnail_urls?.[0] ? (
          <img
            src={video.hls.thumbnail_urls[0]}
            alt={video.metadata?.filename || "Video thumbnail"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <PlayCircle className="h-12 w-12 text-blue-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/10" />
        {type === "ad" && (
           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
             <div className="bg-black/50 rounded-full p-2">
               <PlayCircle className="h-8 w-8 text-white" />
             </div>
           </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1 text-base">
          {video.metadata?.filename || `Video ${video.id.slice(0, 8)}`}
        </CardTitle>
        <CardDescription className="text-xs">
          {video.metadata?.duration
            ? `${Math.floor(video.metadata.duration / 60)}:${String(
                Math.floor(video.metadata.duration % 60)
              ).padStart(2, "0")}`
            : "Duration unknown"}
        </CardDescription>
      </CardHeader>
    </Card>
  );

  if (type === "creator") {
    return (
      <Link href={`/video/${indexId}/${video.id}`} className="group block h-full">
        <VideoCard />
      </Link>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group cursor-pointer h-full">
          <VideoCard />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-black border-gray-800">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {video.metadata?.filename || "Ad Video"}
          </DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full">
           {video.hls?.video_url ? (
             <video
               src={video.hls.video_url}
               controls
               autoPlay
               className="w-full h-full"
               poster={video.hls.thumbnail_urls?.[0]}
             />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-white">
               Video URL not available
             </div>
           )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

