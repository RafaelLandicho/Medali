import type { Patient } from "./medical_records";
type FullDetails = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient: Patient;
};
export declare function ViewFullPatient({ patient }: FullDetails): import("react/jsx-runtime").JSX.Element;
export {};
