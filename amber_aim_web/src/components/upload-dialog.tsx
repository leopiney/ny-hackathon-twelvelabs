"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createUploadUrl, createAnalyzeTask } from "@/actions/video";
import { uploadToS3 } from "@/lib/api";

interface UploadDialogProps {
  onUploadComplete?: () => void;
}

export function UploadDialog({ onUploadComplete }: UploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [videoType, setVideoType] = useState<"creator" | "ad">("creator");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress("Generating upload URL...");

    try {
      // Step 1: Get presigned URL
      const uploadResponse = await createUploadUrl(file.name);
      setProgress("Uploading to S3...");

      // Step 2: Upload to S3
      await uploadToS3(uploadResponse.upload_url, file);
      setProgress("Starting video analysis...");

      // Step 3: Trigger analysis
      await createAnalyzeTask({
        video_path: uploadResponse.s3_path,
        type: videoType,
      });

      setProgress("Upload complete!");

      // Reset state
      setTimeout(() => {
        setOpen(false);
        setFile(null);
        setProgress("");
        setUploading(false);
        onUploadComplete?.();
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      setProgress("Upload failed. Please try again.");
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Upload className="h-5 w-5" />
          Upload Video
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
          <DialogDescription>
            Upload a video file to analyze and index with TwelveLabs.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="file" className="text-sm font-medium">
              Video File
            </label>
            <input
              id="file"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {file && (
              <p className="text-sm text-gray-500">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                MB)
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="type" className="text-sm font-medium">
              Video Type
            </label>
            <select
              id="type"
              value={videoType}
              onChange={(e) => setVideoType(e.target.value as "creator" | "ad")}
              disabled={uploading}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="creator">Creator Content</option>
              <option value="ad">Advertisement</option>
            </select>
          </div>

          {progress && (
            <div className="flex items-center gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-900">
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              {progress}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
