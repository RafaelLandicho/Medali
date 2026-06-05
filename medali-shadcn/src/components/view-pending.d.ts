import { type ColumnDef } from "@tanstack/react-table";
export type MedicalHistory = {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    age: number;
    birthdate: string;
    patientDiagnosis: {
        diagnosis: string;
        severity: string;
        notes: string;
    }[];
    address: string;
    telephone: string;
    addedBy: string;
    bloodPressure?: string;
    heartRate?: string;
    respiratoryRate?: string;
    temperature?: string;
    oxygenSaturation?: string;
};
export type Patient = {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    age: number;
    birthdate: string;
    patientDiagnosis: {
        diagnosis: string;
        severity: string;
        notes: string;
    }[];
    address: string;
    telephone: string;
    addedBy: string;
    bloodPressure?: string;
    heartRate?: string;
    respiratoryRate?: string;
    temperature?: string;
    oxygenSaturation?: string;
    status?: string;
    medicalHistory?: {
        [key: string]: MedicalHistory;
    };
};
export declare const columns: ColumnDef<Patient>[];
export declare function PendingRecords(): import("react/jsx-runtime").JSX.Element;
