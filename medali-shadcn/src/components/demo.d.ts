import { type ColumnDef } from "@tanstack/react-table";
export type Patient = {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    age: number;
    address: string;
    telephone: string;
    addedBy: string;
    bloodPressure?: string;
    heartRate?: string;
    respiratoryRate?: string;
    temperature?: string;
    oxygenSaturation?: string;
};
export declare const columns: ColumnDef<Patient>[];
export declare function DataTableDemo(): import("react/jsx-runtime").JSX.Element;
