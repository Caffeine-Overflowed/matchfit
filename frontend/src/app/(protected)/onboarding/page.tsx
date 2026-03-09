"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiArrowLeft } from "react-icons/hi2";
import { Button } from "@/shared/components/ui/button";
import {
    LANGUAGES,
    GoalsStep,
    SportsStep,
    LanguagesStep,
    ProfileStep,
    LocationStep,
    STEP_INFO,
    useCreateProfile,
    useOnboarding,
    useSports,
} from "@/features/onboarding";
import {useGoals} from "@/features/onboarding/hooks/use-goals";
import {errorTranslation} from "@/shared/constants/errorTranslation";

export default function OnboardingPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        currentStep,
        data,
        isFirstStep,
        isLastStep,
        canProceed,
        goNext,
        goBack,
        selectGoal,
        toggleSport,
        toggleLanguage,
        updateProfile,
        updateLocation,
    } = useOnboarding();

    const {sports, isLoading: isSportsLoading} = useSports();
    const {goals, isLoading: isGoalsLoading} = useGoals();
    const {createProfile} = useCreateProfile();

    const handleNext = async () => {
        if (isLastStep) {
            setIsSubmitting(true);
            setSubmitError(null);
            try {
                await createProfile(data);
                router.push("/home");
            } catch (error) {
                console.error("Profile creation failed:", error);
                setSubmitError(
                    error instanceof Error ? errorTranslation[error.message] : "Failed to create profile"
                );
            } finally {
                setIsSubmitting(false);
            }
            return;
        }
        goNext();
    };

    const handleBack = () => {
        if (isFirstStep) {
            router.back();
            return;
        }
        goBack();
    };

    const stepInfo = STEP_INFO[currentStep];

    return (
        <div className="flex flex-1 flex-col py-6 sm:py-10">
            {/* Back button */}
            {
                !isFirstStep &&
                <button
                    type="button"
                    onClick={handleBack}
                    className="mb-4 sm:mb-6 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <HiArrowLeft className="h-4 w-4"/>
                </button>
            }

            {/* Header */}
            {stepInfo.title && (
                <div className="mb-6 sm:mb-8 text-center">
                    <h1 className="text-[20px] sm:text-[24px] font-medium text-text-primary">
                        {stepInfo.title}
                    </h1>
                    {stepInfo.subtitle && (
                        <p className="mt-2 text-[13px] sm:text-[14px] text-text-tertiary">
                            {stepInfo.subtitle}
                        </p>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-1 -mx-1">
                {currentStep === "goals" && (
                    <GoalsStep
                        goals={goals}
                        selectedGoals={data.goalIds}
                        onToggleGoal={selectGoal}
                        isLoading={isGoalsLoading}
                    />
                )}
                {currentStep === "sports" && (
                    <SportsStep
                        sports={sports}
                        selectedSportIds={data.sportIds}
                        onToggleSport={toggleSport}
                        isLoading={isSportsLoading}
                    />
                )}
                {currentStep === "languages" && (
                    <LanguagesStep
                        languages={LANGUAGES}
                        selectedLanguageIds={data.languageIds}
                        onToggleLanguage={toggleLanguage}
                    />
                )}
                {currentStep === "profile" && (
                    <ProfileStep
                        data={data.profile}
                        onChange={updateProfile}
                    />
                )}
                {currentStep === "location" && (
                    <LocationStep
                        location={data.location}
                        onChange={updateLocation}
                    />
                )}
            </div>

            {/* Error message */}
            {submitError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[14px] text-red-600">
                    {submitError}
                </div>
            )}

            {/* Footer */}
            <div className="mt-6 sm:mt-8">
                <Button
                    onClick={handleNext}
                    disabled={!canProceed || isSubmitting}
                    className="h-[44px] sm:h-[49px] w-full rounded-xl text-[15px] sm:text-[16px] font-medium"
                >
                    {isSubmitting ? "Saving..." : isLastStep ? (data.location ? "Finish" : "Skip") : "Next"}
                </Button>
            </div>
        </div>
    );
}
