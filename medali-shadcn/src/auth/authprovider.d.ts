type UserData = {
    uid: string;
    email: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    type?: string;
    medicalId?: string | null;
    doctors?: string[];
    secretaries?: string[];
    requestedTo?: string[];
    requestedBy: string[];
    field?: string | null;
};
type AuthContextType = {
    user: UserData | null;
    loading: boolean;
    logout: () => Promise<void>;
};
export declare const AuthProvider: ({ children }: {
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export declare const useAuth: () => AuthContextType;
export {};
