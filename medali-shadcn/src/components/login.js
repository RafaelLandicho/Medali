import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet, } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { auth } from "@/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
export function Login() {
    const [fields, setFields] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const handleChange = (key, value) => {
        setFields((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" })); // clear error on change
    };
    const validateFields = () => {
        const newErrors = {};
        if (!fields.email)
            newErrors.email = "Email is required.";
        if (!fields.password)
            newErrors.password = "Password is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateFields())
            return; // stop if validation fails
        try {
            const userCredential = await signInWithEmailAndPassword(auth, fields.email, fields.password);
            const user = userCredential.user;
            const token = await user.getIdToken();
            sessionStorage.setItem("accessToken", token);
            navigate("/records");
        }
        catch (err) {
            // map Firebase errors to UI
            switch (err.code) {
                case "auth/user-not-found":
                    setErrors({ email: "No user found with this email." });
                    break;
                case "auth/wrong-password":
                    setErrors({ password: "Incorrect password. Please try again." });
                    break;
                case "auth/invalid-email":
                    setErrors({ email: "Invalid email address." });
                    break;
                default:
                    setErrors({ general: "Login failed. Please try again later." });
            }
        }
    };
    return (_jsx("div", { className: "w-screen max-w-md text", children: _jsx("form", { onSubmit: handleLogin, children: _jsxs(FieldGroup, { children: [_jsxs(FieldSet, { children: [_jsxs(Field, { children: [_jsx(FieldLabel, { className: "text-l font-medium", children: "Email" }), _jsx(Input, { className: "!h-12 !text-l", type: "email", placeholder: "example@email.com", value: fields.email, onChange: (e) => handleChange("email", e.target.value) }), errors.email && (_jsx("p", { className: "!text-red-600 !text-l !mt-2", children: errors.email }))] }), _jsxs(Field, { children: [_jsx(FieldLabel, { className: "text-l font-medium", children: "Password" }), _jsx(FieldDescription, { children: "Must be at least 8 characters long." }), _jsx(Input, { className: "!h-12 !text-lg", type: "password", placeholder: "********", value: fields.password, onChange: (e) => handleChange("password", e.target.value) }), errors.password && (_jsx("p", { className: "!text-red-600 !text-lg !mt-2", children: errors.password }))] }), errors.general && (_jsx("p", { className: "!text-red-600 !text-lg !mt-2", children: errors.general }))] }), _jsx(Field, { orientation: "horizontal", children: _jsx("div", { className: "flex items-center justify-center w-full", children: _jsx(Button, { type: "submit", className: "!bg-blue-400 !text-white border border-none rounded-none  ", children: "Login" }) }) })] }) }) }));
}
