"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

interface ImageCropperProps {
    image: string;
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
    type?: "9/16" | "1/1";
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d context");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob"));
        }, "image/jpeg", 0.9);
    });
}

export function ImageCropper({ image, onCropComplete, onCancel, type = "9/16" }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = useCallback((location: { x: number; y: number }) => {
        setCrop(location);
    }, []);

    const onZoomChange = useCallback((newZoom: number) => {
        setZoom(newZoom);
    }, []);

    const onCropAreaChange = useCallback((_: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error("Failed to crop image:", e);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black">
            {/* Cropper area */}
            <div className="relative flex-1">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={type === "9/16" ? 9 / 16 : 1}
                    cropShape="rect"
                    showGrid={false}
                    onCropChange={onCropChange}
                    onZoomChange={onZoomChange}
                    onCropComplete={onCropAreaChange}
                />
            </div>

            {/* Zoom slider */}
            <div className="px-8 py-4 bg-black">
                <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                />
            </div>

            {/* Buttons */}
            <div
                className="flex gap-3 p-4 bg-black"
                style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
            >
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 h-12 rounded-xl bg-gray-800 text-white text-[16px] font-medium"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    className="flex-1 h-12 rounded-xl bg-brand-600 text-white text-[16px] font-medium"
                >
                    Done
                </button>
            </div>
        </div>
    );
}
