"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { ViewFullPatient } from "./view-full-records";
export function FullRecordsDrawer({ open, onOpenChange, patient: patient, }) {
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "!w-[98vw] !max-w-[1000px] !h-[95vh] !overflow-hidden", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Full Patient Details" }) }), _jsx(ViewFullPatient, { open: open, onOpenChange: onOpenChange, patient: patient })] }) }));
}
