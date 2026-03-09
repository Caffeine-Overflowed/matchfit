export interface UserGoal {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export interface UserBasicInfo {
    height?: number;
    weight?: number;
    chronotype?: string;
}

export interface UserProfile {
    id: string;
    name: string;
    age: number;
    location: string;
    distance?: string;
    goal?: string;
    avatar: string | null;
    bio?: string;
    goals?: UserGoal[];
    interests: string[];
    sports?: string[];
    basicInfo?: UserBasicInfo;
    languages?: string[];
    places?: string[];
}

export interface InterestFilter {
    id: string;
    label: string;
    icon: string;
}
