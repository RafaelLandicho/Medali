"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas-pro";
import { db } from "@/firebaseConfig";
import { ref, set, push } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
export function ViewFullPrescription({ patient: prescription, }) {
    const { user } = useAuth();
    const [fields, setFields] = useState(prescription);
    const [drugs, setDrugs] = useState(prescription.drugs || []);
    const [diagnosis, setDiagnosis] = useState(prescription.diagnosis || []);
    const printRef = useRef(null);
    const logsRef = ref(db, "logs/");
    const updateLog = async () => {
        const newLog = push(logsRef);
        await set(newLog, {
            prescriptionLog: `Prescription ${fields.id} ${fields.patientFirstName} ${fields.patientLastName} downloaded by ${user?.firstName} ${user?.lastName}`,
            logTime: new Date().toLocaleString(),
        });
    };
    useEffect(() => {
        setFields(prescription);
        setDrugs(prescription.drugs || []);
        setDiagnosis(prescription.diagnosis || []);
    }, [prescription]);
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
        link.download = `${fields.patientFirstName}_${fields.patientLastName}_Prescription.png`;
        link.click();
        updateLog();
    };
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx("div", { className: "overflow-auto max-h-[85vh] bg-gray-100 p-4 rounded-xl", children: _jsxs("div", { ref: printRef, className: "w-full max-w-[794px] min-h-[1123px] bg-white mx-auto shadow-xl border border-gray-300 text-[13px] text-[#5a0033] font-sans", children: [_jsx("div", { className: "text-center pt-10 pb-4", children: _jsx("h1", { className: "text-3xl font-bold tracking-wide text-[#7b003b] uppercase", children: "Prescription Template" }) }), _jsxs("div", { className: "flex w-full h-3 mb-8", children: [_jsx("div", { className: "w-1/2 bg-red-500" }), _jsx("div", { className: "w-1/2 bg-orange-300" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-10 px-10 mb-8", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Prescription No." }), _jsx("p", { children: fields.id })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Prescription Date" }), _jsx("p", { children: fields.createdAt })] })] }), _jsx("div", { className: "px-10", children: _jsx("div", { className: "bg-orange-200 text-[#7b003b] font-bold px-3 py-1 mb-4", children: "Patient Information" }) }), _jsxs("div", { className: "grid grid-cols-2 gap-x-14 gap-y-4 px-10 mb-8", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Name" }), _jsxs("p", { children: [fields.patientFirstName, " ", fields.patientLastName] })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Age" }), _jsx("p", { children: fields.patientAge })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Gender" }), _jsx("p", { children: fields.patientGender })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Address" }), _jsx("p", { children: fields.patientAddress })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Examination" }), _jsx("p", { children: fields.examination })] })] }), _jsx("div", { className: "px-10", children: _jsx("div", { className: "bg-orange-200 text-[#7b003b] font-bold px-3 py-1 mb-4", children: "Medical Notes / Diagnosis" }) }), _jsxs("div", { className: "grid grid-cols-2 gap-x-14 gap-y-4 px-10 mb-8", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold mb-1", children: "Diagnosis" }), Array.isArray(diagnosis) && diagnosis.length > 0 ? (diagnosis.map((d, i) => (_jsxs("p", { children: ["\u2022 ", d.diagnosis, " \u2014 ", d.severity, " ", d.notes] }, i)))) : (_jsx("p", { children: "No diagnosis listed" }))] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold mb-1", children: "Recommendation" }), _jsx("p", { children: fields.recommendation || "None" })] })] }), _jsxs("div", { className: "px-10", children: [_jsx("div", { className: "bg-orange-200 text-[#7b003b] font-bold px-3 py-1 mb-4", children: "List of Prescribed Medications" }), _jsxs("table", { className: "w-full border-collapse text-[12px] mb-12", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100 text-left", children: [_jsx("th", { className: "p-2", children: "Medication Name" }), _jsx("th", { className: "p-2", children: "Purpose" }), _jsx("th", { className: "p-2", children: "Dosage" }), _jsx("th", { className: "p-2", children: "Frequency" })] }) }), _jsx("tbody", { children: Array.isArray(drugs) && drugs.length > 0 ? (drugs.map((drug, i) => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2", children: drug.medicine }), _jsx("td", { className: "p-2", children: drug.purpose }), _jsxs("td", { className: "p-2", children: [drug.dosage, " ", drug.unit] }), _jsx("td", { className: "p-2", children: drug.frequency })] }, i)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "p-3 text-center", children: "No prescribed medications" }) })) })] })] }), _jsxs("div", { className: "grid grid-cols-2 px-10 mt-20 pb-20", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Physician Name" }), _jsxs("p", { children: ["Dr. ", fields.addedBy] }), _jsxs("div", { className: "mt-6", children: [_jsx("p", { className: "font-semibold", children: "Prescription Date" }), _jsx("p", { children: fields.createdAt })] })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Physician License / ID" }), _jsx("p", { children: fields.doctorId }), _jsxs("div", { className: "mt-10 text-center", children: [_jsx("div", { className: "border-t border-black w-52 mx-auto" }), _jsx("p", { className: "mt-2 font-semibold", children: "Physician Signature" }), _jsxs("p", { children: ["Dr. ", fields.addedBy] }), _jsx("p", { children: fields.field })] })] })] })] }) }), _jsx("div", { className: "flex justify-center", children: _jsx(Button, { onClick: handleDownloadImage, className: "!bg-orange-500 hover:!bg-orange-600 !text-white px-8", children: "Download as Image" }) })] }));
}
