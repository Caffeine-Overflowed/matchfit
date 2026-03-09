"use client";

import {useRef, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {HiXMark} from "react-icons/hi2";
import {useCreateEvent} from "@/features/events";
import {useSports} from "@/features/onboarding/hooks/use-sports";
import {ImageCropper} from "@/features/onboarding/components/image-cropper";
import {MapPicker} from "@/shared/components/map-picker";
import {Textarea} from "@/shared/components/ui/textarea";
import {ChatKind, DifficultyLevel, EventCategory, EventPrivacy,} from "@/shared/api/graphql";

// Category options
const CATEGORIES = [
    {value: EventCategory.Trip, label: "Trip", icon: "/icons/gym.svg"},
    {value: EventCategory.Sport, label: "Sport", icon: "/icons/gym.svg"},
    {value: EventCategory.Lecture, label: "Lecture", icon: "/icons/gym.svg"},
    {value: EventCategory.Workshop, label: "Workshop", icon: "/icons/gym.svg"},
];

// Difficulty options
const DIFFICULTIES = [
    {value: DifficultyLevel.Easy, label: "Easy"},
    {value: DifficultyLevel.Medium, label: "Medium"},
    {value: DifficultyLevel.Hard, label: "Hard"},
    {value: DifficultyLevel.NA, label: "Not applicable"},
];

// Privacy options
const PRIVACIES = [
    {value: EventPrivacy.Public, label: "Public"},
    {value: EventPrivacy.FriendsOnly, label: "Friends only"},
];

export default function CreateEventPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {createEvent, isLoading} = useCreateEvent();
    const {sports} = useSports();

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<EventCategory>(EventCategory.Sport);
    const [selectedSportIds, setSelectedSportIds] = useState<number[]>([]);
    const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.NA);
    const [privacy, setPrivacy] = useState<EventPrivacy>(EventPrivacy.Public);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    // TODO: Implement location picker
    const [location, setLocation] = useState({lat: 0, lon: 0, address: ""});
    const [targetParticipants, setTargetParticipants] = useState<number | null>(null);
    const [allowParticipantsToWrite, setAllowParticipantsToWrite] = useState(true);

    // Photo state
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);

    // Picker states
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showSportsPicker, setShowSportsPicker] = useState(false);
    const [showDifficultyPicker, setShowDifficultyPicker] = useState(false);
    const [showPrivacyPicker, setShowPrivacyPicker] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImageToCrop(previewUrl);
        }
        e.target.value = "";
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        const file = new File([croppedBlob], "event-photo.jpg", {type: "image/jpeg"});
        const previewUrl = URL.createObjectURL(croppedBlob);
        setPhotoFile(file);
        setPhotoPreview(previewUrl);
        setImageToCrop(null);
    };

    const handleRemovePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
    };

    const handleToggleSport = (sportId: number) => {
        setSelectedSportIds((prev) =>
            prev.includes(sportId)
                ? prev.filter((id) => id !== sportId)
                : [...prev, sportId]
        );
    };

    const handleCreate = async () => {
        if (!title.trim()) {
            alert("Enter event title");
            return;
        }

        if (!date || !time) {
            alert("Select date and time");
            return;
        }

        if (!photoFile) {
            alert("Add event photo");
            return;
        }

        // Combine date and time into ISO string
        const startTime = new Date(`${date}T${time}`).toISOString();

        const result = await createEvent({
            title: title.trim(),
            description: description.trim() || undefined,
            category,
            sportIds: selectedSportIds.length > 0 ? selectedSportIds : undefined,
            difficulty,
            privacy,
            startTime,
            lat: location.lat || 44.7866, // Default Belgrade coordinates
            lon: location.lon || 20.4489,
            targetParticipants: targetParticipants || undefined,
            chatType: allowParticipantsToWrite ? ChatKind.Group : ChatKind.Channel,
            imageFileName: photoFile,
        });

        if (result) {
            router.push("/home");
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-4 bg-white border-b border-border-secondary shrink-0">
                <Link href="/home" className="text-[16px] font-medium text-brand-600">
                    Cancel
                </Link>
                <span className="text-[16px] font-semibold text-text-primary">
                    Create event
                </span>
                <div className="w-[60px]"/>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
                {/* Photo */}
                <div className="mb-6">
                    {photoPreview ? (
                        <div className="relative h-[200px] rounded-xl overflow-hidden">
                            <img
                                src={photoPreview}
                                alt="Event photo"
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={handleRemovePhoto}
                                className="absolute top-2 right-2 w-[30px] h-[30px] rounded-full bg-white/80 flex items-center justify-center"
                            >
                                <HiXMark className="w-4 h-4 text-gray-600"/>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-[200px] border-2 border-dashed border-border-secondary rounded-xl flex flex-col items-center justify-center gap-2"
                        >
                            <img src="/icons/camera.svg" alt="" width={32} height={32} className="opacity-40"/>
                            <span className="text-[14px] text-text-tertiary">
                                Add photo
                            </span>
                        </button>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                    />
                </div>

                {/* Title */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[16px] font-medium text-text-primary">Title</span>
                        <span className="px-3 py-1 rounded-full bg-brand-600 text-[12px] text-white">
                            Important
                        </span>
                    </div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter event title"
                        className="w-full h-12 px-4 rounded-xl border border-border-secondary text-[14px] text-text-primary placeholder:text-text-tertiary"
                    />
                </div>

                {/* Description */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[16px] font-medium text-text-primary">Description</span>
                        <span className="px-3 py-1 rounded-full bg-brand-600 text-[12px] text-white">
                            Important
                        </span>
                    </div>
                    <div className="relative">
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                            placeholder="Tell about the event..."
                            className="min-h-[100px] rounded-xl border-border-secondary resize-none"
                        />
                        <span className="absolute bottom-2 right-3 text-[12px] text-text-tertiary">
                            {500 - description.length}
                        </span>
                    </div>
                </div>

                {/* Category */}
                <div className="mb-4 relative">
                    <span className="text-[16px] font-medium text-text-primary mb-2 block">
                        Event type
                    </span>
                    <button
                        onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                        className="w-full flex items-center justify-between px-3 py-3 rounded-xl border border-border-secondary bg-white"
                    >
                        <div className="flex items-center gap-2">
                            <img src="/icons/gym.svg" alt="" width={20} height={20}/>
                            <span className="text-[14px] text-text-primary">
                                {CATEGORIES.find((c) => c.value === category)?.label}
                            </span>
                        </div>
                        <img src="/icons/chevron-right.svg" alt="" width={20} height={20}/>
                    </button>
                    {showCategoryPicker && (
                        <div
                            className="absolute left-0 right-0 z-20 mt-2 bg-white border border-border-secondary rounded-xl shadow-lg p-3">
                            <div className="flex flex-col gap-1">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.value}
                                        onClick={() => {
                                            setCategory(cat.value);
                                            setShowCategoryPicker(false);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] ${
                                            category === cat.value
                                                ? "bg-brand-50 text-brand-600"
                                                : "text-text-primary hover:bg-gray-50"
                                        }`}
                                    >
                                        <img src={cat.icon} alt="" width={20} height={20}/>
                                        <span>{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sports */}
                <div className="mb-4 relative">
                    <span className="text-[16px] font-medium text-text-primary mb-3 block">
                        Topic
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
                                        <HiXMark className="w-4 h-4 text-text-tertiary"/>
                                    </button>
                                </div>
                            );
                        })}
                        <button
                            onClick={() => setShowSportsPicker(!showSportsPicker)}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white"
                        >
                            <img src="/icons/plus.svg" alt="" width={16} height={16} className="invert"/>
                        </button>
                    </div>
                    {showSportsPicker && (
                        <div
                            className="absolute left-0 right-0 z-20 mt-2 max-h-[200px] overflow-y-auto bg-white border border-border-secondary rounded-xl shadow-lg p-3">
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

                {/* Difficulty */}
                <div className="mb-4 relative">
                    <span className="text-[16px] font-medium text-text-primary mb-2 block">
                        Difficulty
                    </span>
                    <button
                        onClick={() => setShowDifficultyPicker(!showDifficultyPicker)}
                        className="w-full flex items-center justify-between px-3 py-3 rounded-xl border border-border-secondary bg-white"
                    >
                        <div className="flex items-center gap-2">
                            <img src="/icons/difficulty-easy.svg" alt="" width={20} height={20}/>
                            <span className="text-[14px] text-text-primary">
                                {DIFFICULTIES.find((d) => d.value === difficulty)?.label}
                            </span>
                        </div>
                        <img src="/icons/chevron-right.svg" alt="" width={20} height={20}/>
                    </button>
                    {showDifficultyPicker && (
                        <div
                            className="absolute left-0 right-0 z-20 mt-2 bg-white border border-border-secondary rounded-xl shadow-lg p-3">
                            <div className="flex flex-col gap-1">
                                {DIFFICULTIES.map((diff) => (
                                    <button
                                        key={diff.value}
                                        onClick={() => {
                                            setDifficulty(diff.value);
                                            setShowDifficultyPicker(false);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] ${
                                            difficulty === diff.value
                                                ? "bg-brand-50 text-brand-600"
                                                : "text-text-primary hover:bg-gray-50"
                                        }`}
                                    >
                                        <span>{diff.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Location */}
                <div className="mb-4">
                    <span className="text-[16px] font-medium text-text-primary mb-2 block">
                        Location
                    </span>
                    <button
                        onClick={() => setShowMapPicker(true)}
                        className="w-full flex items-center justify-between px-3 py-3 rounded-xl border border-border-secondary bg-white"
                    >
                        <div className="flex items-center gap-2">
                            <img src="/icons/location.svg" alt="" width={20} height={20}/>
                            <span className={`text-[14px] ${location.address ? "text-text-primary" : "text-text-tertiary"}`}>
                                {location.address || "Select location"}
                            </span>
                        </div>
                        <img src="/icons/chevron-right.svg" alt="" width={20} height={20}/>
                    </button>
                </div>

                {/* Date */}
                <div className="mb-4">
                    <span className="text-[16px] font-medium text-text-primary mb-2 block">
                        Date
                    </span>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <img src="/icons/calendar.svg" alt="" width={20} height={20}/>
                        </div>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full h-12 pl-10 pr-4 rounded-xl border border-border-secondary text-[14px] text-text-primary"
                        />
                    </div>
                </div>

                {/* Time */}
                <div className="mb-4">
                    <span className="text-[16px] font-medium text-text-primary mb-2 block">
                        Time
                    </span>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <img src="/icons/time.svg" alt="" width={20} height={20}/>
                        </div>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full h-12 pl-10 pr-4 rounded-xl border border-border-secondary text-[14px] text-text-primary"
                        />
                    </div>
                </div>

                {/* Participants */}
                <div className="mb-4">
                    <span className="text-[16px] font-medium text-text-primary mb-2 block">
                        Number of participants
                    </span>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <img src="/icons/users.svg" alt="" width={20} height={20}/>
                        </div>
                        <input
                            type="number"
                            value={targetParticipants ?? ""}
                            onChange={(e) => setTargetParticipants(e.target.value ? Number(e.target.value) : null)}
                            placeholder="No limit"
                            min={1}
                            max={1000}
                            className="w-full h-12 pl-10 pr-4 rounded-xl border border-border-secondary text-[14px] text-text-primary placeholder:text-text-tertiary"
                        />
                    </div>
                </div>

                {/* Privacy */}
                <div className="mb-4 relative">
                    <span className="text-[16px] font-medium text-text-primary mb-2 block">
                        Privacy
                    </span>
                    <button
                        onClick={() => setShowPrivacyPicker(!showPrivacyPicker)}
                        className="w-full flex items-center justify-between px-3 py-3 rounded-xl border border-border-secondary bg-white"
                    >
                        <div className="flex items-center gap-2">
                            <img src="/icons/lock.svg" alt="" width={20} height={20}/>
                            <span className="text-[14px] text-text-primary">
                                {PRIVACIES.find((p) => p.value === privacy)?.label}
                            </span>
                        </div>
                        <img src="/icons/chevron-right.svg" alt="" width={20} height={20}/>
                    </button>
                    {showPrivacyPicker && (
                        <div
                            className="absolute left-0 right-0 z-20 mt-2 bg-white border border-border-secondary rounded-xl shadow-lg p-3">
                            <div className="flex flex-col gap-1">
                                {PRIVACIES.map((priv) => (
                                    <button
                                        key={priv.value}
                                        onClick={() => {
                                            setPrivacy(priv.value);
                                            setShowPrivacyPicker(false);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] ${
                                            privacy === priv.value
                                                ? "bg-brand-50 text-brand-600"
                                                : "text-text-primary hover:bg-gray-50"
                                        }`}
                                    >
                                        <span>{priv.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat permissions */}
                <div className="mb-6 flex items-center justify-between">
                    <span className="text-[14px] text-text-primary">
                        Allow participants to write in chat
                    </span>
                    <button
                        type="button"
                        onClick={() => setAllowParticipantsToWrite(!allowParticipantsToWrite)}
                        className="flex items-center justify-center w-5 h-5 rounded border border-border-secondary bg-white text-brand-600 transition-colors"
                    >
                        {allowParticipantsToWrite && (
                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                <path
                                    d="M1 5L4.5 8.5L11 1.5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Create button */}
                <button
                    onClick={handleCreate}
                    disabled={isLoading || !title.trim()}
                    className="w-full h-14 rounded-xl bg-brand-600 text-white text-[16px] font-semibold disabled:opacity-50"
                >
                    {isLoading ? "Creating..." : "Create"}
                </button>
            </div>

            {/* Image Cropper Modal */}
            {imageToCrop && (
                <ImageCropper
                    image={imageToCrop}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setImageToCrop(null)}
                    type={"1/1"}
                />
            )}

            {/* Map Picker Modal */}
            {showMapPicker && (
                <MapPicker
                    initialLat={location.lat || undefined}
                    initialLon={location.lon || undefined}
                    onConfirm={(loc) => {
                        setLocation(loc);
                        setShowMapPicker(false);
                    }}
                    onCancel={() => setShowMapPicker(false)}
                />
            )}
        </div>
    );
}
