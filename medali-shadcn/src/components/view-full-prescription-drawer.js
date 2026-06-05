"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, } from "@/components/ui/drawer";
import { ViewFullPrescription } from "./view-full-prescription";
export function FullPrescriptionDrawer({ open, onOpenChange, prescription, }) {
    const isMobile = useIsMobile();
    if (isMobile) {
        return (_jsx(Drawer, { open: open, onOpenChange: onOpenChange, children: _jsxs(DrawerContent, { children: [_jsx(DrawerHeader, { children: _jsx(DrawerTitle, { children: "Full Prescription Details" }) }), _jsx("div", { className: "p-4", children: _jsx(ViewFullPrescription, { open: open, onOpenChange: onOpenChange, patient: prescription }) }), _jsx(DrawerFooter, { children: _jsx(DrawerClose, { asChild: true, children: _jsx(Button, { variant: "outline", children: "Close" }) }) })] }) }));
    }
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "!max-w-[1200px] !w-[90vw]", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Full Prescription Details" }) }), _jsx(ViewFullPrescription, { open: open, onOpenChange: onOpenChange, patient: prescription })] }) }));
}
