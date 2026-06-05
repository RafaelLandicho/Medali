import type { Prescription } from "./view-prescriptions";
type EditPrescriptionProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient: Prescription;
};
export declare function ViewFullPrescription({ patient: prescription, }: EditPrescriptionProps): import("react/jsx-runtime").JSX.Element;
export {};
