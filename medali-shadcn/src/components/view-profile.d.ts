export type UserData = {
    uid: string;
    email: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    type?: string;
    medicalId?: string | null;
    subSpecialty?: string[];
    profileEducation?: {
        school: string;
        residency: string;
        training: string;
    }[];
    schedule?: {
        clinic: string;
        description: string;
        day: string;
        time: string;
        fee: number;
    }[];
    faq?: {
        question: "";
        answer: "";
    }[];
    profileDescription?: string;
    profileExperience?: number;
    profileCertification?: string[];
    profileAffiliation?: string[];
    doctors?: string[];
    secretaries?: string[];
    requestedTo?: string[];
    requestedBy?: string[];
    field?: string | null;
    profileImage?: string;
};
export declare function ViewProfile(): import("react/jsx-runtime").JSX.Element;
