export interface VideoClip {
  id: string;
  start: number;
  end: number;
  label: string;
  thumbnailUrl?: string;
}

/**
 * Extracts a thumbnail from a video at a specific timestamp using canvas
 * @param videoUrl - Public S3 URL of the video
 * @param timestamp - Time in seconds to capture the thumbnail
 * @returns Promise with the thumbnail data URL
 */
export const extractThumbnailFromVideo = async (
  videoUrl: string,
  timestamp: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      video.currentTime = timestamp;
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);

      resolve(thumbnailUrl);
    };

    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };

    video.src = videoUrl;
  });
};

/**
 * Generates thumbnails for all clips from a video
 * @param videoUrl - Public S3 URL of the video
 * @param clips - Array of video clips
 * @returns Promise with clips containing thumbnail URLs
 */
export const generateThumbnailsForClips = async (
  videoUrl: string,
  clips: VideoClip[]
): Promise<VideoClip[]> => {
  const thumbnailPromises = clips.map(async (clip) => {
    try {
      // Extract thumbnail from the middle of the clip
      const thumbnailTimestamp = clip.start + (clip.end - clip.start) / 2;
      const thumbnailUrl = await extractThumbnailFromVideo(videoUrl, thumbnailTimestamp);

      return {
        ...clip,
        thumbnailUrl,
      };
    } catch (error) {
      console.error(`Failed to generate thumbnail for clip ${clip.id}:`, error);
      return clip;
    }
  });

  return Promise.all(thumbnailPromises);
};
