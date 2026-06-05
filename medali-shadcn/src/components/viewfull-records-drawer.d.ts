import type { Patient } from "./medical_records";
type FullRecordsDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient: Patient;
};
export declare function FullRecordsDrawer({ open, onOpenChange, patient: patient, }: FullRecordsDrawerProps): import("react/jsx-runtime").JSX.Element;
export {};
