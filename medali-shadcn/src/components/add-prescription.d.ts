export type User = {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    field: string;
    medicalId: string;
    type: string;
    email: string;
    requestedBy?: string[];
    requestedTo?: string[];
    uid?: string;
};
type AddPrescriptionProps = {
    patient: {
        patientId: string;
        firstName: string;
        lastName: string;
        gender?: string;
        age?: number;
        address: string;
        patientDiagnosis: {
            diagnosis: string;
            severity: string;
            notes: string;
        }[];
    };
};
export declare function AddPrescription({ patient }: AddPrescriptionProps): import("react/jsx-runtime").JSX.Element;
export {};
