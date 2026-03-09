import { z } from "zod";

export const goalsSchema = z.object({
    goalIds: z.array(z.number()).min(1, "Select at least one goal"),
});

export const sportsSchema = z.object({
    sportIds: z.array(z.number()).min(1, "Select at least one sport"),
});

export const languagesSchema = z.object({
    languageIds: z.array(z.string()).min(1, "Select at least one language").max(5, "Maximum 5 languages"),
});

const currentYear = new Date().getFullYear();

export const profileSchema = z.object({
    name: z
        .string({ error: "Enter your name" })
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name is too long"),
    birthYear: z
        .number({ error: "Select your birth year" })
        .min(1920, "Invalid year")
        .max(currentYear - 18, "You must be at least 18 years old"),
    birthMonth: z
        .number({ error: "Select your birth month" })
        .min(1, "Invalid month")
        .max(12, "Invalid month"),
    gender: z.enum(["male", "female", "other"], { error: "Select your gender" }),
    chronotype: z.enum(["EARLY_BIRD", "NIGHT_OWL", "PIGEON"], { error: "Select your chronotype" }),
    avatar: z.instanceof(File, { error: "Add a profile photo" }),
    height: z
        .number()
        .min(100, "Invalid height")
        .max(250, "Invalid height")
        .nullable()
        .optional(),
    weight: z
        .number()
        .min(30, "Invalid weight")
        .max(300, "Invalid weight")
        .nullable()
        .optional(),
});

export const locationSchema = z.object({
    location: z.object({
        lat: z.number().min(-90).max(90),
        lon: z.number().min(-180).max(180),
    }).nullable(),
});

export const onboardingSchema = z.object({
    goals: goalsSchema.shape.goalIds,
    sportIds: sportsSchema.shape.sportIds,
    languageIds: languagesSchema.shape.languageIds,
    profile: profileSchema,
    location: locationSchema.shape.location,
});

export type GoalsFormData = z.infer<typeof goalsSchema>;
export type SportsFormData = z.infer<typeof sportsSchema>;
export type LanguagesFormData = z.infer<typeof languagesSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type LocationFormData = z.infer<typeof locationSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
