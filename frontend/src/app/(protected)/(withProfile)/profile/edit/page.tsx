"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiXMark } from "react-icons/hi2";
import { useProfile } from "@/features/auth";
import { useUpdateProfile } from "@/features/profile";
import { useSports } from "@/features/onboarding/hooks/use-sports";
import { useGoals } from "@/features/onboarding/hooks/use-goals";
import { LANGUAGES } from "@/features/onboarding/data";
import { ImageCropper } from "@/features/onboarding/components/image-cropper";
import { Textarea } from "@/shared/components/ui/textarea";
import { Chronotype } from "@/shared/api/graphql";
import { cn } from "@/lib/utils";

const CHRONOTYPES: { value: Chronotype; label: string; emoji: string }[] = [
    { value: Chronotype.EarlyBird, label: "Early Bird", emoji: "🌅" },
    { value: Chronotype.Pigeon, label: "Pigeon", emoji: "🕊️" },
    { value: Chronotype.NightOwl, label: "Night Owl", emoji: "🦉" },
];

export default function EditProfilePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { profile, isLoading: profileLoading } = useProfile();
    const { updateProfile, isLoading: updating } = useUpdateProfile();
    const { sports, isLoading: sportsLoading } = useSports();
    const { goals, isLoading: goalsLoading } = useGoals();

    // Form state
    const [bio, setBio] = useState("");
    const [selectedSportIds, setSelectedSportIds] = useState<number[]>([]);
    const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
    const [selectedChronotype, setSelectedChronotype] = useState<Chronotype | null>(null);
    const [height, setHeight] = useState<number | null>(null);
    const [weight, setWeight] = useState<number | null>(null);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

    // Avatar state
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);

    // Picker panels state
    const [showSportsPicker, setShowSportsPicker] = useState(false);
    const [showGoalPicker, setShowGoalPicker] = useState(false);
    const [showHeightPicker, setShowHeightPicker] = useState(false);
    const [showWeightPicker, setShowWeightPicker] = useState(false);
    const [showLanguagesPicker, setShowLanguagesPicker] = useState(false);


    // Initialize form from profile
    useEffect(() => {
        if (profile) {
            setBio(profile.bio ?? "");
            setSelectedSportIds(profile.sports.map((s) => s.id));
            setSelectedGoalId(profile.goals[0]?.id ?? null);
            setSelectedChronotype(profile.chronotype ?? null);
            setHeight(profile.height ?? null);
            setWeight(profile.weight ?? null);
            setSelectedLanguages(profile.languages ?? []);
            setAvatarPreview(profile.avatarUrl);
        }
    }, [profile]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImageToCrop(previewUrl);
        }
        e.target.value = "";
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
        const previewUrl = URL.createObjectURL(croppedBlob);
        setAvatarFile(file);
        setAvatarPreview(previewUrl);
        setImageToCrop(null);
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
    };

    const handleToggleSport = (sportId: number) => {
        setSelectedSportIds((prev) =>
            prev.includes(sportId)
                ? prev.filter((id) => id !== sportId)
                : [...prev, sportId]
        );
    };

    const handleToggleLanguage = (code: string) => {
        setSelectedLanguages((prev) =>
            prev.includes(code)
                ? prev.filter((c) => c !== code)
                : [...prev, code]
        );
    };

    const handleSave = async () => {
        if (!profile) return;

        // For update, we need to provide avatar file
        // If user didn't change avatar, we need to fetch the existing one
        let avatar = avatarFile;
        if (!avatar && avatarPreview) {
            // Fetch existing avatar as blob
            try {
                const response = await fetch(avatarPreview);
                const blob = await response.blob();
                avatar = new File([blob], "avatar.jpg", { type: "image/jpeg" });
            } catch {
                console.error("Failed to fetch existing avatar");
                return;
            }
        }

        if (!avatar) {
            console.error("Avatar is required");
            return;
        }

        if (!selectedChronotype) {
            console.error("Chronotype is required");
            return;
        }

        // Calculate birth year/month from age (approximate)
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - profile.age;
        const birthMonth = 1; // Default to January

        await updateProfile({
            name: profile.name,
            avatar,
            bio,
            birthYear,
            birthMonth,
            gender: profile.gender,
            chronotype: selectedChronotype,
            goalIds: selectedGoalId ? [selectedGoalId] : [],
            sportIds: selectedSportIds,
            height: height ?? undefined,
            weight: weight ?? undefined,
            languages: selectedLanguages,
        });

        router.push("/profile");
    };

    if (profileLoading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <span className="text-text-tertiary">Loading...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-white z-10">
                <Link href="/profile" className="text-[16px] font-medium text-brand-600">
                    Cancel
                </Link>
                <button
                    onClick={handleSave}
                    disabled={updating}
                    className="text-[16px] font-medium text-brand-600 disabled:opacity-50"
                >
                    {updating ? "..." : "Save"}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 pb-32 pt-4">
                {/* Photo */}
                <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                        <div className="relative h-[159px] w-[159px] rounded-xl overflow-hidden bg-gray-200">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Profile photo"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    No photo
                                </div>
                            )}
                        </div>
                        {avatarPreview && (
                            <button
                                onClick={handleRemoveAvatar}
                                className="absolute -top-2 -right-2 w-[30px] h-[30px] rounded-full bg-gray-200 flex items-center justify-center"
                            >
                                <HiXMark className="w-4 h-4 text-gray-600" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 flex items-center justify-center gap-2 w-full py-4 px-8 border border-border-secondary rounded-md bg-white"
                    >
                        <img src="/icons/edit.svg" alt="" width={16} height={16} />
                        <span className="text-[16px] font-medium text-text-primary">
                            Upload photo
                        </span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                    />
                </div>

                {/* Bio */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[16px] font-medium text-text-primary">About me</span>
                        <span className="px-3 py-1 rounded-full bg-brand-600 text-[12px] text-white">
                            Important
                        </span>
                    </div>
                    <div className="relative">
                        <Textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value.slice(0, 500))}
                            placeholder="Tell about yourself..."
                            className="min-h-[72px] rounded-xl border-border-secondary resize-none"
                        />
                        <span className="absolute bottom-2 right-3 text-[12px] text-text-tertiary">
                            {500 - bio.length}
                        </span>
                    </div>
                </div>

                {/* Sports */}
                <div className="mb-4 relative">
                    <span className="text-[16px] font-medium text-text-primary mb-3 block">
                        Sports
                    </span>
                    <div className="flex flex-wrap gap-[10px]">
                        {selectedSportIds.map((sportId) => {
                            const sport = sports.find((s) => s.id === sportId);
                            if (!sport) return null;
                            return (
                                <div
                                    key={sport.id}
                                    className="flex items-center gap-[10px] h-8 px-3 rounded-full bg-border-secondary text-[14px] text-text-tertiary"
                                >
                                    {sport.iconUrl && (
                                        <img
                                            src={sport.iconUrl}
                                            alt=""
                                            width={16}
                                            height={16}
                                        />
                                    )}
                                    <span>{sport.name}</span>
                                    <button onClick={() => handleToggleSport(sport.id)}>
                                        <HiXMark className="w-4 h-4 text-text-tertiary" />
                                    </button>
                                </div>
                            );
                        })}
                        <button
                            onClick={() => setShowSportsPicker(!showSportsPicker)}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white"
                        >
                            <img src="/icons/plus.svg" alt="" width={16} height={16} className="invert" />
                        </button>
                    </div>
                    {showSportsPicker && (
                        <div className="absolute left-0 right-0 z-20 mt-2 max-h-[200px] overflow-y-auto bg-white border border-border-secondary rounded-xl shadow-lg p-3">
                            <div className="flex flex-wrap gap-2">
                                {sports
                                    .filter((s) => !selectedSportIds.includes(s.id))
                                    .map((sport) => (
                                        <button
                                            key={sport.id}
                                            onClick={() => {
                                                handleToggleSport(sport.id);
                                                setShowSportsPicker(false);
                                            }}
                                            className="flex items-center gap-2 h-8 px-3 rounded-full bg-border-secondary text-[14px] text-text-tertiary hover:bg-gray-200"
                                        >
                                            {sport.iconUrl && (
                                                <img
                                                    src={sport.iconUrl}
                                                    alt=""
                                                    width={16}
                                                    height={16}
                                                />
                                            )}
                                            <span>{sport.name}</span>
                                        </button>
                                    ))}
                                {sports.filter((s) => !selectedSportIds.includes(s.id)).length === 0 && (
                                    <span className="text-text-tertiary text-[14px]">All selected</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Goal */}
                <div className="mb-4 relative">
                    <span className="text-[16px] font-medium text-text-primary mb-2 block">
                        Goal
                    </span>
                    <button
                        onClick={() => setShowGoalPicker(!showGoalPicker)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-border-secondary bg-white"
                    >
                        <div className="flex items-center gap-1">
                            {selectedGoalId && goals.find(g => g.id === selectedGoalId)?.iconUrl && (
                                <div
                                    className="w-4 h-4 bg-brand-600"
                                    style={{
                                        WebkitMaskImage: `url(${goals.find(g => g.id === selectedGoalId)!.iconUrl!})`,
                                        maskImage: `url(${goals.find(g => g.id === selectedGoalId)!.iconUrl!})`,
                                        WebkitMaskRepeat: "no-repeat",
                                        maskRepeat: "no-repeat",
                                        WebkitMaskPosition: "center",
                                        maskPosition: "center",
                                        WebkitMaskSize: "contain",
                                        maskSize: "contain",
                                    }}
                                />
                            )}
                            <span className="text-[14px] text-text-tertiary">
                                {selectedGoalId ? goals.find(g => g.id === selectedGoalId)?.name : "Select goal"}
                            </span>
                        </div>
                        <img src="/icons/chevron-right.svg" alt="" width={20} height={20} />
                    </button>
                    {showGoalPicker && (
                        <div className="absolute left-0 right-0 z-20 mt-2 max-h-[200px] overflow-y-auto bg-white border border-border-secondary rounded-xl shadow-lg p-3">
                            <div className="flex flex-col gap-1">
                                {goals.map((goal) => (
                                    <button
                                        key={goal.id}
                                        onClick={() => {
                                            setSelectedGoalId(goal.id);
                                            setShowGoalPicker(false);
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] text-text-tertiary hover:bg-gray-50"
                                    >
                                        {goal.iconUrl && (
                                            <img src={goal.iconUrl} alt="" width={16} height={16} />
                                        )}
                                        <span>{goal.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Chronotype */}
                <div className="mb-4">
                    <span className="text-[16px] font-medium text-text-primary mb-2 block">
                        Chronotype
                    </span>
                    <div className="flex gap-2">
                        {CHRONOTYPES.map((chrono) => (
                            <button
                                key={chrono.value}
                                type="button"
                                onClick={() => setSelectedChronotype(chrono.value)}
                                className={cn(
                                    "flex-1 h-[44px] rounded-xl text-[14px] transition-all flex items-center justify-center gap-1",
                                    selectedChronotype === chrono.value
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

                {/* Height */}
                <div className="mb-4 relative">
                    <span className="text-[16px] font-medium text-text-primary mb-2 block">
                        My height
                    </span>
                    <button
                        onClick={() => setShowHeightPicker(!showHeightPicker)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-border-secondary bg-white"
                    >
                        <div className="flex items-center gap-1">
                            <img src="/icons/height.svg" alt="" width={16} height={16} />
                            <span className="text-[14px] text-text-tertiary">
                                {height ? `${height} cm` : "Not specified"}
                            </span>
                        </div>
                        <img src="/icons/chevron-right.svg" alt="" width={20} height={20} />
                    </button>
                    {showHeightPicker && (
                        <div className="absolute left-0 right-0 z-20 mt-2 bg-white border border-border-secondary rounded-xl shadow-lg p-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={height ?? ""}
                                    onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : null)}
                                    placeholder="Enter height"
                                    className="flex-1 h-10 px-3 rounded-lg border border-border-secondary text-[14px]"
                                    min={100}
                                    max={250}
                                />
                                <span className="text-[14px] text-text-tertiary">cm</span>
                                <button
                                    onClick={() => setShowHeightPicker(false)}
                                    className="px-4 py-2 bg-brand-600 text-white rounded-lg text-[14px]"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Weight */}
                <div className="mb-4 relative">
                    <span className="text-[16px] font-medium text-text-primary mb-2 block">
                        My weight
                    </span>
                    <button
                        onClick={() => setShowWeightPicker(!showWeightPicker)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-border-secondary bg-white"
                    >
                        <div className="flex items-center gap-1">
                            <img src="/icons/weight.svg" alt="" width={16} height={16} />
                            <span className="text-[14px] text-text-tertiary">
                                {weight ? `${weight} kg` : "Not specified"}
                            </span>
                        </div>
                        <img src="/icons/chevron-right.svg" alt="" width={20} height={20} />
                    </button>
                    {showWeightPicker && (
                        <div className="absolute left-0 right-0 z-20 mt-2 bg-white border border-border-secondary rounded-xl shadow-lg p-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={weight ?? ""}
                                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : null)}
                                    placeholder="Enter weight"
                                    className="flex-1 h-10 px-3 rounded-lg border border-border-secondary text-[14px]"
                                    min={30}
                                    max={200}
                                />
                                <span className="text-[14px] text-text-tertiary">kg</span>
                                <button
                                    onClick={() => setShowWeightPicker(false)}
                                    className="px-4 py-2 bg-brand-600 text-white rounded-lg text-[14px]"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Languages */}
                <div className="mb-4 relative">
                    <span className="text-[16px] font-medium text-text-primary mb-2 block">
                        Languages I know
                    </span>
                    <button
                        onClick={() => setShowLanguagesPicker(!showLanguagesPicker)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-border-secondary bg-white"
                    >
                        <div className="flex items-center gap-1">
                            <img src="/icons/language.svg" alt="" width={16} height={16} />
                            <span className="text-[14px] text-text-tertiary">
                                {selectedLanguages.length > 0
                                    ? selectedLanguages
                                        .map(id => LANGUAGES.find(l => l.id === id)?.name)
                                        .filter(Boolean)
                                        .join(", ")
                                    : "Select languages"}
                            </span>
                        </div>
                        <img src="/icons/chevron-right.svg" alt="" width={20} height={20} />
                    </button>
                    {showLanguagesPicker && (
                        <div className="absolute left-0 right-0 z-20 mt-2 max-h-[240px] overflow-y-auto bg-white border border-border-secondary rounded-xl shadow-lg p-3">
                            <div className="flex flex-wrap gap-2">
                                {LANGUAGES.map((lang) => {
                                    const isSelected = selectedLanguages.includes(lang.id);
                                    return (
                                        <button
                                            key={lang.id}
                                            onClick={() => handleToggleLanguage(lang.id)}
                                            className={`flex items-center gap-2 h-8 px-3 rounded-full text-[14px] ${
                                                isSelected
                                                    ? "bg-brand-600 text-white"
                                                    : "bg-border-secondary text-text-tertiary hover:bg-gray-200"
                                            }`}
                                        >
                                            <span>{lang.flag}</span>
                                            <span>{lang.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setShowLanguagesPicker(false)}
                                className="mt-3 w-full py-2 bg-brand-600 text-white rounded-lg text-[14px]"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Cropper Modal */}
            {imageToCrop && (
                <ImageCropper
                    image={imageToCrop}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setImageToCrop(null)}
                />
            )}
        </div>
    );
}
