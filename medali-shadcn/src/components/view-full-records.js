"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas-pro";
import { Button } from "@/components/ui/button";
import { db } from "@/firebaseConfig";
import { ref, set, push } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
export function ViewFullPatient({ patient }) {
    const { user } = useAuth();
    const [fields, setFields] = useState(patient);
    const printRef = useRef(null);
    const [previousRecord, setPreviousRecord] = useState(null);
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
    }, [patient]);
    const medicalHistory = Object.values(fields.medicalHistory || {});
    const showPrevious = previousRecord === null ? fields : medicalHistory[previousRecord];
    const handleDownloadImage = async () => {
        if (!printRef.current)
            return;
        const canvas = await html2canvas(printRef.current, {
            scale: 3,
            useCORS: true,
            backgroundColor: "#ffffff",
            scrollY: -window.scrollY,
            windowWidth: printRef.current.scrollWidth,
            windowHeight: printRef.current.scrollHeight,
        });
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `${fields.firstName}_${fields.lastName}_MedicalRecord.png`;
        link.click();
        updateLog();
    };
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs("div", { className: "flex flex-wrap justify-center gap-2", children: [_jsx(Button, { onClick: () => setPreviousRecord(null), className: "!bg-orange-500 text-white", children: "Current Record" }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { className: "!bg-[#7b003b] text-white", children: "Open" }) }), _jsx(DropdownMenuContent, { children: _jsx(DropdownMenuGroup, { children: medicalHistory.map((_, index) => (_jsxs(DropdownMenuItem, { onClick: () => setPreviousRecord(index), children: ["Record ", index + 1] }, index))) }) })] }), _jsx("div", { className: "flex justify-center", children: _jsx(Button, { onClick: handleDownloadImage, className: "!bg-orange-500 hover:!bg-orange-600 text-white px-8", children: "Download Medical Record" }) })] }), _jsx("div", { className: "overflow-auto max-h-[85vh] bg-gray-100 p-4 rounded-xl", children: _jsxs("div", { ref: printRef, className: "w-full max-w-[794px] min-h-[1123px] bg-white mx-auto shadow-xl border border-gray-300 text-[13px] text-[#5a0033] font-sans", children: [_jsx("div", { className: "text-center pt-10 pb-4", children: _jsx("h1", { className: "text-3xl font-bold tracking-wide text-[#7b003b] uppercase", children: "Medical Record" }) }), _jsxs("div", { className: "flex w-full h-3 mb-8", children: [_jsx("div", { className: "w-1/2 bg-red-500" }), _jsx("div", { className: "w-1/2 bg-orange-300" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-10 px-10 mb-8", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Medical Record No." }), _jsx("p", { children: fields.id })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Record Date" }), _jsx("p", { children: new Date().toLocaleDateString() })] })] }), _jsx("div", { className: "px-10", children: _jsx("div", { className: "bg-orange-200 text-[#7b003b] font-bold px-3 py-1 mb-4", children: "Patient Information" }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-14 px-10 mb-8", children: [_jsx(Info, { label: "Name", value: `${showPrevious.firstName} ${showPrevious.lastName}` }), _jsx(Info, { label: "Age", value: showPrevious.age }), _jsx(Info, { label: "Gender", value: showPrevious.gender }), _jsx(Info, { label: "Phone Number", value: showPrevious.telephone }), _jsx(Info, { label: "Address", value: showPrevious.address }), _jsx(Info, { label: "Symptoms", value: showPrevious.symptoms })] }), _jsx("div", { className: "px-10", children: _jsx("div", { className: "bg-orange-200 text-[#7b003b] font-bold px-3 py-1 mb-4", children: "Vital Signs" }) }), _jsxs("div", { className: "grid grid-cols-2 gap-x-14 gap-y-4 px-10 mb-8", children: [_jsx(Info, { label: "Blood Pressure", value: showPrevious.bloodPressure }), _jsx(Info, { label: "Heart Rate", value: showPrevious.heartRate }), _jsx(Info, { label: "Respiratory Rate", value: showPrevious.respiratoryRate }), _jsx(Info, { label: "Temperature", value: showPrevious.temperature }), _jsx(Info, { label: "Oxygen Saturation", value: showPrevious.oxygenSaturation }), _jsx(Info, { label: "Height / Weight", value: `${showPrevious.height} / ${showPrevious.weight}` })] }), _jsxs("div", { className: "px-10", children: [_jsx("div", { className: "bg-orange-200 text-[#7b003b] font-bold px-3 py-1 mb-4", children: "Diagnosis Report" }), _jsxs("table", { className: "w-full border-collapse text-[12px] mb-10", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100 text-left", children: [_jsx("th", { className: "p-2", children: "Diagnosis" }), _jsx("th", { className: "p-2", children: "Severity" }), _jsx("th", { className: "p-2", children: "Notes" })] }) }), _jsx("tbody", { children: showPrevious.patientDiagnosis?.length ? (showPrevious.patientDiagnosis.map((diag, i) => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2", children: diag.diagnosis }), _jsx("td", { className: "p-2", children: diag.severity }), _jsx("td", { className: "p-2", children: diag.notes })] }, i)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 3, className: "p-3 text-center", children: "No diagnosis available" }) })) })] })] }), _jsxs("div", { className: "px-10", children: [_jsx("div", { className: "bg-orange-200 text-[#7b003b] font-bold px-3 py-1 mb-4", children: "Family History" }), _jsxs("table", { className: "w-full border-collapse text-[12px] mb-12", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100 text-left", children: [_jsx("th", { className: "p-2", children: "Relation" }), _jsx("th", { className: "p-2", children: "Age" }), _jsx("th", { className: "p-2", children: "Condition" }), _jsx("th", { className: "p-2", children: "Healthy" }), _jsx("th", { className: "p-2", children: "Alive" })] }) }), _jsx("tbody", { children: showPrevious.familyHistory?.length ? (showPrevious.familyHistory.map((fh, i) => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2", children: fh.relation }), _jsx("td", { className: "p-2", children: fh.age }), _jsx("td", { className: "p-2", children: fh.healthProblems }), _jsx("td", { className: "p-2", children: fh.goodHealth ? "Yes" : "No" }), _jsx("td", { className: "p-2", children: fh.isAlive ? "Yes" : "No" })] }, i)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "p-3 text-center", children: "No family history recorded" }) })) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 px-6 md:px-10 mt-20 pb-20 gap-5", children: [_jsxs("div", { className: "px-29 md:px-6 ", children: [_jsx("p", { className: "font-semibold", children: "Attending Physician" }), _jsxs("p", { children: ["Dr. ", user?.firstName, " ", user?.lastName] }), _jsxs("div", { className: "mt-6", children: [_jsx("p", { className: "font-semibold", children: "Date Generated" }), _jsx("p", { children: new Date().toLocaleDateString() })] })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-semibold", children: "Authorized Signature" }), _jsx("div", { className: "border-t border-black w-52 mx-auto mt-10" }), _jsxs("p", { className: "mt-2", children: ["Dr. ", user?.firstName, " ", user?.lastName] })] })] })] }) })] }));
}
function Info({ label, value }) {
    return (_jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: label }), _jsx("p", { children: value || "-" })] }));
}
