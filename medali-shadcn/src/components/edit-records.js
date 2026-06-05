import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, } from "@/components/ui/sheet";
import { ref, update, push, set } from "firebase/database";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/auth/authprovider";
import { toast } from "sonner";
export function EditRecordsSheet({ open, onOpenChange, patient, }) {
    const { user } = useAuth();
    const [fields, setFields] = useState(patient);
    useEffect(() => {
        if (patient)
            setFields(patient);
    }, [patient]);
    const handleChange = (key, value) => {
        setFields((prev) => ({ ...prev, [key]: value }));
    };
    const updateRecords = async () => {
        if (!fields.id) {
            toast.error("Invalid patient record.");
            return;
        }
        const logsRef = ref(db, "logs/");
        const patientRef = ref(db, `patients/${fields.id}`);
        const newLog = push(logsRef);
        await update(patientRef, {
            ...fields,
            updatedBy: user?.uid || "",
            updatedAt: Date.now(),
        });
        await set(newLog, {
            medicalRecordLog: `Medical Record updated by ${user?.firstName} ${user?.lastName} `,
            logTime: new Date().toLocaleString(),
        });
        toast.success("Patient record updated successfully.");
        onOpenChange(false);
    };
    return (_jsx(Sheet, { open: open, onOpenChange: onOpenChange, children: _jsx("div", { className: "text-lg space-y-6", children: _jsxs(SheetContent, { className: "overflow-y-auto p-10 !w-[50vw] !max-w-none !h-screen ", children: [_jsx(SheetClose, { className: "\r\n            absolute top-6 right-6 \r\n            flex items-center justify-center\r\n            rounded-full p-3\r\n            !bg-red-600 hover:!bg-red-700 active:!bg-red-800\r\n            !text-white\r\n            !shadow-none !ring-0 !outline-none !border-none\r\n            transition-colors duration-200\r\n          ", children: _jsx(X, { className: "w-6 h-6" }) }), _jsxs(SheetHeader, { children: [_jsx(SheetTitle, { className: "text-2xl font-semibold", children: "Edit Patient Record" }), _jsx(SheetDescription, { className: "text-base  text-2xl text-muted-foreground", children: "Make changes to the patient\u2019s record here." })] }), _jsxs("div", { className: "grid gap-6 py-4", children: [_jsx(Accordion, { type: "single", collapsible: true, className: "w-full", children: _jsxs(AccordionItem, { value: "item-1", children: [_jsx("div", { className: "flex justify-center mt-6", children: _jsx(AccordionTrigger, { className: "!text-white !text-2xl !font-semibold !bg-[#00a896] flex items-center gap-2 ", children: _jsx("span", { children: "Basic Details" }) }) }), _jsxs(AccordionContent, { className: " !mt-5", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { className: "text-2xl font-medium", htmlFor: "firstName", children: "First Name" }), _jsx(Input, { className: "h-14 !text-2xl px-4", id: "firstName", placeholder: "Enter first name", value: fields.firstName || "", onChange: (e) => handleChange("firstName", e.target.value) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { className: "text-2xl font-medium", htmlFor: "lastName", children: "Last Name" }), _jsx(Input, { className: "h-14 !text-2xl px-4", id: "lastName", placeholder: "Enter last name", value: fields.lastName || "", onChange: (e) => handleChange("lastName", e.target.value) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { className: "text-2xl font-medium", htmlFor: "gender", children: "Gender" }), _jsx(Input, { className: "h-14 !text-2xl px-4", id: "gender", placeholder: "Enter gender", value: fields.gender || "", onChange: (e) => handleChange("gender", e.target.value) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { className: "text-2xl font-medium", htmlFor: "age", children: "Age" }), _jsx(Input, { className: "h-14 !text-2xl px-4", id: "age", placeholder: "Enter age", value: fields.age || "", onChange: (e) => handleChange("age", e.target.value) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { className: "text-2xl font-medium", htmlFor: "telephone", children: "Contact Number" }), _jsx(Input, { className: "h-14 !text-2xl px-4", id: "telephone", placeholder: "Enter contact number", value: fields.telephone || "", onChange: (e) => handleChange("telephone", e.target.value) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { className: "text-2xl font-medium", htmlFor: "address", children: "Address" }), _jsx(Input, { className: "h-14 !text-2xl px-4", id: "address", placeholder: "Enter address", value: fields.address || "", onChange: (e) => handleChange("address", e.target.value) })] })] })] }) }), _jsx(Accordion, { type: "single", collapsible: true, className: "w-full", children: _jsxs(AccordionItem, { value: "item-1", children: [_jsx("div", { className: "flex justify-center mt-6", children: _jsx(AccordionTrigger, { className: "!text-white !text-2xl !font-semibold !bg-[#00a896] flex items-center gap-2 ", children: _jsx("span", { children: "Vital Signs" }) }) }), _jsxs(AccordionContent, { className: " !mt-5", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { className: "text-2xl font-medium", htmlFor: "bloodPressure", children: "Blood Pressure" }), _jsx(Input, { className: "h-14 !text-2xl px-4", id: "bloodPressure", placeholder: "Enter blood pressure", value: fields.bloodPressure || "", onChange: (e) => handleChange("bloodPressure", e.target.value) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { className: "text-2xl font-medium", htmlFor: "heartRate", children: "Heart Rate" }), _jsx(Input, { className: "h-14 !text-2xl px-4", id: "heartRate", placeholder: "Enter heart rate", value: fields.heartRate || "", onChange: (e) => handleChange("heartRate", e.target.value) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { className: "text-2xl font-medium", htmlFor: "respiratoryRate", children: "Respiratory Rate" }), _jsx(Input, { className: "h-14 !text-2xl px-4", id: "respiratoryRate", placeholder: "Enter respiratory rate", value: fields.respiratoryRate || "", onChange: (e) => handleChange("respiratoryRate", e.target.value) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { className: "text-2xl font-medium", htmlFor: "temperature", children: "Temperature" }), _jsx(Input, { className: "h-14 !text-2xl px-4", id: "temperature", placeholder: "Enter temperature", value: fields.temperature || "", onChange: (e) => handleChange("temperature", e.target.value) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { className: "text-2xl font-medium", htmlFor: "oxygenSaturation", children: "Oxygen Saturation" }), _jsx(Input, { className: "h-14 !text-2xl px-4", id: "oxygenSaturation", placeholder: "Enter oxygen saturation", value: fields.oxygenSaturation || "", onChange: (e) => handleChange("oxygenSaturation", e.target.value) })] })] })] }) })] }), _jsx(SheetFooter, { children: _jsx("div", { className: "flex justify-center mt-6", children: _jsx(Button, { type: "button", className: "!bg-orange-500 !text-white !p-5 !text-2xl w-50", onClick: updateRecords, children: "Save changes" }) }) })] }) }) }));
}
