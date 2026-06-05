import type { Prescription } from "./view-prescriptions";
type EditPrescriptionProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    prescription: Prescription;
};
export declare function EditPrescription({ prescription, onOpenChange, }: EditPrescriptionProps): import("react/jsx-runtime").JSX.Element;
export {};
