"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, } from "@/components/ui/drawer";
import { AddPrescription } from "./add-prescription";
export function PrescriptionDrawer({ open, onOpenChange, patient, }) {
    const isMobile = useIsMobile();
    if (!isMobile) {
        return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "!w-[95vw] !max-w-[1000px] h-[90vh] p-6", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add Prescription" }), _jsx(DialogDescription, { children: "Create A Prescription for you're patient herte. Click save when you're done." })] }), _jsx("div", { className: "max-h-[70vh] overflow-y-auto pr-2", children: _jsx(AddPrescription, { patient: {
                                patientId: patient.id,
                                firstName: patient.firstName,
                                lastName: patient.lastName,
                                gender: patient.gender,
                                age: patient.age,
                                address: patient.address,
                                patientDiagnosis: patient.patientDiagnosis ?? [],
                            } }) })] }) }));
    }
    return (_jsx(Drawer, { open: open, onOpenChange: onOpenChange, children: _jsxs(DrawerContent, { children: [_jsxs(DrawerHeader, { className: "text-left", children: [_jsx(DrawerTitle, { children: "Add Prescription" }), _jsx(DrawerDescription, { children: "Create A Prescription for you're patient herte. Click save when you're done." })] }), _jsx("div", { className: "flex-1 overflow-y-auto px-4 py-2", children: _jsx(AddPrescription, { patient: {
                            patientId: patient.id,
                            firstName: patient.firstName,
                            lastName: patient.lastName,
                            gender: patient.gender,
                            age: patient.age,
                            address: patient.address,
                            patientDiagnosis: patient.patientDiagnosis ?? [],
                        } }) }), _jsx(DrawerFooter, { className: "border-t mt-4", children: _jsx(DrawerClose, { asChild: true, children: _jsx(Button, { className: "!bg-red-400 !text-white", variant: "destructive", children: "Cancel" }) }) })] }) }));
}
