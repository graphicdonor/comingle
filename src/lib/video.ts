export const MAX_POST_VIDEO_SECONDS = 15;
export const MAX_POST_VIDEO_BYTES = 25 * 1024 * 1024;

export interface VideoMetadata {
  duration: number;
  thumbnailBlob: Blob;
}

/**
 * Reads a video file's duration and grabs one representative frame as a
 * thumbnail (used for both the feed preview and the moderation input,
 * since OpenAI's moderation endpoint has no video modality). Runs entirely
 * client-side via an off-DOM <video>/<canvas> pair — no upload needed just
 * to inspect the file.
 */
export function readVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const cleanup = () => URL.revokeObjectURL(url);
    const fail = (message: string) => {
      cleanup();
      reject(new Error(message));
    };

    video.onerror = () => fail("Couldn't read this video file.");

    const captureFrame = () => {
      const duration = video.duration;
      video.currentTime = Math.min(0.1, duration / 2);
      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) { fail("Couldn't generate a preview for this video."); return; }
        ctx.drawImage(video, 0, 0);
        canvas.toBlob(
          (blob) => {
            cleanup();
            if (!blob) { reject(new Error("Couldn't generate a preview for this video.")); return; }
            resolve({ duration, thumbnailBlob: blob });
          },
          "image/jpeg",
          0.85
        );
      };
    };

    video.onloadedmetadata = () => {
      // Some browsers (Chrome, for certain encodings) report Infinity until
      // a seek forces the real duration to be calculated.
      if (!Number.isFinite(video.duration)) {
        video.currentTime = 1e101;
        video.ontimeupdate = () => {
          video.ontimeupdate = null;
          captureFrame();
        };
      } else {
        captureFrame();
      }
    };

    video.src = url;
  });
}
