"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger, } from "@/components/ui/drawer";
import { AddRecords } from "./add-records";
export function AddRecordsDrawer() {
    const isMobile = useIsMobile();
    if (!isMobile) {
        // Desktop view (Dialog)
        return (_jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsx(Button, { variant: "outline", className: "!bg-green-300 !text-black", children: "Add Records" }) }), _jsxs(DialogContent, { className: "w-[90vw] sm:max-w-[800px] max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add Medical Record" }), _jsx(DialogDescription, { children: "Create a medical record for your patient. Click save when you\u2019re done." })] }), _jsx(AddRecords, {})] })] }));
    }
    return (_jsxs(Drawer, { children: [_jsx(DrawerTrigger, { asChild: true, children: _jsx(Button, { variant: "outline", className: "!bg-green-300 !text-black", children: "Add Records" }) }), _jsxs(DrawerContent, { children: [_jsxs(DrawerHeader, { className: "text-left", children: [_jsx(DrawerTitle, { children: "Add Medical Record" }), _jsx(DrawerDescription, { children: "Create a medical record for your patient. Click save when you\u2019re done." })] }), _jsx("div", { className: "flex-1 overflow-y-auto px-4 py-2", children: _jsx(AddRecords, {}) }), _jsx(DrawerFooter, { className: "border-t mt-4", children: _jsx(DrawerClose, { asChild: true, children: _jsx(Button, { className: "!bg-red-400 !text-white", variant: "destructive", children: "Cancel" }) }) })] })] }));
}
