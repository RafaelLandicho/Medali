export type User = {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    field: string;
    medicalId: string;
    type: string;
    email: string;
    subSpecialty?: string[];
    profileDescription?: string;
    profileExperience?: number;
    profileCertification?: string[];
    profileAffiliation?: string[];
    schedule?: {
        clinic: string;
        description: string;
        day: string;
        time: string;
        fee: number;
    }[];
    requestedBy?: string[];
    requestedTo?: string[];
    doctors?: string[];
    secretaries: string[];
    uid?: string;
};
export declare function ViewUsers(): import("react/jsx-runtime").JSX.Element;
