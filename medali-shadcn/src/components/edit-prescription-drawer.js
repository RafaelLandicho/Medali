"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, } from "@/components/ui/drawer";
import { EditPrescription } from "./edit-prescription";
import { DialogDescription } from "@radix-ui/react-dialog";
export function PrescriptionDrawer({ open, onOpenChange, prescription, }) {
    const isMobile = useIsMobile();
    if (isMobile) {
        return (_jsx(Drawer, { open: open, onOpenChange: onOpenChange, children: _jsxs(DrawerContent, { children: [_jsxs(DrawerHeader, { children: [_jsx(DrawerTitle, { children: "Edit Prescription" }), _jsx(DialogDescription, { children: "Edit you're patient prescription. Click save when you're done." })] }), _jsx("div", { className: "p-4", children: _jsx(EditPrescription, { open: open, onOpenChange: onOpenChange, prescription: prescription }) }), _jsx(DrawerFooter, { children: _jsx(DrawerClose, { asChild: true, children: _jsx(Button, { variant: "outline", children: "Close" }) }) })] }) }));
    }
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-[800px] w-[90vw]", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Edit Prescription" }) }), _jsx(DialogDescription, { children: "Edit you're patient prescription. Click save when you're done." }), _jsx(EditPrescription, { open: open, onOpenChange: onOpenChange, prescription: prescription })] }) }));
}
