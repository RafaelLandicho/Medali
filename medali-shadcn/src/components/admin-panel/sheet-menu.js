import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { MenuIcon, PanelsTopLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/admin-panel/menu";
import { Sheet, SheetHeader, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
export function SheetMenu() {
    return (_jsxs(Sheet, { children: [_jsx(SheetTrigger, { className: "lg:hidden", asChild: true, children: _jsx(Button, { className: "h-8", variant: "outline", size: "icon", children: _jsx(MenuIcon, { size: 20 }) }) }), _jsxs(SheetContent, { className: "sm:w-72 px-3 h-full flex flex-col", side: "left", children: [_jsx(SheetHeader, { children: _jsx(Button, { className: "flex justify-center items-center pb-2 pt-1", variant: "link", asChild: true, children: _jsxs(Link, { href: "/dashboard", className: "flex items-center gap-2", children: [_jsx(PanelsTopLeft, { className: "w-6 h-6 mr-1" }), _jsx(SheetTitle, { className: "font-bold text-lg", children: "Brand" })] }) }) }), _jsx(Menu, { isOpen: true })] })] }));
}
