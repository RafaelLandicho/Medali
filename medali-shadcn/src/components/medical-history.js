"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas-pro";
import { Button } from "@/components/ui/button";
import { db } from "@/firebaseConfig";
import { ref, set, push } from "firebase/database";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/auth/authprovider";
export function ViewFullPatient({ patient, onOpenChange }) {
    const { user } = useAuth();
    const [fields, setFields] = useState(patient);
    const printRef = useRef(null);
    const isMobile = useIsMobile();
    const logsRef = ref(db, "logs/");
    const updateLog = async () => {
        const newLog = push(logsRef);
        await set(newLog, {
            medicalRecordLog: `Medical Record ${fields.id} ${fields.firstName} ${fields.lastName} downloaded by ${user?.firstName} ${user?.lastName}`,
            logTime: new Date().toLocaleString(),
        });
    };
    useEffect(() => {
        setFields(patient);
        console.log(patient.medicalHistory);
    }, [patient]);
    const handleDownloadImage = async () => {
        if (!printRef.current)
            return;
        const canvas = await html2canvas(printRef.current, {
            scale: 2,
            scrollY: -window.scrollY,
            useCORS: true,
            windowWidth: document.documentElement.scrollWidth,
        });
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `${fields.firstName}_${fields.lastName}_MedicalRecord.png`;
        link.click();
        updateLog();
    };
    if (!isMobile) {
        return (_jsxs("div", { className: "flex flex-col items-center p-6", children: [_jsxs("div", { ref: printRef, className: "w-full max-w-l bg-white border border-gray-300 shadow-md font-sans text-gray-800 overflow-y-auto max-h-[80vh] p-4", children: [_jsx("div", { className: "bg-[#00a896] text-white px-6 py-3 rounded-t-md", children: _jsx("h1", { className: "text-2xl font-bold", children: "Medical Record" }) }), _jsxs("div", { className: "mt-4 grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "col-span-1 border border-gray-300 rounded shadow-sm", children: [_jsx("div", { className: "bg-[#00a896] text-white px-4 py-2 font-semibold text-lg", children: "Patient Demographics" }), _jsxs("div", { className: "p-4 grid grid-cols-1 gap-3 text-sm", children: [_jsx(Field, { label: "Patient Name", value: `${fields.firstName} ${fields.lastName}` }), _jsx(Field, { label: "Sex/Gender", value: fields.gender || "" }), _jsx(Field, { label: "Address", value: fields.address || "" }), _jsx(Field, { label: "Phone", value: fields.telephone || "" })] })] }), _jsxs("div", { className: "col-span-1 border border-gray-300 rounded shadow-sm", children: [_jsx("div", { className: "bg-[#00a896] text-white px-4 py-2 font-semibold text-lg", children: "Vital Signs" }), _jsxs("div", { className: "p-4 grid grid-cols-1 gap-3 text-sm", children: [_jsx(Field, { label: "Blood Pressure", value: fields.bloodPressure || "" }), _jsx(Field, { label: "Heart Rate", value: fields.heartRate || "" }), _jsx(Field, { label: "Respiratory Rate", value: fields.respiratoryRate || "" }), _jsx(Field, { label: "Temperature", value: fields.temperature || "" }), _jsx(Field, { label: "Oxygen Saturation", value: fields.oxygenSaturation || "" })] })] }), _jsxs("div", { className: "col-span-1 border border-gray-300 rounded shadow-sm", children: [_jsx("div", { className: "bg-[#00a896] text-white px-4 py-2 font-semibold text-lg", children: "Medical History" }), _jsxs("div", { className: "p-4 text-sm space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "font-semibold", children: "Past Illnesses / Chronic Conditions:" }), _jsx("div", { className: "border border-gray-300 p-2 rounded min-h-[60px]" })] }), _jsxs("div", { children: [_jsx("label", { className: "font-semibold", children: "Surgeries & Hospitalizations:" }), _jsx("div", { className: "border border-gray-300 p-2 rounded min-h-[60px]" })] })] })] })] })] }), _jsx("div", { className: "mt-4", children: _jsx(Button, { onClick: handleDownloadImage, className: "!bg-orange-500 text-white hover:bg-indigo-800", children: "Download Medical Record" }) })] }));
    }
}
function Field({ label, value, colSpan = 1, }) {
    return (_jsxs("div", { className: `col-span-${colSpan} flex flex-col`, children: [_jsxs("label", { className: "font-semibold", children: [label, ":"] }), _jsx("div", { className: "border border-gray-300 rounded p-1.5 bg-gray-50 min-h-[24px]", children: value || "" })] }));
}
