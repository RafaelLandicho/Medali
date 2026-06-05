"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ref, update, push, set } from "firebase/database";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/auth/authprovider";
import { toast } from "sonner";
export function EditPrescription({ prescription, onOpenChange, }) {
    const { user } = useAuth();
    const [fields, setFields] = useState(prescription);
    const [drugs, setDrugs] = useState(prescription.drugs || []);
    const [diagnosis, setDiagnosis] = useState(prescription.diagnosis || []);
    useEffect(() => {
        setFields(prescription);
        setDrugs(prescription.drugs || []);
        setDiagnosis(prescription.diagnosis || []);
    }, [prescription]);
    const handleChange = (key, value) => setFields((prev) => ({ ...prev, [key]: value }));
    const handleDrugChange = (index, key, value) => {
        const updated = [...drugs];
        updated[index][key] = value;
        setDrugs(updated);
    };
    const addDrug = () => setDrugs([...drugs, { medicine: "", dosage: "", unit: "" }]);
    const removeDrug = (index) => setDrugs(drugs.filter((_, i) => i !== index));
    const handleDiagnosisChange = (index, key, value) => {
        const updated = [...diagnosis];
        updated[index][key] = value;
        setDiagnosis(updated);
    };
    const addDiagnosis = () => setDiagnosis([...diagnosis, { diagnosis: "", severity: "", notes: "" }]);
    const removeDiagnosis = (index) => setDiagnosis(diagnosis.filter((_, i) => i !== index));
    const updatePrescription = async () => {
        const logsRef = ref(db, "logs/");
        const newLog = push(logsRef);
        if (!fields.id) {
            toast.error("Prescription record missing ID.");
            return;
        }
        await update(ref(db, `prescriptions/${fields.id}`), {
            diagnosis: fields.diagnosis,
            examination: fields.examination,
            recommendation: fields.recommendation,
            drugs,
            updatedBy: user?.uid,
            updatedAt: Date.now(),
        });
        await set(newLog, {
            prescriptionLog: `Prescription updated by ${user?.firstName} ${user?.lastName} `,
            logTime: new Date().toLocaleString(),
        });
        toast.success("Prescription updated.");
        onOpenChange(false);
    };
    return (_jsxs("form", { className: "flex flex-col gap-4", onSubmit: (e) => {
            e.preventDefault();
            updatePrescription();
        }, children: [_jsxs("div", { children: [_jsx(Label, { children: "Diagnosis" }), diagnosis.map((d, index) => (_jsxs("div", { className: "flex gap-2 mb-2", children: [_jsx(Input, { placeholder: "Diagnosis", value: d.diagnosis, onChange: (e) => handleDiagnosisChange(index, "diagnosis", e.target.value) }), _jsx(Input, { placeholder: "Severity", value: d.severity, onChange: (e) => handleDiagnosisChange(index, "severity", e.target.value) }), _jsx(Input, { placeholder: "Notes", value: d.notes, onChange: (e) => handleDiagnosisChange(index, "notes", e.target.value) }), diagnosis.length > 1 && (_jsx(Button, { type: "button", variant: "destructive", onClick: () => removeDiagnosis(index), children: "Remove" }))] }, index))), _jsx(Button, { type: "button", variant: "outline", className: "!bg-[#00a896] !text-white", onClick: addDiagnosis, children: "+ Add Diagnosis" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Drugs" }), drugs.map((drug, index) => (_jsxs("div", { className: "flex gap-2 mb-2", children: [_jsx(Input, { placeholder: "Medicine", value: drug.medicine, onChange: (e) => handleDrugChange(index, "medicine", e.target.value) }), _jsx(Input, { placeholder: "Dosage", value: drug.dosage, onChange: (e) => handleDrugChange(index, "dosage", e.target.value) }), _jsx(Input, { placeholder: "Unit", value: drug.unit, onChange: (e) => handleDrugChange(index, "unit", e.target.value) }), drugs.length > 1 && (_jsx(Button, { type: "button", variant: "destructive", onClick: () => removeDrug(index), children: "Remove" }))] }, index))), _jsx(Button, { type: "button", variant: "outline", className: "!bg-[#00a896] !text-white", onClick: addDrug, children: "+ Add Drug" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Examination" }), _jsx(Input, { value: fields.examination, onChange: (e) => handleChange("examination", e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Recommendation" }), _jsx(Input, { value: fields.recommendation, onChange: (e) => handleChange("recommendation", e.target.value) })] }), _jsx(Button, { type: "submit", className: "!bg-[#00a896] !text-white mt-4", children: "Save Changes" })] }));
}
