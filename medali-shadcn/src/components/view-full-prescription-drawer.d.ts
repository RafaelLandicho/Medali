import type { Prescription } from "./view-prescriptions";
type PrescriptionDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    prescription: Prescription;
};
export declare function FullPrescriptionDrawer({ open, onOpenChange, prescription, }: PrescriptionDrawerProps): import("react/jsx-runtime").JSX.Element;
export {};
