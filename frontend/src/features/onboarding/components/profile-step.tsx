"use client";

import { useRef, useState } from "react";
import { HiCamera } from "react-icons/hi2";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/lib/utils";
import type { ProfileData, Gender } from "../types";
import { Chronotype } from "../types";
import { ImageCropper } from "./image-cropper";
import {Textarea} from "@/shared/components/ui/textarea";

interface ProfileStepProps {
    data: ProfileData;
    onChange: (data: ProfileData) => void;
}

const MONTHS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

const GENDERS: { value: Gender; label: string }[] = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
];

const CHRONOTYPES: { value: Chronotype; label: string; emoji: string }[] = [
    { value: Chronotype.EarlyBird, label: "Early Bird", emoji: "🌅" },
    { value: Chronotype.Pigeon, label: "Pigeon", emoji: "🕊️" },
    { value: Chronotype.NightOwl, label: "Night Owl", emoji: "🦉" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => currentYear - 18 - i);

export function ProfileStep({ data, onChange }: ProfileStepProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImageToCrop(previewUrl);
        }
        // Reset input so same file can be selected again
        e.target.value = "";
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
        const previewUrl = URL.createObjectURL(croppedBlob);
        onChange({ ...data, avatar: file, avatarPreview: previewUrl });
        setImageToCrop(null);
    };

    const handleCropCancel = () => {
        setImageToCrop(null);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col gap-4 sm:gap-5">
            {/* Avatar upload */}
            <div className="flex justify-center">
                <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gray-100 overflow-hidden border-2 border-dashed border-gray-300 hover:border-brand-600 transition-colors"
                >
                    {data.avatarPreview ? (
                        <img
                            src={data.avatarPreview}
                            alt="Avatar"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <HiCamera className="h-6 w-6 sm:h-8 sm:w-8"/>
                            <span className="text-[11px] sm:text-[12px] mt-1">Photo</span>
                        </div>
                    )}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                />
            </div>

            {/* Name */}
            <div className="space-y-1.5">
                <Label className="text-[14px] text-text-primary">Name</Label>
                <Input
                    placeholder="Your name"
                    value={data.name}
                    onChange={(e) => onChange({...data, name: e.target.value})}
                    className="h-[39px] sm:h-[44px] rounded-xl border-gray-300 text-[14px]"
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-[14px] text-text-primary">About you</Label>
                <Textarea
                    placeholder="Write something about yourself"
                    value={data.bio}
                    onChange={(e) => onChange({...data, bio: e.target.value})}
                    className=" rounded-xl border-gray-300 text-[14px]"
                />
            </div>

            {/* Birth date */}
            <div className="space-y-1.5">
                <Label className="text-[14px] text-text-primary">Date of birth</Label>
                <div className="grid grid-cols-2 gap-3">
                    <select
                        value={data.birthMonth ?? ""}
                        onChange={(e) => onChange({
                            ...data,
                            birthMonth: e.target.value ? Number(e.target.value) : null
                        })}
                        className="h-[39px] sm:h-[44px] rounded-xl border border-gray-300 bg-white px-3 text-[14px] outline-none focus:border-white focus:ring-2 focus:ring-brand-600"
                    >
                        <option value="">Month</option>
                        {MONTHS.map((month) => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={data.birthYear ?? ""}
                        onChange={(e) => onChange({...data, birthYear: e.target.value ? Number(e.target.value) : null})}
                        className="h-[39px] sm:h-[44px] rounded-xl border border-gray-300 bg-white px-3 text-[14px] outline-none focus:border-white focus:ring-2 focus:ring-brand-600"
                    >
                        <option value="">Year</option>
                        {YEARS.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
                <Label className="text-[14px] text-text-primary">Gender</Label>
                <div className="flex gap-2">
                    {GENDERS.map((gender) => (
                        <button
                            key={gender.value}
                            type="button"
                            onClick={() => onChange({...data, gender: gender.value})}
                            className={cn(
                                "flex-1 h-[39px] sm:h-[44px] rounded-xl text-[14px] transition-all",
                                data.gender === gender.value
                                    ? "bg-brand-600 text-white"
                                    : "bg-gray-100 text-text-primary hover:bg-gray-200"
                            )}
                        >
                            {gender.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chronotype */}
            <div className="space-y-1.5">
                <Label className="text-[14px] text-text-primary">Chronotype</Label>
                <div className="flex gap-2">
                    {CHRONOTYPES.map((chrono) => (
                        <button
                            key={chrono.value}
                            type="button"
                            onClick={() => onChange({...data, chronotype: chrono.value})}
                            className={cn(
                                "flex-1 h-[39px] sm:h-[44px] rounded-xl text-[14px] transition-all flex items-center justify-center gap-1",
                                data.chronotype === chrono.value
                                    ? "bg-brand-600 text-white"
                                    : "bg-gray-100 text-text-primary hover:bg-gray-200"
                            )}
                        >
                            <span>{chrono.emoji}</span>
                            <span>{chrono.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Height & Weight (optional) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pb-1">
                <div className="space-y-1.5">
                    <Label className="text-[14px] text-text-tertiary">Height (cm)</Label>
                    <Input
                        type="number"
                        placeholder="175"
                        value={data.height ?? ""}
                        onChange={(e) => onChange({...data, height: e.target.value ? Number(e.target.value) : null})}
                        className="h-[39px] sm:h-[44px] rounded-xl border-gray-300 text-[14px]"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-[14px] text-text-tertiary">Weight (kg)</Label>
                    <Input
                        type="number"
                        placeholder="70"
                        value={data.weight ?? ""}
                        onChange={(e) => onChange({...data, weight: e.target.value ? Number(e.target.value) : null})}
                        className="h-[39px] sm:h-[44px] rounded-xl border-gray-300 text-[14px]"
                    />
                </div>
            </div>

            {/* Image Cropper Modal */}
            {imageToCrop && (
                <ImageCropper
                    image={imageToCrop}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}
        </div>
    );
}
