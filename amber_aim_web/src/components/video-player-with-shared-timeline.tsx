"use client";

import React, { useRef, useState, useEffect } from "react";
import { VideoTimeline } from "@/components/video-timeline";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { SuggestedAd } from "@/lib/types";

interface VideoPlayerWithSharedTimelineProps {
  videoUrl: string;
  posterUrl?: string;
  duration: number;
  suggestedAds: SuggestedAd[];
}

export function VideoPlayerWithSharedTimeline({
  videoUrl,
  posterUrl,
  duration,
  suggestedAds,
}: VideoPlayerWithSharedTimelineProps) {
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const adVideoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [currentAd, setCurrentAd] = useState<SuggestedAd | null>(null);
  const [skipCountdown, setSkipCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [processedAdTimestamps, setProcessedAdTimestamps] = useState<Set<number>>(new Set());
  const mainVideoTimeBeforeAd = useRef<number>(0);

  // Sort ads by timestamp for easier checking
  const sortedAds = [...suggestedAds].sort(
    (a, b) => (a.placement_timestamp || 0) - (b.placement_timestamp || 0)
  );

  useEffect(() => {
    const video = mainVideoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isPlayingAd) {
        const newTime = video.currentTime;
        setCurrentTime(newTime);

        // Check if we've reached an ad placement timestamp
        const currentSecond = newTime;
        for (const ad of sortedAds) {
          const adTimestamp = ad.placement_timestamp || 0;

          // Check if we're within 1 second of an ad timestamp and haven't played this ad yet
          const timeDiff = Math.abs(currentSecond - adTimestamp);

          if (
            timeDiff <= 1 &&
            !processedAdTimestamps.has(Math.floor(adTimestamp)) &&
            ad.adVideo?.hls?.video_url
          ) {
            console.log("Triggering ad at", currentSecond, "for timestamp", adTimestamp);
            console.log("Ad video URL:", ad.adVideo?.hls?.video_url);
            playAd(ad, video.currentTime);
            break;
          }
        }
      }
    };

    const handleLoadedMetadata = () => {
      setIsReady(true);
      console.log("Video loaded, duration:", video.duration);
      console.log(
        "Available ads:",
        sortedAds.map((ad) => ({
          timestamp: ad.placement_timestamp,
          hasVideo: !!ad.adVideo?.hls?.video_url,
          videoId: ad.ad_video_id,
        }))
      );
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [isPlayingAd, sortedAds, processedAdTimestamps]);

  // Handle ad countdown timer
  useEffect(() => {
    if (!isPlayingAd) return;

    setSkipCountdown(5);
    setCanSkip(false);

    const interval = setInterval(() => {
      setSkipCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlayingAd]);

  // Handle ad video events
  useEffect(() => {
    const adVideo = adVideoRef.current;
    if (!adVideo) return;

    const handleAdEnded = () => {
      resumeMainVideo();
    };

    adVideo.addEventListener("ended", handleAdEnded);

    return () => {
      adVideo.removeEventListener("ended", handleAdEnded);
    };
  }, []);

  const playAd = (ad: SuggestedAd, mainVideoTime: number) => {
    const mainVideo = mainVideoRef.current;
    const adVideo = adVideoRef.current;

    console.log("playAd called", {
      hasMainVideo: !!mainVideo,
      hasAdVideo: !!adVideo,
      adVideoUrl: ad.adVideo?.hls?.video_url,
    });

    if (!mainVideo || !adVideo || !ad.adVideo?.hls?.video_url) {
      console.error("Cannot play ad - missing video elements or URL");
      return;
    }

    console.log("Starting ad playback at main video time:", mainVideoTime);

    // Pause main video and store its time
    mainVideo.pause();
    mainVideoTimeBeforeAd.current = mainVideoTime;

    // Mark this ad timestamp as processed
    setProcessedAdTimestamps((prev) => new Set(prev).add(Math.floor(ad.placement_timestamp || 0)));

    // Setup and play ad
    setCurrentAd(ad);
    setIsPlayingAd(true);

    // Load and play the ad video
    setTimeout(() => {
      if (adVideo) {
        console.log("Playing ad video");
        adVideo.currentTime = 0;
        adVideo.play().catch((err) => {
          console.error("Failed to play ad:", err);
        });
      }
    }, 100);
  };

  const skipAd = () => {
    if (!canSkip) return;
    resumeMainVideo();
  };

  const resumeMainVideo = () => {
    const mainVideo = mainVideoRef.current;
    const adVideo = adVideoRef.current;

    if (!mainVideo || !adVideo) return;

    // Pause ad video
    adVideo.pause();
    adVideo.currentTime = 0;

    // Resume main video from where it left off
    setIsPlayingAd(false);
    setCurrentAd(null);
    setCanSkip(false);

    setTimeout(() => {
      if (mainVideo) {
        mainVideo.currentTime = mainVideoTimeBeforeAd.current;
        mainVideo.play().catch(console.error);
      }
    }, 100);
  };

  const handleSeek = (time: number) => {
    if (mainVideoRef.current && !isPlayingAd) {
      mainVideoRef.current.currentTime = time;
    }
  };

  return (
    <>
      {/* Video Player */}
      <div className="relative bg-black flex items-center justify-center w-full aspect-video">
        {/* Main Video */}
        <video
          ref={mainVideoRef}
          controls={!isPlayingAd}
          className={`h-full w-full ${isPlayingAd ? "hidden" : ""}`}
          poster={posterUrl}
        >
          <source src={videoUrl} type="application/x-mpegURL" />
          Your browser does not support the video tag.
        </video>

        {/* Ad Video - Always rendered but hidden when not playing */}
        <div className={`relative w-full h-full ${!isPlayingAd ? "hidden" : ""}`}>
          <video
            ref={adVideoRef}
            className="h-full w-full"
            poster={currentAd?.adVideo?.hls?.thumbnail_urls?.[0]}
          >
            {currentAd?.adVideo?.hls?.video_url && (
              <source src={currentAd.adVideo.hls.video_url} type="application/x-mpegURL" />
            )}
            Your browser does not support the video tag.
          </video>

          {/* Ad Overlay */}
          {isPlayingAd && currentAd && (
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                    AD
                  </div>
                  <span className="text-white text-sm">
                    {currentAd.adVideo?.system_metadata?.filename ||
                      currentAd.adVideo?.metadata?.filename ||
                      "Advertisement"}
                  </span>
                </div>
                <Button
                  onClick={skipAd}
                  disabled={!canSkip}
                  variant={canSkip ? "default" : "secondary"}
                  size="sm"
                  className={`${
                    canSkip
                      ? "bg-white text-black hover:bg-gray-200"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {canSkip ? (
                    <>
                      Skip Ad <X className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    `Skip in ${skipCountdown}s`
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline - Separate component below video */}
      {suggestedAds && suggestedAds.length > 0 && (
        <VideoTimeline
          duration={duration}
          suggestedAds={suggestedAds}
          currentTime={currentTime}
          onSeek={handleSeek}
        />
      )}
    </>
  );
}
