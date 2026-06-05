"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import { ref, get, update } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import { Card } from "@/components/ui/card";
import { Field, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export function EditProfile() {
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    // ================= FETCH =================
    useEffect(() => {
        if (!user)
            return;
        const fetchUser = async () => {
            const snapshot = await get(ref(db, `users/${user.uid}`));
            if (snapshot.exists()) {
                setUserData(snapshot.val());
            }
            setLoading(false);
        };
        fetchUser();
    }, [user]);
    const handleChange = (key, value) => {
        setUserData((prev) => (prev ? { ...prev, [key]: value } : prev));
    };
    const handleAddEducation = () => {
        setUserData((prev) => prev
            ? {
                ...prev,
                profileEducation: [
                    ...(prev.profileEducation || []),
                    { school: "", residency: "", training: "" },
                ],
            }
            : prev);
    };
    const handleAddSchedule = () => {
        setUserData((prev) => prev
            ? {
                ...prev,
                schedule: [
                    ...(prev.schedule || []),
                    { clinic: "", day: "", time: "", fee: 0 },
                ],
            }
            : prev);
    };
    const handleAddFaq = () => {
        setUserData((prev) => prev
            ? { ...prev, faq: [...(prev.faq || []), { question: "", answer: "" }] }
            : prev);
    };
    const removeEducation = (index) => {
        setUserData((prev) => prev
            ? {
                ...prev,
                profileEducation: prev.profileEducation?.filter((_, i) => i !== index),
            }
            : prev);
    };
    const removeSchedule = (index) => {
        setUserData((prev) => prev
            ? { ...prev, schedule: prev.schedule?.filter((_, i) => i !== index) }
            : prev);
    };
    const removeFaq = (index) => {
        setUserData((prev) => prev ? { ...prev, faq: prev.faq?.filter((_, i) => i !== index) } : prev);
    };
    const handleAddCertification = () => {
        setUserData((prev) => prev
            ? {
                ...prev,
                profileCertification: [...(prev.profileCertification || []), ""],
            }
            : prev);
    };
    const handleAddAffiliation = () => {
        setUserData((prev) => prev
            ? {
                ...prev,
                profileAffiliation: [...(prev.profileAffiliation || []), ""],
            }
            : prev);
    };
    const removeCertification = (index) => {
        setUserData((prev) => prev
            ? {
                ...prev,
                profileCertification: prev.profileCertification?.filter((_, i) => i !== index),
            }
            : prev);
    };
    const removeAffiliation = (index) => {
        setUserData((prev) => prev
            ? {
                ...prev,
                profileAffiliation: prev.profileAffiliation?.filter((_, i) => i !== index),
            }
            : prev);
    };
    const handleSave = async () => {
        if (!user || !userData)
            return;
        await update(ref(db, `users/${user.uid}`), userData);
        toast.success("Profile updated!");
    };
    if (loading)
        return _jsx("div", { className: "text-xl", children: "Loading profile..." });
    if (!userData)
        return _jsx("div", { children: "No data found" });
    return (_jsx("div", { className: "px-4 md:px-8 lg:px-12", children: _jsx(Card, { className: "p-6 md:p-8 rounded-2xl", children: _jsxs("div", { className: "max-w-5xl mx-auto space-y-8", children: [_jsx("h1", { className: "text-2xl md:text-3xl font-semibold text-center text-orange-500", children: "Edit Profile" }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Basic Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Field, { children: [_jsx(Input, { value: userData.firstName || "", onChange: (e) => handleChange("firstName", e.target.value) }), _jsx(FieldDescription, { children: "First Name" })] }), _jsxs(Field, { children: [_jsx(Input, { value: userData.lastName || "", onChange: (e) => handleChange("lastName", e.target.value) }), _jsx(FieldDescription, { children: "Last Name" })] }), _jsxs(Field, { children: [_jsx(Input, { value: userData.username || "", onChange: (e) => handleChange("username", e.target.value) }), _jsx(FieldDescription, { children: "Username" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Professional Details" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(Input, { value: userData.profileDescription || "", onChange: (e) => handleChange("profileDescription", e.target.value), placeholder: "Description" }), _jsx(Input, { value: userData.profileExperience ?? "", onChange: (e) => handleChange("profileExperience", Number(e.target.value)), placeholder: "Experience" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Certifications" }), _jsx(Button, { onClick: handleAddCertification, children: "+ Add" })] }), userData.profileCertification?.map((cert, index) => (_jsxs("div", { className: "flex gap-3 p-4 border rounded-xl bg-gray-50", children: [_jsx(Input, { value: cert, onChange: (e) => {
                                                            const updated = [
                                                                ...(userData.profileCertification || []),
                                                            ];
                                                            updated[index] = e.target.value;
                                                            handleChange("profileCertification", updated);
                                                        }, placeholder: "Certification" }), _jsx(Button, { onClick: () => removeCertification(index), className: "!bg-red-400 text-white", children: "Remove" })] }, index)))] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Affiliations" }), _jsx(Button, { onClick: handleAddAffiliation, children: "+ Add" })] }), userData.profileAffiliation?.map((aff, index) => (_jsxs("div", { className: "flex gap-3 p-4 border rounded-xl bg-gray-50", children: [_jsx(Input, { value: aff, onChange: (e) => {
                                                            const updated = [
                                                                ...(userData.profileAffiliation || []),
                                                            ];
                                                            updated[index] = e.target.value;
                                                            handleChange("profileAffiliation", updated);
                                                        }, placeholder: "Affiliation" }), _jsx(Button, { onClick: () => removeAffiliation(index), className: "!bg-red-400 text-white", children: "Remove" })] }, index)))] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Education" }), _jsx(Button, { onClick: handleAddEducation, children: "+ Add" })] }), userData.profileEducation?.map((edu, index) => (_jsxs("div", { className: "grid md:grid-cols-4 gap-3 p-4 border rounded-xl bg-gray-50", children: [_jsx(Input, { value: edu.school, onChange: (e) => {
                                            const updated = [...(userData.profileEducation || [])];
                                            updated[index].school = e.target.value;
                                            handleChange("profileEducation", updated);
                                        }, placeholder: "School" }), _jsx(Input, { value: edu.residency, onChange: (e) => {
                                            const updated = [...(userData.profileEducation || [])];
                                            updated[index].residency = e.target.value;
                                            handleChange("profileEducation", updated);
                                        }, placeholder: "Residency" }), _jsx(Input, { value: edu.training, onChange: (e) => {
                                            const updated = [...(userData.profileEducation || [])];
                                            updated[index].training = e.target.value;
                                            handleChange("profileEducation", updated);
                                        }, placeholder: "Training" }), _jsx(Button, { onClick: () => removeEducation(index), className: "!bg-red-400 text-white", children: "Remove" })] }, index)))] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "Schedule" }), _jsx(Button, { onClick: handleAddSchedule, children: "+ Add" })] }), userData.schedule?.map((s, index) => (_jsxs("div", { className: "grid md:grid-cols-5 gap-3 p-4 border rounded-xl bg-gray-50", children: [_jsx(Input, { value: s.clinic, onChange: (e) => {
                                            const updated = [...(userData.schedule || [])];
                                            updated[index].clinic = e.target.value;
                                            handleChange("schedule", updated);
                                        }, placeholder: "Clinic" }), _jsx(Input, { value: s.day, onChange: (e) => {
                                            const updated = [...(userData.schedule || [])];
                                            updated[index].day = e.target.value;
                                            handleChange("schedule", updated);
                                        }, placeholder: "Day" }), _jsx(Input, { value: s.time, onChange: (e) => {
                                            const updated = [...(userData.schedule || [])];
                                            updated[index].time = e.target.value;
                                            handleChange("schedule", updated);
                                        }, placeholder: "Time" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500", children: "\u20B1" }), _jsx(Input, { type: "number", className: "pl-7", value: s.fee, onChange: (e) => {
                                                    const updated = [...(userData.schedule || [])];
                                                    updated[index].fee = Number(e.target.value);
                                                    handleChange("schedule", updated);
                                                }, placeholder: "0" })] }), _jsx(Button, { onClick: () => removeSchedule(index), className: "!bg-red-400 text-white", children: "Remove" })] }, index)))] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("h2", { className: "text-lg md:text-xl font-semibold", children: "FAQ" }), _jsx(Button, { onClick: handleAddFaq, children: "+ Add" })] }), userData.faq?.map((f, index) => (_jsxs("div", { className: "grid md:grid-cols-3 gap-3 p-4 border rounded-xl bg-gray-50", children: [_jsx(Input, { value: f.question, onChange: (e) => {
                                            const updated = [...(userData.faq || [])];
                                            updated[index].question = e.target.value;
                                            handleChange("faq", updated);
                                        }, placeholder: "Question" }), _jsx(Input, { value: f.answer, onChange: (e) => {
                                            const updated = [...(userData.faq || [])];
                                            updated[index].answer = e.target.value;
                                            handleChange("faq", updated);
                                        }, placeholder: "Answer" }), _jsx(Button, { onClick: () => removeFaq(index), className: "!bg-red-400 text-white", children: "Remove" })] }, index)))] }), _jsx("div", { className: "flex justify-center pt-6", children: _jsx(Button, { onClick: handleSave, className: "!bg-orange-400 text-white", children: "Save Profile" }) })] }) }) }));
}
