/**
 * Generate a thumbnail from a video file at a given time (default 1s).
 * Returns a data URL (base64 JPEG).
 */
export function generateVideoThumbnail(file: File, seekTo = 1): Promise<string> {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;

        const url = URL.createObjectURL(file);
        video.src = url;

        video.onloadedmetadata = () => {
            video.currentTime = Math.min(seekTo, video.duration / 2);
        };

        video.onseeked = () => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d")!.drawImage(video, 0, 0);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
        };

        video.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load video")); };
    });
}
