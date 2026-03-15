"use client";
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ImageCropModalProps {
    imageSrc: string;
    aspect?: number; // e.g. 1 for square, 16/9 for cover, undefined for free
    onCropDone: (croppedBlob: Blob) => void;
    onSkip?: () => void;
    onCancel: () => void;
    title?: string;
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => { image.onload = resolve; });

    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y,
        pixelCrop.width, pixelCrop.height,
        0, 0,
        pixelCrop.width, pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Canvas is empty"));
        }, "image/jpeg", 0.92);
    });
}

export default function ImageCropModal({ imageSrc, aspect, onCropDone, onSkip, onCancel, title = "Crop Image" }: ImageCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleDone = async () => {
        if (!croppedAreaPixels) return;
        const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
        onCropDone(blob);
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex flex-col items-center justify-center p-4">
            <div className="bg-[#1a1625] rounded-2xl w-full max-w-lg overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <span className="text-white font-semibold text-lg">{title}</span>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
                </div>

                {/* Crop area */}
                <div className="relative w-full" style={{ height: "360px" }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                {/* Zoom slider */}
                <div className="p-4 flex items-center gap-3">
                    <span className="text-gray-400 text-sm">Zoom</span>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.01}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="flex-1 accent-[#FF4E27]"
                    />
                </div>

                <div className="p-4 pt-0 flex gap-3 justify-end">
                    <button onClick={onCancel} className="px-5 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600">Cancel</button>
                    {onSkip && <button onClick={onSkip} className="px-5 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500">Skip</button>}
                    <button onClick={handleDone} className="px-5 py-2 rounded-lg bg-[#FF4E27] text-white hover:bg-[#e5431f] font-semibold">Apply</button>
                </div>
            </div>
        </div>
    );
}
