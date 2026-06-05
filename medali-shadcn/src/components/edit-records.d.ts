import type { Patient } from "./medical_records";
type EditRecordsSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient: Patient;
};
export declare function EditRecordsSheet({ open, onOpenChange, patient, }: EditRecordsSheetProps): import("react/jsx-runtime").JSX.Element;
export {};
