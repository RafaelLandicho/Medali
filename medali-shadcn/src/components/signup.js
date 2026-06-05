import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Switch } from "@/components/animate-ui/components/radix/switch";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldContent, } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, } from "@/components/ui/input-otp";
import { useState } from "react";
import { auth, db } from "@/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { set, ref } from "firebase/database";
import { useNavigate } from "react-router-dom";
export function SignUp() {
    const [isDoctor, setIsDoctor] = useState(false);
    const navigate = useNavigate();
    const [fields, setFields] = useState({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        type: "",
        department: "",
        birthMonth: "",
        birthYear: "",
        birthDay: "",
        medicalId: "",
    });
    const [errors, setErrors] = useState({});
    const handleChange = (key, value) => {
        setFields((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" }));
    };
    const validateFields = () => {
        const newErrors = {};
        if (!fields.firstName)
            newErrors.firstName = "First name is required.";
        if (!fields.email)
            newErrors.email = "Email is required.";
        if (!fields.username)
            newErrors.username = "Username is required.";
        if (!fields.password)
            newErrors.password = "Password is required.";
        if (!fields.birthMonth)
            newErrors.birthMonth = "Birth month is required.";
        if (!fields.birthYear)
            newErrors.birthYear = "Birth year is required.";
        if (!fields.birthDay)
            newErrors.birthDay = "Birth day is required.";
        if (isDoctor && !fields.department)
            newErrors.department = "Department is required.";
        if (isDoctor && !fields.medicalId)
            newErrors.medicalId = "Medical ID is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSignUp = async () => {
        if (!validateFields())
            return;
        try {
            const userDetails = await createUserWithEmailAndPassword(auth, fields.email, fields.password);
            const user = userDetails.user;
            await set(ref(db, "users/" + user.uid), {
                firstName: fields.firstName,
                lastName: fields.lastName,
                username: fields.username,
                email: fields.email,
                password: fields.password,
                type: isDoctor ? "doctor" : "secretary",
                medicalId: isDoctor ? fields.medicalId : null,
                field: isDoctor ? fields.department : null,
                requests: [],
                ...(isDoctor ? { secretaries: [] } : { doctors: [] }),
            });
            toast.success("Account created successfully!");
            navigate("/records");
        }
        catch (error) {
            setErrors({ general: error.message });
        }
    };
    return (_jsx("div", { className: "w-screen max-w-md", children: _jsx("form", { onSubmit: (e) => {
                e.preventDefault();
                handleSignUp();
            }, children: _jsxs(FieldGroup, { children: [_jsxs(FieldSet, { children: [_jsxs(Field, { children: [_jsx(FieldLabel, { children: "First Name" }), _jsx(Input, { placeholder: "First Name", value: fields.firstName, onChange: (e) => handleChange("firstName", e.target.value) }), errors.firstName && (_jsx("p", { className: "text-red-600", children: errors.firstName }))] }), _jsxs(Field, { children: [_jsx(FieldLabel, { children: "Last Name" }), _jsx(Input, { placeholder: "Last Name", value: fields.lastName, onChange: (e) => handleChange("lastName", e.target.value) })] }), _jsxs(Field, { children: [_jsx(FieldLabel, { children: "Email" }), _jsx(Input, { placeholder: "@email.com", value: fields.email, onChange: (e) => handleChange("email", e.target.value) }), errors.email && _jsx("p", { className: "text-red-600", children: errors.email })] }), _jsxs(Field, { children: [_jsx(FieldLabel, { children: "Username" }), _jsx(Input, { placeholder: "Add a username", value: fields.username, onChange: (e) => handleChange("username", e.target.value) }), errors.username && (_jsx("p", { className: "text-red-600", children: errors.username }))] }), _jsxs(Field, { children: [_jsx(FieldLabel, { children: "Password" }), _jsx(Input, { type: "password", placeholder: "********", value: fields.password, onChange: (e) => handleChange("password", e.target.value) }), errors.password && (_jsx("p", { className: "text-red-600", children: errors.password }))] }), _jsxs(Field, { orientation: "horizontal", children: [_jsxs(FieldContent, { children: [_jsx(FieldLabel, { children: "Are you a Doctor?" }), _jsx(FieldDescription, { children: "Toggle to sign up as a doctor" })] }), _jsx(Switch, { checked: isDoctor, onCheckedChange: setIsDoctor })] }), isDoctor && (_jsxs(_Fragment, { children: [_jsxs(Field, { children: [_jsx(FieldLabel, { children: "Department" }), _jsxs(Select, { value: fields.department, onValueChange: (value) => handleChange("department", value), children: [_jsx(SelectTrigger, { className: "!bg-blue-400 !text-white ", children: _jsx(SelectValue, { placeholder: "Choose department" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Family Medicine", children: "Family Medicine" }), _jsx(SelectItem, { value: "Internal Medicine", children: "Internal Medicine" }), _jsx(SelectItem, { value: "Pediatrics", children: "Pediatrics" }), _jsx(SelectItem, { value: "Psychiatry", children: "Psychiatry" }), _jsx(SelectItem, { value: "Radiology", children: "Radiology" }), _jsx(SelectItem, { value: "General Surgery", children: "General Surgery" }), _jsx(SelectItem, { value: "Obstetrics and Gynecology", children: "Obstetrics and Gynecology" }), _jsx(SelectItem, { value: "Others", children: "Others" })] })] }), errors.department && (_jsx("p", { className: "text-red-600", children: errors.department }))] }), _jsxs(Field, { children: [_jsx(FieldLabel, { children: "Medical ID" }), _jsxs(InputOTP, { maxLength: 9, value: fields.medicalId, onChange: (value) => handleChange("medicalId", value), children: [_jsxs(InputOTPGroup, { children: [_jsx(InputOTPSlot, { index: 0 }), _jsx(InputOTPSlot, { index: 1 }), _jsx(InputOTPSlot, { index: 2 })] }), _jsx(InputOTPSeparator, {}), _jsxs(InputOTPGroup, { children: [_jsx(InputOTPSlot, { index: 3 }), _jsx(InputOTPSlot, { index: 4 }), _jsx(InputOTPSlot, { index: 5 })] }), _jsx(InputOTPSeparator, {}), _jsxs(InputOTPGroup, { children: [_jsx(InputOTPSlot, { index: 6 }), _jsx(InputOTPSlot, { index: 7 }), _jsx(InputOTPSlot, { index: 8 })] })] }), errors.medicalId && (_jsx("p", { className: "text-red-600", children: errors.medicalId }))] })] })), _jsxs("div", { className: "grid grid-cols-3 gap-4 relative", children: [_jsxs(Field, { children: [_jsx(FieldLabel, { children: "Month" }), _jsxs(Select, { value: fields.birthMonth, onValueChange: (value) => handleChange("birthMonth", value), children: [_jsx(SelectTrigger, { className: "!bg-blue-400 !text-white", children: _jsx(SelectValue, { placeholder: "MM" }) }), _jsx(SelectContent, { children: Array.from({ length: 12 }, (_, i) => {
                                                            const month = String(i + 1).padStart(2, "0");
                                                            return (_jsx(SelectItem, { value: month, children: month }, month));
                                                        }) })] }), errors.birthMonth && (_jsx("p", { className: "text-red-600", children: errors.birthMonth }))] }), _jsxs(Field, { children: [_jsx(FieldLabel, { children: "Year" }), _jsxs(Select, { value: fields.birthYear, onValueChange: (value) => handleChange("birthYear", value), children: [_jsx(SelectTrigger, { className: "!bg-blue-400 !text-white", children: _jsx(SelectValue, { placeholder: "YYYY" }) }), _jsx(SelectContent, { children: Array.from({ length: 76 }, (_, i) => {
                                                            const year = new Date().getFullYear() - i;
                                                            return (_jsx(SelectItem, { value: String(year), children: year }, year));
                                                        }) })] }), errors.birthYear && (_jsx("p", { className: "text-red-600", children: errors.birthYear }))] }), _jsxs(Field, { children: [_jsx(FieldLabel, { children: "Day" }), _jsx(Input, { type: "text", inputMode: "numeric", placeholder: "DD", value: fields.birthDay, onChange: (e) => handleChange("birthDay", e.target.value) }), errors.birthDay && (_jsx("p", { className: "text-red-600", children: errors.birthDay }))] })] }), errors.general && (_jsx("p", { className: "text-red-600 mt-2", children: errors.general }))] }), _jsx(Field, { orientation: "horizontal", children: _jsx(Button, { type: "submit", className: "!bg-blue-500 !text-white", children: "Submit" }) })] }) }) }));
}
