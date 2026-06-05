import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "./ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "./ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { toast } from "sonner";
import { db } from "@/firebaseConfig";
import { ref, set, push, onValue, get } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
//FUNCTIONS AND INTERFACES FOR COMPONENTS
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
export function AddRecords() {
    const { user } = useAuth();
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState(undefined);
    const [month, setMonth] = React.useState(date);
    const [value, setValue] = React.useState(formatDate(date));
    const initialState = {
        patientFirstName: "",
        patientLastName: "",
        patientGender: "",
        patientAge: "",
        patientSymptoms: "",
        patientBirthdate: "",
        patientTelephone: "",
        patientAddress: "",
        patientAddress2: "",
        patientCity: "",
        patientStateProvince: "",
        patientBloodPressure: "",
        patientHeartRate: "",
        patientRespiratoryRate: "",
        patientTemperature: "",
        patientOxygenSaturation: "",
        patientHeight: "",
        patientWeight: "",
        // HEALTH HISTORY
        patientisMedicalCare: false,
        patientDrugAllergy: false,
        patientFoodAllergy: false,
        patientTBPositive: false,
        patientHasClinician: false,
        patientDiet: false,
    };
    const [fields, setFields] = useState(initialState);
    const [openSections, setOpenSections] = useState(["basic"]);
    const [isLoading, setIsLoading] = useState(false);
    const [patientDiagnosis, setDiagnosis] = useState([
        { diagnosis: "", severity: "", notes: "" },
    ]);
    //FAMILY HISTORY
    const [familyHistory, setFamilyHistory] = useState([
        {
            relation: "",
            age: "",
            healthProblems: "",
            goodHealth: true,
            isAlive: true,
        },
    ]);
    const [linkedUsers, setLinkedUsers] = React.useState([]);
    const [selectedLinkedUser, setSelectedLinkedUser] = React.useState("");
    const userIsAdmin = user?.type?.toLowerCase() === "admin";
    const userIsSecretary = user?.type?.toLowerCase() === "secretary";
    const userIsDoctor = user?.type?.toLowerCase() === "doctor";
    React.useEffect(() => {
        if (!user)
            return;
        const userRef = ref(db, `users/${user.uid}`);
        const unsubscribe = onValue(userRef, async (snapshot) => {
            const userData = snapshot.val();
            if (!userData)
                return;
            let linkedUserIds = [];
            if (user.type?.toLowerCase() === "secretary") {
                // Secretary: get linked doctors
                linkedUserIds = userData.doctors || [];
            }
            else if (user.type?.toLowerCase() === "doctor") {
                // Doctor: get linked secretaries
                linkedUserIds = userData.secretaries || [];
            }
            // Fetch details of linked users
            const linkedUsersPromises = linkedUserIds.map(async (userId) => {
                const linkedUserRef = ref(db, `users/${userId}`);
                const linkedUserSnap = await get(linkedUserRef);
                if (linkedUserSnap.exists()) {
                    return { id: userId, ...linkedUserSnap.val() };
                }
                return null;
            });
            const linkedUsersData = await Promise.all(linkedUsersPromises);
            setLinkedUsers(linkedUsersData.filter(Boolean));
        });
        return () => unsubscribe();
    }, [user]);
    const handleChange = (key, value) => {
        setFields((prev) => ({ ...prev, [key]: value }));
        console.log(key, value);
    };
    const handleAddDiagnosis = () => setDiagnosis([
        ...patientDiagnosis,
        { diagnosis: "", severity: "", notes: "" },
    ]);
    const handleAddHistory = () => setFamilyHistory([
        ...familyHistory,
        {
            relation: "",
            age: "",
            healthProblems: "",
            goodHealth: true,
            isAlive: true,
        },
    ]);
    const handleRemoveDiagnosis = (index) => setDiagnosis(patientDiagnosis.filter((_, i) => i !== index));
    const handleRemoveHistory = (index) => setFamilyHistory(familyHistory.filter((_, i) => i !== index));
    const handleDiagnosisChange = (index, key, value) => {
        const updated = [...patientDiagnosis];
        updated[index][key] = value;
        setDiagnosis(updated);
    };
    const handleHistoryChange = (index, key, value) => {
        const updated = [...familyHistory];
        if (key == "goodHealth" || key == "isAlive") {
            updated[index][key] = value;
        }
        else {
            updated[index][key] = value;
        }
        setFamilyHistory(updated);
    };
    const addRecords = async () => {
        if (!fields.patientFirstName ||
            !fields.patientLastName ||
            !fields.patientGender ||
            !fields.patientAge) {
            toast.error("Please fill in all required fields");
            return;
        }
        setIsLoading(true);
        try {
            const logsRef = ref(db, "logs/");
            const patientsRef = ref(db, "patients");
            const pendingRef = ref(db, "pending");
            const patient = push(patientsRef);
            const pending = push(pendingRef);
            const newLog = push(logsRef);
            let sharedWith = [user?.uid];
            if (selectedLinkedUser) {
                sharedWith.push(selectedLinkedUser);
            }
            if (userIsSecretary) {
                await set(pending, {
                    patientId: patient.key,
                    firstName: fields.patientFirstName,
                    lastName: fields.patientLastName,
                    gender: fields.patientGender,
                    age: fields.patientAge,
                    birthdate: date ? date.toISOString().split("T")[0] : null,
                    telephone: fields.patientTelephone,
                    address: fields.patientAddress +
                        fields.patientAddress2 +
                        fields.patientCity +
                        fields.patientStateProvince,
                    address1: fields.patientAddress,
                    address2: fields.patientAddress2,
                    city: fields.patientCity,
                    province: fields.patientStateProvince,
                    //Measurements and Symptoms
                    diagnosis: patientDiagnosis,
                    symptoms: fields.patientSymptoms,
                    bloodPressure: fields.patientBloodPressure,
                    heartRate: fields.patientHeartRate,
                    respiratoryRate: fields.patientRespiratoryRate,
                    temperature: fields.patientTemperature,
                    oxygenSaturation: fields.patientOxygenSaturation,
                    weight: fields.patientWeight,
                    height: fields.patientHeight,
                    //Health History
                    medicalCare: fields.patientisMedicalCare,
                    drugAllergy: fields.patientDrugAllergy,
                    foodAllergy: fields.patientFoodAllergy,
                    isTBPositive: fields.patientTBPositive,
                    hasClinician: fields.patientHasClinician,
                    diet: fields.patientDiet,
                    //family history
                    familyHistory: familyHistory,
                    status: "pending",
                    addedBy: user?.email,
                    createdBy: user?.uid,
                    createdAt: Date.now(),
                    sharedWith: sharedWith,
                });
                await set(newLog, {
                    medicalRecordLog: `Medical Record added for approval  by ${user?.firstName} ${user?.lastName} `,
                    logTime: new Date().toLocaleString(),
                });
                toast.success("Record has been added for approval!");
            }
            else {
                await set(patient, {
                    //Patient Info
                    patientId: patient.key,
                    firstName: fields.patientFirstName,
                    lastName: fields.patientLastName,
                    gender: fields.patientGender,
                    age: fields.patientAge,
                    birthdate: date ? date.toISOString().split("T")[0] : null,
                    telephone: fields.patientTelephone,
                    address: fields.patientAddress +
                        fields.patientAddress2 +
                        fields.patientCity +
                        fields.patientStateProvince,
                    address1: fields.patientAddress,
                    address2: fields.patientAddress2,
                    city: fields.patientCity,
                    province: fields.patientStateProvince,
                    //Measurements and Symptoms
                    patientDiagnosis: patientDiagnosis,
                    symptoms: fields.patientSymptoms,
                    bloodPressure: fields.patientBloodPressure,
                    heartRate: fields.patientHeartRate,
                    respiratoryRate: fields.patientRespiratoryRate,
                    temperature: fields.patientTemperature,
                    oxygenSaturation: fields.patientOxygenSaturation,
                    weight: fields.patientWeight,
                    height: fields.patientHeight,
                    //Health History
                    medicalCare: fields.patientisMedicalCare,
                    drugAllergy: fields.patientDrugAllergy,
                    foodAllergy: fields.patientFoodAllergy,
                    isTBPositive: fields.patientTBPositive,
                    hasClinician: fields.patientHasClinician,
                    diet: fields.patientDiet,
                    //family history
                    familyHistory: familyHistory,
                    addedBy: user?.email,
                    createdBy: user?.uid,
                    createdAt: Date.now(),
                    sharedWith: sharedWith,
                });
                await set(newLog, {
                    medicalRecordLog: `Medical Record added by ${user?.firstName} ${user?.lastName} `,
                    logTime: new Date().toLocaleString(),
                });
                toast.success("Record has been added successfully!");
            }
            setFields(initialState);
            setSelectedLinkedUser("");
            setOpenSections(["basic"]);
        }
        catch (error) {
            console.error("Error adding record:", error);
            toast.error("Failed to add record. Please try again.");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("form", { onSubmit: (e) => {
            e.preventDefault();
            addRecords();
        }, className: "space-y-6 md:space-y-8", children: [_jsxs(Card, { className: "flex-1", children: [_jsx("h1", { className: "text-2xl md:text-3xl font-semibold text-center text-orange-500 mb-6 md:mb-8", children: "Medical Report Form" }), _jsx("div", { className: "px-4 md:px-8 lg:px-12", children: _jsx(Card, { className: "p-6 md:p-8 rounded-2xl", children: _jsxs("div", { className: "max-w-5xl mx-auto space-y-8", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Patient Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Field, { children: [_jsx(Input, { placeholder: "Enter first name", value: fields.patientFirstName, onChange: (e) => handleChange("patientFirstName", e.target.value), required: true }), _jsx(FieldDescription, { children: "First Name" })] }), _jsxs(Field, { children: [_jsx(Input
                                                            // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                                                            , { 
                                                                // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                                                                placeholder: "Enter last name", value: fields.patientLastName, onChange: (e) => handleChange("patientLastName", e.target.value), required: true }), _jsx(FieldDescription, { children: "Last Name" })] }), _jsxs(Field, { children: [_jsxs(InputGroup, { children: [_jsx(InputGroupInput, { id: "date-required", value: value, placeholder: "June 01, 2025", onChange: (e) => {
                                                                            handleChange("patientBirthDate", e.target.value);
                                                                            const date = new Date(e.target.value);
                                                                            setValue(e.target.value);
                                                                            if (isValidDate(date)) {
                                                                                setDate(date);
                                                                                setMonth(date);
                                                                            }
                                                                        }, onKeyDown: (e) => {
                                                                            if (e.key === "ArrowDown") {
                                                                                e.preventDefault();
                                                                                setOpen(true);
                                                                            }
                                                                        } }), _jsx(InputGroupAddon, { align: "inline-end", children: _jsxs(Popover, { open: open, onOpenChange: setOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(InputGroupButton, { id: "date-picker", variant: "ghost", size: "icon-xs", "aria-label": "Select date", className: "!bg-[#00a896] text-white !hover:bg-[#028090] border-none", children: [_jsx(CalendarIcon, {}), _jsx("span", { className: "sr-only", children: "Select date" })] }) }), _jsx(PopoverContent, { className: "w-auto overflow-hidden p-0", align: "end", alignOffset: -8, sideOffset: 10, children: _jsx(Calendar, { mode: "single", selected: date, month: month, onMonthChange: setMonth, className: "text-white ", onSelect: (date) => {
                                                                                            setDate(date);
                                                                                            setValue(formatDate(date));
                                                                                            setOpen(false);
                                                                                        } }) })] }) })] }), _jsx(FieldDescription, { children: " Date of Birth" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx("div", { children: _jsxs(Field, { children: [_jsx(Input, { type: "number", 
                                                                    // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                                                                    placeholder: "Enter age", value: fields.patientAge, onChange: (e) => handleChange("patientAge", e.target.value), required: true }), _jsx(FieldDescription, { children: "Patient Age" })] }) }), _jsxs(Select, { value: fields.patientGender, onValueChange: (value) => handleChange("patientGender", value), children: [_jsx(SelectTrigger, { className: "!bg-[#00a896] w-full border-gray-300 !text-white ", children: _jsx(SelectValue, { placeholder: "Select Gender" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { className: "!bg-white !text-blue-500", value: "MALE", children: "Male" }), _jsx(SelectItem, { className: "!bg-white !text-red-500", value: "FEMALE", children: "Female" })] })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Address" }), _jsxs("div", { className: "grid grid-cols-1 gap-4", children: [_jsxs(Field, { children: [_jsx(Input, { type: "text", 
                                                                // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                                                                placeholder: "Enter address", value: fields.patientAddress, onChange: (e) => handleChange("patientAddress", e.target.value) }), _jsx(FieldDescription, { children: "Address Line 1" })] }), _jsxs(Field, { children: [_jsx(Input, { type: "text", 
                                                                // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                                                                placeholder: "Enter address", value: fields.patientAddress2, onChange: (e) => handleChange("patientAddress2", e.target.value) }), _jsx(FieldDescription, { children: "Address Line 2" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Field, { children: [_jsx(Input, { type: "text", 
                                                                        // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                                                                        placeholder: "Enter City", value: fields.patientCity, onChange: (e) => handleChange("patientCity", e.target.value) }), _jsx(FieldDescription, { children: "City" })] }), _jsxs(Field, { className: "mx-auto w-full", children: [_jsx(Input, { type: "text", 
                                                                        // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                                                                        placeholder: "Enter State or Province", value: fields.patientStateProvince, onChange: (e) => handleChange("patientStateProvince", e.target.value) }), _jsx(FieldDescription, { children: "State/Province" })] })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Contact Number" }), _jsx(Field, { children: _jsx(Input, { type: "text", 
                                                    // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                                                    placeholder: "Enter contact number", value: fields.patientTelephone, onChange: (e) => handleChange("patientTelephone", e.target.value) }) })] }), _jsx("div", { children: _jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Vital Statistics" }) }), _jsxs("div", { className: "flex flex-row gap-8", children: [_jsxs(Field, { children: [_jsx(Input, { type: "text", 
                                                        // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                                                        placeholder: "120/80", value: fields.patientBloodPressure, onChange: (e) => handleChange("patientBloodPressure", e.target.value) }), _jsx(FieldDescription, { children: "Blood Pressure (mmHg)" })] }), _jsxs(Field, { children: [_jsx(Input, { type: "text", 
                                                        // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                                                        placeholder: "72", value: fields.patientHeartRate, onChange: (e) => handleChange("patientHeartRate", e.target.value) }), _jsx(FieldDescription, { children: "Heart Rate (BPM)" })] }), _jsxs(Field, { children: [_jsx(Input, { type: "text", 
                                                        // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                                                        placeholder: "16", value: fields.patientRespiratoryRate, onChange: (e) => handleChange("patientRespiratoryRate", e.target.value) }), _jsx(FieldDescription, { children: "Respiratory Rate" })] }), _jsxs(Field, { children: [_jsx(Input, { type: "text", 
                                                        // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                                                        placeholder: "98", value: fields.patientOxygenSaturation, onChange: (e) => handleChange("patientOxygenSaturation", e.target.value) }), _jsx(FieldDescription, { children: "Oxygen Saturation (%)" })] })] }), _jsxs("div", { className: "flex flex-row gap-8", children: [_jsxs(Field, { className: "mx-auto w-full", children: [_jsx(Input, { type: "text", 
                                                        // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                                                        placeholder: "170", value: fields.patientHeight, onChange: (e) => handleChange("patientHeight", e.target.value) }), _jsx(FieldDescription, { children: "Height (cm)" })] }), _jsxs(Field, { className: "mx-auto w-full", children: [_jsx(Input, { type: "text", 
                                                        // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                                                        placeholder: "62", value: fields.patientWeight, onChange: (e) => handleChange("patientWeight", e.target.value) }), _jsx(FieldDescription, { children: "Weight (kg)" })] }), _jsxs(Field, { children: [_jsx(Input, { type: "text", 
                                                        // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                                                        placeholder: "36.5", value: fields.patientTemperature, onChange: (e) => handleChange("patientTemperature", e.target.value) }), _jsx(FieldDescription, { children: "Temperature (\u00B0C)" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Health History" }), _jsx("p", { className: "text-sm text-gray-500", children: "Please check if any of the following apply" })] }), _jsxs("div", { className: "divide-y rounded-xl border overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsx(FieldLabel, { children: "Are you presently under medical care?" }), _jsx(Checkbox, { className: "size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]", checked: fields.patientisMedicalCare, onCheckedChange: (checked) => handleChange("patientisMedicalCare", checked) })] }), _jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsx(FieldLabel, { children: "Do you have any drug allergies?" }), _jsx(Checkbox, { checked: fields.patientDrugAllergy, className: "size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]", onCheckedChange: (checked) => handleChange("patientDrugAllergy", checked) })] }), _jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsx(FieldLabel, { children: "Do you have any food or environmental allergies?" }), _jsx(Checkbox, { className: "size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]", checked: fields.patientFoodAllergy, onCheckedChange: (checked) => handleChange("patientFoodAllergy", checked) })] }), _jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsx(FieldLabel, { children: "Have you ever had tuberculosis or a positive TB test?" }), _jsx(Checkbox, { className: "size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]", checked: fields.patientTBPositive, onCheckedChange: (checked) => handleChange("patientTBPositive", checked) })] }), _jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsx(FieldLabel, { children: "Have you ever been cared for by a mental health clinician?" }), _jsx(Checkbox, { className: "size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]", checked: fields.patientHasClinician, onCheckedChange: (checked) => handleChange("patientHasClinician", checked) })] }), _jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsx(FieldLabel, { children: "Have you ever restricted your eating?" }), _jsx(Checkbox, { className: "size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]", checked: fields.patientDiet, onCheckedChange: (checked) => handleChange("patientDiet", checked) })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Symptoms" }), _jsxs(Field, { children: [_jsx(Input, { placeholder: "e.g. fever, cough, headache", value: fields.patientSymptoms, onChange: (e) => handleChange("patientSymptoms", e.target.value) }), _jsx(FieldDescription, { children: "Describe current symptoms" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Diagnosis" }), _jsx(Button, { type: "button", size: "sm", className: "!bg-[#00a896] text-white hover:bg-[#028090]", onClick: handleAddDiagnosis, children: "+ Add" })] }), _jsx("div", { className: "space-y-3", children: patientDiagnosis.map((diagnosis, index) => (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-xl bg-gray-50", children: [_jsx(Field, { children: _jsx(Input, { placeholder: "Diagnosis", value: diagnosis.diagnosis, onChange: (e) => handleDiagnosisChange(index, "diagnosis", e.target.value) }) }), _jsx(Field, { children: _jsx(Input, { placeholder: "Severity", value: diagnosis.severity, onChange: (e) => handleDiagnosisChange(index, "severity", e.target.value) }) }), _jsx(Field, { children: _jsx(Input, { placeholder: "Notes", value: diagnosis.notes, onChange: (e) => handleDiagnosisChange(index, "notes", e.target.value) }) }), patientDiagnosis.length > 1 && (_jsx("div", { className: "flex items-center", children: _jsx(Button, { type: "button", variant: "destructive", size: "sm", className: "!bg-red-400 text-white hover:bg-[#028090]", onClick: () => handleRemoveDiagnosis(index), children: "Remove" }) }))] }, index))) })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Family History" }), _jsx("p", { className: "text-sm text-gray-500", children: "Provide age and indicate relevant conditions" })] }), _jsxs("div", { className: "grid grid-cols-[120px_80px_1fr_120px_80px_100px] px-3 text-l text-gray-600 uppercase items-center", children: [_jsx("span", { children: "Relation" }), _jsx("span", { children: "Age" }), _jsx("span", { children: "Health Problems" }), _jsx("span", { className: "text-center", children: " In Good Health" }), _jsx("span", { className: "text-center", children: "Alive" }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { type: "button", size: "sm", className: "!bg-[#00a896] text-white hover:bg-[#028090]", onClick: handleAddHistory, children: "+ Add" }) })] }), _jsx("div", { className: "divide-y border rounded-xl overflow-hidden", children: familyHistory.map((history, index) => (_jsxs("div", { className: "grid grid-cols-[120px_80px_1fr_120px_80px_100px] items-center gap-3 p-3", children: [_jsx(Input, { placeholder: "Relation", value: history.relation, onChange: (e) => handleHistoryChange(index, "relation", e.target.value) }), _jsx(Input, { placeholder: "Age", value: history.age, onChange: (e) => handleHistoryChange(index, "age", e.target.value) }), _jsx(Input, { placeholder: "Health Problems", value: history.healthProblems, onChange: (e) => handleHistoryChange(index, "healthProblems", e.target.value) }), _jsx("div", { className: "flex justify-center", children: _jsx(Checkbox, { className: "size-6 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]", checked: history.goodHealth, onCheckedChange: (checked) => handleHistoryChange(index, "goodHealth", checked === true) }) }), _jsx("div", { className: "flex justify-center", children: _jsx(Checkbox, { className: "size-6 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]", checked: history.isAlive, onCheckedChange: (checked) => handleHistoryChange(index, "isAlive", checked === true) }) }), _jsx("div", { className: "flex justify-center", children: familyHistory.length > 1 && (_jsx(Button, { type: "button", variant: "destructive", size: "sm", className: "!bg-red-400 text-white hover:bg-red-500", onClick: () => handleRemoveHistory(index), children: "Remove" })) })] }, index))) }), _jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Privacy Notice" }), _jsx("div", { children: _jsx(Field, { children: _jsxs("label", { className: "flex items-start gap-3 p-3 ", children: [_jsx(Checkbox, { className: "size-5 rounded-none !border-black\r\n                        data-[state=unchecked]:!bg-white\r\n                        data-[state=checked]:!bg-[#00a896]" }), _jsx("span", { className: "text-sm text-gray-700 leading-relaxed", children: "I confirm that I have informed the patient about the privacy notice." })] }) }) })] }) }) })] }), !userIsAdmin && linkedUsers.length > 0 && (_jsxs("div", { className: "bg-blue-50 p-4 rounded-lg border border-blue-200", children: [_jsxs(Label, { className: "text-lg md:text-xl font-medium text-blue-800 mb-2", children: [userIsSecretary && "Share with Doctor", userIsDoctor && "Share with Secretary"] }), _jsxs(Select, { value: selectedLinkedUser, onValueChange: setSelectedLinkedUser, children: [_jsx(SelectTrigger, { className: "!bg-white !text-base md:!text-lg h-12 md:h-14 border-blue-300", children: _jsx(SelectValue, { placeholder: `Select a ${userIsSecretary ? "doctor" : "secretary"} to share this record with` }) }), _jsx(SelectContent, { children: linkedUsers.map((linkedUser) => (_jsxs(SelectItem, { value: linkedUser.id, children: [linkedUser.firstName, " ", linkedUser.lastName, linkedUser.field && ` - ${linkedUser.field}`] }, linkedUser.id))) })] })] })), _jsx("div", { className: "flex justify-center mt-8 md:mt-10", children: _jsx(Button, { type: "submit", disabled: isLoading, className: "!bg-orange-400 hover:!bg-orange-500 !text-white !px-8 md:!px-10 !py-4 md:!py-6 !text-xl md:!text-2xl rounded-lg md:rounded-xl transition-all disabled:opacity-50", children: isLoading ? "Saving..." : "Save Record" }) })] }));
}
