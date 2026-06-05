import { type ColumnDef } from "@tanstack/react-table";
export type Prescription = {
    id: string;
    patientFirstName: string;
    patientLastName: string;
    patientGender?: string;
    patientAge?: number;
    patientAddress: string;
    doctorId: string;
    diagnosis: {
        diagnosis: string;
        severity: string;
        notes: string;
    }[];
    drugs: {
        medicine: string;
        dosage: string;
        unit: string;
        purpose: string;
        frequency: string;
    }[];
    examination: number | string;
    recommendation: string;
    addedBy: string;
    field: string;
    createdBy: string;
    createdAt: string;
};
export declare const columns: ColumnDef<Prescription>[];
export declare function Prescriptions(): import("react/jsx-runtime").JSX.Element;
