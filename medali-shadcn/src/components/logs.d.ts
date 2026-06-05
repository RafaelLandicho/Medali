import { type ColumnDef } from "@tanstack/react-table";
export type Log = {
    id: string;
    prescriptionLog?: string;
    medicalRecordLog?: string;
    logTime: string;
};
export declare const columns: ColumnDef<Log>[];
export declare function ViewLogs(): import("react/jsx-runtime").JSX.Element;
