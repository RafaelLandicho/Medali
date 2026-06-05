import type { Patient } from "./medical_records";
type FullDetails = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient: Patient;
};
export declare function ViewFullPatient({ patient, onOpenChange }: FullDetails): import("react/jsx-runtime").JSX.Element;
export {};
