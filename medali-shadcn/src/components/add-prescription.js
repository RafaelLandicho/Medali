import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { db } from "@/firebaseConfig";
import { ref, push, set } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
export function AddPrescription({ patient }) {
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState([
        { medicine: "", unit: "", dosage: "", purpose: "", frequency: "" },
    ]);
    const [diagnosisPres, setDiagnosisPres] = useState([]);
    useEffect(() => {
        console.log("FULL PATIENT:", patient);
        if (patient) {
            console.log("Loaded patient:", patient);
            console.log(patient.patientDiagnosis);
            if (patient.patientDiagnosis && patient.patientDiagnosis.length > 0) {
                setDiagnosisPres(patient.patientDiagnosis.map((d) => ({
                    diagnosis: d.diagnosis,
                    severity: d.severity,
                    notes: d.notes,
                })));
            }
            else {
                setDiagnosisPres([{ diagnosis: "", severity: "", notes: "" }]);
            }
        }
    }, [patient]);
    const [fields, setFields] = useState({
        patientDiagnosis: "",
        patientExamination: "",
        patientRecommendation: "",
        dateIssued: "",
    });
    const handleChange = (key, value) => {
        setFields((prev) => ({ ...prev, [key]: value }));
    };
    const handleAddPrescription = () => setPrescriptions([
        ...prescriptions,
        { medicine: "", unit: "", dosage: "", purpose: "", frequency: "" },
    ]);
    const handleRemovePrescription = (index) => setPrescriptions(prescriptions.filter((_, i) => i !== index));
    const handlePrescriptionChange = (index, key, value) => {
        const updated = [...prescriptions];
        updated[index][key] = value;
        setPrescriptions(updated);
    };
    const handleAddDiagnosis = () => setDiagnosisPres([
        ...diagnosisPres,
        { diagnosis: "", severity: "", notes: "" },
    ]);
    const handleRemoveDiagnosis = (index) => setDiagnosisPres(diagnosisPres.filter((_, i) => i !== index));
    const handleDiagnosisChange = (index, key, value) => {
        const updated = [...diagnosisPres];
        updated[index][key] = value;
        setDiagnosisPres(updated);
    };
    const addPrescription = async () => {
        try {
            const logsRef = ref(db, "logs/");
            const prescriptionsRef = ref(db, `prescriptions/`);
            const newPrescription = push(prescriptionsRef);
            const newLog = push(logsRef);
            await set(newPrescription, {
                patientFirstName: patient.firstName,
                patientLastName: patient.lastName,
                patientAddress: patient.address,
                patientAge: patient.age,
                patientGender: patient.gender,
                prescriptionId: newPrescription.key,
                diagnosis: diagnosisPres,
                examination: fields.patientExamination,
                recommendation: fields.patientRecommendation,
                drugs: prescriptions,
                addedBy: `${user?.firstName} ${user?.lastName}`,
                field: user?.field,
                doctorId: user?.medicalId,
                createdBy: user?.uid,
                createdAt: new Date().toLocaleString(),
            });
            await set(newLog, {
                prescriptionLog: `Prescription added by ${user?.firstName} ${user?.lastName} `,
                logTime: new Date().toLocaleString(),
            });
            toast.success(`Prescription added for ${patient.firstName}`);
            console.log("prescription added");
        }
        catch (error) {
            console.error(error);
            toast.error("Failed to add prescription");
        }
    };
    return (_jsx("div", { className: "w-full", children: _jsx("form", { onSubmit: (e) => {
                e.preventDefault();
                addPrescription();
            }, children: _jsx(FieldGroup, { children: _jsxs(FieldSet, { className: "space-y-6", children: [_jsxs("h3", { className: "text-xl font-semibold", children: ["Prescription for ", patient.firstName, " ", patient.lastName] }), _jsxs("div", { className: "space-y-10 max-w-[1100px] mx-auto", children: [_jsxs(Field, { className: "space-y-3", children: [_jsx(FieldLabel, { className: "text-lg font-semibold", children: "Diagnosis" }), _jsxs("div", { className: "space-y-4", children: [diagnosisPres.map((item, index) => (_jsxs("div", { className: "p-4 border rounded-xl bg-muted/30 space-y-3", children: [_jsxs("div", { className: "grid md:grid-cols-2 gap-3", children: [_jsx(Input, { placeholder: "Diagnosis", value: item.diagnosis, onChange: (e) => handleDiagnosisChange(index, "diagnosis", e.target.value) }), _jsx(Input, { placeholder: "Severity", value: item.severity, onChange: (e) => handleDiagnosisChange(index, "severity", e.target.value) })] }), _jsx(Input, { placeholder: "Notes", value: item.notes, onChange: (e) => handleDiagnosisChange(index, "notes", e.target.value) }), diagnosisPres.length > 1 && (_jsx(Button, { type: "button", variant: "destructive", onClick: () => handleRemoveDiagnosis(index), children: "Remove Diagnosis" }))] }, index))), _jsx(Button, { type: "button", className: "!bg-[#00a896] !text-white w-full", onClick: handleAddDiagnosis, children: "+ Add Diagnosis" })] })] }), _jsxs(Field, { className: "space-y-3", children: [_jsx(FieldLabel, { className: "text-lg font-semibold", children: "Drug Prescriptions" }), _jsxs("div", { className: "border rounded-xl overflow-hidden", children: [_jsxs("div", { className: "grid grid-cols-6 bg-muted px-4 py-3 font-medium text-sm", children: [_jsx("div", { children: "Medicine" }), _jsx("div", { children: "Unit" }), _jsx("div", { children: "Dosage" }), _jsx("div", { children: "Purpose" }), _jsx("div", { children: "Frequency" }), _jsx("div", { className: "text-center", children: "Action" })] }), prescriptions.map((drug, index) => (_jsxs("div", { className: "grid grid-cols-6 gap-3 px-4 py-3 border-t items-center", children: [_jsx(Input, { placeholder: "Paracetamol", value: drug.medicine, onChange: (e) => handlePrescriptionChange(index, "medicine", e.target.value) }), _jsx(Input, { placeholder: "Tablet / ml", value: drug.unit, onChange: (e) => handlePrescriptionChange(index, "unit", e.target.value) }), _jsx(Input, { placeholder: "500mg", value: drug.dosage, onChange: (e) => handlePrescriptionChange(index, "dosage", e.target.value) }), _jsx(Input, { placeholder: "Pain relief", value: drug.purpose, onChange: (e) => handlePrescriptionChange(index, "purpose", e.target.value) }), _jsx(Input, { placeholder: "2x a day", value: drug.frequency, onChange: (e) => handlePrescriptionChange(index, "frequency", e.target.value) }), _jsx("div", { className: "flex justify-center", children: prescriptions.length > 1 && (_jsx(Button, { type: "button", size: "sm", variant: "destructive", onClick: () => handleRemovePrescription(index), children: "Remove" })) })] }, index)))] }), _jsx(Button, { type: "button", className: "!bg-[#00a896] !text-white w-full", onClick: handleAddPrescription, children: "+ Add Drug Row" })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs(Field, { children: [_jsx(FieldLabel, { children: "Examination" }), _jsx(Input, { value: fields.patientExamination, onChange: (e) => handleChange("patientExamination", e.target.value) })] }), _jsxs(Field, { children: [_jsx(FieldLabel, { children: "Recommendations" }), _jsx(Input, { value: fields.patientRecommendation, onChange: (e) => handleChange("patientRecommendation", e.target.value) })] })] }), _jsx(Field, { className: "lg:col-span-2", children: _jsx(Button, { type: "submit", className: "!bg-[#00a896] !text-white w-full h-12 text-lg", children: "Save Prescription" }) })] })] }) }) }) }));
}
