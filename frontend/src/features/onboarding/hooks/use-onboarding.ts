"use client";

import { useState, useCallback, useMemo } from "react";
import type { OnboardingStep, OnboardingData, ProfileData } from "../types";
import { goalsSchema, sportsSchema, languagesSchema, profileSchema, locationSchema } from "../schemas";

const STEPS: OnboardingStep[] = ["goals", "sports", "languages", "profile", "location"];

const INITIAL_DATA: OnboardingData = {
    goalIds: [],
    sportIds: [],
    languageIds: [],
    profile: {
        name: "",
        birthYear: null,
        birthMonth: null,
        gender: null,
        chronotype: null,
        height: null,
        weight: null,
        avatar: null,
        avatarPreview: null,
        bio: ""
    },
    location: null,
};

export function useOnboarding() {
    const [currentStep, setCurrentStep] = useState<OnboardingStep>("goals");
    const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const currentStepIndex = STEPS.indexOf(currentStep);
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === STEPS.length - 1;
    const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

    const validateStep = useCallback((step: OnboardingStep): { valid: boolean; errors: Record<string, string> } => {
        const stepErrors: Record<string, string> = {};

        let result;
        switch (step) {
            case "goals":
                console.log(data)
                result = goalsSchema.safeParse({ goalIds: data.goalIds });
                console.log(result)
                break;
            case "sports":
                result = sportsSchema.safeParse({ sportIds: data.sportIds });
                break;
            case "languages":
                result = languagesSchema.safeParse({ languageIds: data.languageIds });
                break;
            case "profile":
                result = profileSchema.safeParse({
                    name: data.profile.name,
                    birthYear: data.profile.birthYear,
                    birthMonth: data.profile.birthMonth,
                    gender: data.profile.gender,
                    chronotype: data.profile.chronotype,
                    avatar: data.profile.avatar,
                    height: data.profile.height,
                    weight: data.profile.weight,
                    bio: data.profile.bio,
                });
                break;
            case "location":
                result = locationSchema.safeParse({ location: data.location });
                break;
            default:
                return { valid: false, errors: {} };
        }

        if (result.success) {
            return { valid: true, errors: {} };
        }

        result.error.issues.forEach((issue) => {
            const field = issue.path.join(".");
            stepErrors[field] = issue.message;
        });

        return { valid: false, errors: stepErrors };
    }, [data]);

    const canProceed = useMemo(() => {
        if (currentStep === "location") return true;
        return validateStep(currentStep).valid;
    }, [currentStep, validateStep]);

    const goNext = useCallback(() => {
        if (!isLastStep) {
            setCurrentStep(STEPS[currentStepIndex + 1]);
        }
    }, [isLastStep, currentStepIndex]);

    const goBack = useCallback(() => {
        if (!isFirstStep) {
            setCurrentStep(STEPS[currentStepIndex - 1]);
        }
    }, [isFirstStep, currentStepIndex]);

    const selectGoal = useCallback((goalId: number) => {
        setData((prev) => ({
            ...prev,
            goalIds: prev.goalIds.includes(goalId) ? [] : [goalId],
        }));
    }, []);

    const toggleSport = useCallback((sportId: number) => {
        setData((prev) => ({
            ...prev,
            sportIds: prev.sportIds.includes(sportId)
                ? prev.sportIds.filter((id) => id !== sportId)
                : [...prev.sportIds, sportId],
        }));
    }, []);

    const toggleLanguage = useCallback((languageId: string) => {
        setData((prev) => {
            const isSelected = prev.languageIds.includes(languageId);
            if (isSelected) {
                return { ...prev, languageIds: prev.languageIds.filter((id) => id !== languageId) };
            }
            if (prev.languageIds.length >= 5) {
                return prev;
            }
            return { ...prev, languageIds: [...prev.languageIds, languageId] };
        });
    }, []);

    const updateProfile = useCallback((profile: ProfileData) => {
        setData((prev) => ({ ...prev, profile }));
    }, []);

    const updateLocation = useCallback((location: { lat: number; lon: number } | null) => {
        setData((prev) => ({ ...prev, location }));
    }, []);

    const reset = useCallback(() => {
        setCurrentStep("goals");
        setData(INITIAL_DATA);
    }, []);

    const getStepErrors = useCallback(() => {
        return validateStep(currentStep).errors;
    }, [currentStep, validateStep]);

    return {
        currentStep,
        data,
        errors,
        isFirstStep,
        isLastStep,
        canProceed,
        progress,
        goNext,
        goBack,
        selectGoal,
        toggleSport,
        toggleLanguage,
        updateProfile,
        updateLocation,
        reset,
        validateStep,
        getStepErrors,
        setErrors,
    };
}
