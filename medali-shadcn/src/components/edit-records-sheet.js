import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "./ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "./ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, } from "@/components/ui/sheet";
import { ref, update, get, push } from "firebase/database";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/auth/authprovider";
import { toast } from "sonner";
//date picker code from shadcn components
function formatDate(date) {
    if (!date) {
        return "";
    }
    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}
function isValidDate(date) {
    if (!date) {
        return false;
    }
    return !isNaN(date.getTime());
}
export function EditRecordsSheet({ open, onOpenChange, patient, }) {
    const { user } = useAuth();
    const [fields, setFields] = useState(patient);
    const [openD, setOpenDate] = React.useState(false);
    const [date, setDate] = React.useState(undefined);
    const [month, setMonth] = React.useState(date);
    const [value, setValue] = React.useState(formatDate(date));
    console.log("PATIENT", fields);
    // const [patientDiagnosis, setDiagnosis] = useState([
    //   { diagnosis: "", severity: "", notes: "" },
    // ]);
    // //FAMILY HISTORY
    // const [familyHistory, setFamilyHistory] = useState([
    //   {
    //     relation: "",
    //     age: "",
    //     healthProblems: "",
    //     goodHealth: true,
    //     isAlive: true,
    //   },
    // ]);
    useEffect(() => {
        if (patient) {
            setFields(patient);
        }
    }, [patient]);
    const handleChange = (key, value) => {
        setFields((prev) => ({ ...prev, [key]: value }));
    };
    const handleAddDiagnosis = () => {
        setFields((prev) => ({
            ...prev,
            patientDiagnosis: [
                ...(prev.patientDiagnosis || []),
                { diagnosis: "", severity: "", notes: "" },
            ],
        }));
    };
    const handleAddHistory = () => {
        setFields((prev) => ({
            ...prev,
            familyHistory: [
                ...(prev.familyHistory || []),
                {
                    relation: "",
                    age: "",
                    healthProblems: "",
                    goodHealth: true,
                    isAlive: true,
                },
            ],
        }));
    };
    const handleRemoveDiagnosis = (index) => {
        setFields((prev) => ({
            ...prev,
            patientDiagnosis: prev.patientDiagnosis.filter((_, i) => i !== index),
        }));
    };
    const handleRemoveHistory = (index) => {
        setFields((prev) => ({
            ...prev,
            familyHistory: prev.familyHistory.filter((_, i) => i !== index),
        }));
    };
    const handleDiagnosisChange = (index, key, value) => {
        setFields((prev) => {
            const updated = [...prev.patientDiagnosis];
            updated[index][key] = value;
            return { ...prev, patientDiagnosis: updated };
        });
    };
    const handleHistoryChange = (index, key, value) => {
        setFields((prev) => {
            const updated = [...prev.familyHistory];
            if (key == "goodHealth" || key == "isAlive") {
                updated[index][key] = value;
            }
            else {
                updated[index][key] = value;
            }
            return { ...prev, familyHistory: updated };
        });
    };
    const updateRecords = async () => {
        if (!fields.id) {
            toast.error("Invalid patient record.");
            return;
        }
        const patientRef = ref(db, `patients/${fields.id}`);
        const patientHistoryRef = ref(db, `patients/${fields.id}/medicalHistory`);
        const snapshot = await get(patientRef);
        const currentPatient = snapshot.val();
        const { medicalHistory, ...oldHistory } = currentPatient || {};
        console.log("BEFORE UPDATIUNG", fields.patientDiagnosis);
        await update(patientRef, {
            ...fields,
            address: fields.address1 + fields.address2 + fields.city + fields.province,
            updatedBy: user?.uid || "",
            updatedAt: Date.now(),
        });
        await push(patientHistoryRef, {
            ...oldHistory,
            savedAt: Date.now(),
        });
        toast.success("Patient record updated successfully.");
        onOpenChange(false);
    };
    return (_jsx(Sheet, { open: open, onOpenChange: onOpenChange, children: _jsxs(SheetContent, { className: "overflow-y-auto !w-[75vw] !max-w-none p-0 bg-white\r\n        [&>button]:text-white \r\n        [&>button]:size-7 \r\n        [&>button]:!bg-red-500  \r\n        [&>button_svg]:w-6 \r\n        [&>button_svg]:h-6", children: [_jsxs(SheetHeader, { children: [_jsx(SheetTitle, { className: "text-2xl md:text-3xl font-semibold text-center text-orange-500 mt-8 mb-6", children: "Edit Medical Report" }), _jsx(SheetDescription, { className: "text-center text-gray-500 mb-6", children: "Update patient information, vitals, and medical history." })] }), _jsx(Card, { className: "flex-1 border-none rounded-none", children: _jsx("div", { className: "px-4 md:px-8 lg:px-12", children: _jsx(Card, { className: "p-6 md:p-8 rounded-2xl rounded-none border-none", children: _jsxs("div", { className: "max-w-5xl mx-auto space-y-8", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Patient Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Field, { children: [_jsx(Input, { value: fields.firstName, onChange: (e) => handleChange("firstName", e.target.value), placeholder: "Enter first name" }), _jsx(FieldDescription, { children: "First Name" })] }), _jsxs(Field, { children: [_jsx(Input, { value: fields.lastName, onChange: (e) => handleChange("lastName", e.target.value), placeholder: "Enter last name" }), _jsx(FieldDescription, { children: "Last Name" })] }), _jsxs(Field, { children: [_jsxs(InputGroup, { children: [_jsx(InputGroupInput, { id: "date-required", value: value, placeholder: fields.birthdate, onChange: (e) => {
                                                                            handleChange("birthdate", e.target.value);
                                                                            const date = new Date(e.target.value);
                                                                            setValue(e.target.value);
                                                                            if (isValidDate(date)) {
                                                                                setDate(date);
                                                                                setMonth(date);
                                                                            }
                                                                        }, onKeyDown: (e) => {
                                                                            if (e.key === "ArrowDown") {
                                                                                e.preventDefault();
                                                                                setOpenDate(true);
                                                                            }
                                                                        } }), _jsx(InputGroupAddon, { align: "inline-end", children: _jsxs(Popover, { open: openD, onOpenChange: setOpenDate, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(InputGroupButton, { id: "date-picker", variant: "ghost", size: "icon-xs", "aria-label": "Select date", className: "!bg-[#00a896] text-white !hover:bg-[#028090] border-none", children: [_jsx(CalendarIcon, {}), _jsx("span", { className: "sr-only", children: "Select date" })] }) }), _jsx(PopoverContent, { className: "w-auto overflow-hidden p-0", align: "end", alignOffset: -8, sideOffset: 10, children: _jsx(Calendar, { mode: "single", selected: date, month: month, onMonthChange: setMonth, className: "text-white ", onSelect: (date) => {
                                                                                            setDate(date);
                                                                                            setValue(formatDate(date));
                                                                                            setOpenDate(false);
                                                                                        } }) })] }) })] }), _jsx(FieldDescription, { children: " Date of Birth" })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [_jsxs(Field, { children: [_jsx(Input, { value: fields.age, onChange: (e) => handleChange("age", e.target.value), placeholder: "Enter age" }), _jsx(FieldDescription, { children: "Age" })] }), _jsxs(Field, { children: [_jsxs(Select, { value: fields.gender, onValueChange: (value) => handleChange("gender", value), children: [_jsx(SelectTrigger, { className: "!bg-[#00a896] w-full border-gray-300 !text-white ", children: _jsx(SelectValue, { placeholder: "Select Gender" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { className: "!bg-white !text-blue-500", value: "MALE", children: "Male" }), _jsx(SelectItem, { className: "!bg-white !text-red-500", value: "FEMALE", children: "Female" })] })] }), _jsx(FieldDescription, { children: "Gender" })] })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Contact Number" }), _jsx(Field, { children: _jsx(Input, { value: fields.telephone, onChange: (e) => handleChange("telephone", e.target.value), placeholder: "Enter contact number" }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Address" }), _jsxs(Field, { children: [_jsx(Input, { value: fields.address1, onChange: (e) => handleChange("address1", e.target.value), placeholder: "Enter address" }), _jsx(FieldDescription, { children: "Address Line 1" })] }), _jsxs(Field, { children: [_jsx(Input, { value: fields.address2, onChange: (e) => handleChange("address2", e.target.value), placeholder: "Enter address" }), _jsx(FieldDescription, { children: "Address Line 2" })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2 w-screen", children: [_jsxs(Field, { children: [_jsx(Input, { value: fields.city, onChange: (e) => handleChange("city", e.target.value), placeholder: "Enter address" }), _jsx(FieldDescription, { children: "City" })] }), _jsxs(Field, { children: [_jsx(Input, { value: fields.province, onChange: (e) => handleChange("province", e.target.value), placeholder: "Enter address" }), _jsx(FieldDescription, { children: "State/Province" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Vital Statistics" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Field, { children: [_jsx(Input, { value: fields.bloodPressure, onChange: (e) => handleChange("bloodPressure", e.target.value), placeholder: "Blood Pressure" }), _jsx(FieldDescription, { children: "Blood Pressure" })] }), _jsxs(Field, { children: [_jsx(Input, { value: fields.heartRate, onChange: (e) => handleChange("heartRate", e.target.value), placeholder: "Heart Rate" }), _jsx(FieldDescription, { children: "HeartRate" })] }), _jsxs(Field, { children: [_jsx(Input, { value: fields.temperature, onChange: (e) => handleChange("temperature", e.target.value), placeholder: "Temperature" }), _jsx(FieldDescription, { children: "Temperature" })] }), _jsxs(Field, { children: [_jsx(Input, { value: fields.oxygenSaturation, onChange: (e) => handleChange("oxygenSaturation", e.target.value), placeholder: "Oxygen Saturation" }), _jsx(FieldDescription, { children: "Oxygen Saturation" })] }), _jsxs(Field, { children: [_jsx(Input, { value: fields.respiratoryRate, onChange: (e) => handleChange("respiratoryRate", e.target.value), placeholder: "Respiratory Rate" }), _jsx(FieldDescription, { children: "Respiratory Rate" })] }), _jsxs(Field, { children: [_jsx(Input, { value: fields.height, onChange: (e) => handleChange("height", e.target.value), placeholder: "Height" }), _jsx(FieldDescription, { children: "Height" })] }), _jsxs(Field, { children: [_jsx(Input, { value: fields.weight, onChange: (e) => handleChange("weight", e.target.value), placeholder: "Weight" }), _jsx(FieldDescription, { children: "Weight" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Health History" }), _jsxs("div", { className: "divide-y rounded-xl border overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsx(FieldLabel, { children: "Are you presently under medical care?" }), _jsx(Checkbox, { className: "size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]", checked: fields.medicalCare, onCheckedChange: (checked) => handleChange("medicalCare", checked) })] }), _jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsx(FieldLabel, { children: "Do you have any drug allergies?" }), _jsx(Checkbox, { checked: fields.drugAllergy, className: "size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]", onCheckedChange: (checked) => handleChange("drugAllergy", checked) })] }), _jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsx(FieldLabel, { children: "Do you have any food or environmental allergies?" }), _jsx(Checkbox, { className: "size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]", checked: fields.foodAllergy, onCheckedChange: (checked) => handleChange("foodAllergy", checked) })] }), _jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsx(FieldLabel, { children: "Have you ever had tuberculosis or a positive TB test?" }), _jsx(Checkbox, { className: "size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]", checked: fields.isTBPositive, onCheckedChange: (checked) => handleChange("isTBPositive", checked) })] }), _jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsx(FieldLabel, { children: "Have you ever been cared for by a mental health clinician?" }), _jsx(Checkbox, { className: "size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]", checked: fields.hasClinician, onCheckedChange: (checked) => handleChange("hasClinician", checked) })] }), _jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsx(FieldLabel, { children: "Have you ever restricted your eating?" }), _jsx(Checkbox, { className: "size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]", checked: fields.diet, onCheckedChange: (checked) => handleChange("diet", checked) })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Symptoms" }), _jsx(Input, { value: fields.symptoms, onChange: (e) => handleChange("symptoms", e.target.value), placeholder: "e.g. fever, cough" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Diagnosis" }), _jsx(Button, { size: "sm", className: "!bg-[#00a896] text-white", onClick: handleAddDiagnosis, children: "+ Add" })] }), fields.patientDiagnosis.map((d, index) => (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-xl bg-gray-50", children: [_jsx(Input, { value: d.diagnosis, onChange: (e) => handleDiagnosisChange(index, "diagnosis", e.target.value), placeholder: "Diagnosis" }), _jsx(Input, { value: d.severity, onChange: (e) => handleDiagnosisChange(index, "severity", e.target.value), placeholder: "Severity" }), _jsx(Input, { value: d.notes, onChange: (e) => handleDiagnosisChange(index, "notes", e.target.value), placeholder: "Notes" }), fields.patientDiagnosis.length > 1 && (_jsx(Button, { size: "sm", className: "!bg-red-400 text-white", onClick: () => handleRemoveDiagnosis(index), children: "Remove" }))] }, index)))] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Family History" }), _jsxs("div", { className: "grid grid-cols-[120px_80px_1fr_120px_80px_100px] text-gray-500 text-sm", children: [_jsx("span", { children: "Relation" }), _jsx("span", { children: "Age" }), _jsx("span", { children: "Health Problems" }), _jsx("span", { className: "text-center", children: "Good Health" }), _jsx("span", { className: "text-center", children: "Alive" }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { size: "sm", className: "!bg-[#00a896] text-white", onClick: handleAddHistory, children: "+ Add" }) })] }), _jsx("div", { className: "divide-y border rounded-xl", children: fields.familyHistory.map((h, index) => (_jsxs("div", { className: "grid grid-cols-[120px_80px_1fr_120px_80px_100px] items-center gap-3 p-3", children: [_jsx(Input, { value: h.relation, onChange: (e) => handleHistoryChange(index, "relation", e.target.value), placeholder: "Relation" }), _jsx(Input, { value: h.age, onChange: (e) => handleHistoryChange(index, "age", e.target.value), placeholder: "Age" }), _jsx(Input, { value: h.healthProblems, onChange: (e) => handleHistoryChange(index, "healthProblems", e.target.value), placeholder: "Problems" }), _jsx("div", { className: "flex justify-center", children: _jsx(Checkbox, { className: "size-6 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]", checked: h.goodHealth, onCheckedChange: (c) => handleHistoryChange(index, "goodHealth", c === true) }) }), _jsx("div", { className: "flex justify-center", children: _jsx(Checkbox, { className: "size-6 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]", checked: h.isAlive, onCheckedChange: (c) => handleHistoryChange(index, "isAlive", c === true) }) }), _jsx("div", { className: "flex justify-center", children: fields.familyHistory.length > 1 && (_jsx(Button, { size: "sm", className: "!bg-red-400 text-white", onClick: () => handleRemoveHistory(index), children: "Remove" })) })] }, index))) })] }), _jsx("div", { className: "flex justify-center pt-6", children: _jsx(Button, { onClick: updateRecords, className: "!bg-orange-400 text-white", children: "Update Record" }) })] }) }) }) })] }) }));
}
