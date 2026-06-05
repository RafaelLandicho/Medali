import type { Patient } from "./medical_records";
type PrescriptionDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient: Patient;
};
export declare function PrescriptionDrawer({ open, onOpenChange, patient, }: PrescriptionDrawerProps): import("react/jsx-runtime").JSX.Element;
export {};
