"use client";
import { useEffect, useRef, useState, memo } from "react";

interface HLSVideoProps {
    s3Key: string;
    className?: string;
}

function HLSVideo({ s3Key, className }: HLSVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<any>(null);
    const [status, setStatus] = useState<"loading" | "processing" | "ready" | "error">("loading");
    const [hlsUrl, setHlsUrl] = useState<string | null>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 60;

        const checkStatus = async () => {
            try {
                const res = await fetch(`/api/video/status?key=${encodeURIComponent(s3Key)}`);
                const data = await res.json();
                if (data.status === "ready") {
                    setHlsUrl(data.hlsUrl);
                    setStatus("ready");
                } else if (data.status === "processing") {
                    setStatus("processing");
                    if (++attempts < maxAttempts) pollRef.current = setTimeout(checkStatus, 5000);
                    else setStatus("error");
                } else {
                    setStatus("error");
                }
            } catch { setStatus("error"); }
        };

        checkStatus();
        return () => { if (pollRef.current) clearTimeout(pollRef.current); };
    }, [s3Key]);

    useEffect(() => {
        if (!hlsUrl || !videoRef.current) return;
        const video = videoRef.current;

        hlsRef.current?.destroy();
        hlsRef.current = null;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = hlsUrl;
            return;
        }

        import("hls.js").then(({ default: Hls }) => {
            if (!Hls.isSupported()) { video.src = hlsUrl; return; }
            const hls = new Hls({ enableWorker: true });
            hls.loadSource(hlsUrl);
            hls.attachMedia(video);
            hlsRef.current = hls;
        });

        return () => { hlsRef.current?.destroy(); hlsRef.current = null; };
    }, [hlsUrl]);

    if (status === "loading" || status === "processing") {
        return (
            <div className={`bg-[#2a2a2a] flex flex-col items-center justify-center gap-2 ${className}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4E27]" />
                <span className="text-gray-400 text-sm">
                    {status === "processing" ? "Processing video..." : "Loading..."}
                </span>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className={`bg-[#2a2a2a] flex items-center justify-center ${className}`}>
                <span className="text-gray-400 text-sm">Video unavailable</span>
            </div>
        );
    }

    return (
        <video
            ref={videoRef}
            controls
            preload="metadata"
            className={className}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
    );
}

export default memo(HLSVideo);
