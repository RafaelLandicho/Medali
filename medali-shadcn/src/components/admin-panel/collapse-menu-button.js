"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Dot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
export function CollapseMenuButton({ icon: Icon, label, active, submenus, isOpen }) {
    const pathname = usePathname();
    const isSubmenuActive = submenus.some((submenu) => submenu.active === undefined ? submenu.href === pathname : submenu.active);
    const [isCollapsed, setIsCollapsed] = useState(isSubmenuActive);
    return isOpen ? (_jsxs(Collapsible, { open: isCollapsed, onOpenChange: setIsCollapsed, className: "w-full", children: [_jsx(CollapsibleTrigger, { className: "[&[data-state=open]>div>div>svg]:rotate-180 mb-1", asChild: true, children: _jsx(Button, { variant: isSubmenuActive ? "secondary" : "ghost", className: "w-full justify-start h-10", children: _jsxs("div", { className: "w-full items-center flex justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "mr-4", children: _jsx(Icon, { size: 18 }) }), _jsx("p", { className: cn("max-w-[150px] truncate", isOpen
                                            ? "translate-x-0 opacity-100"
                                            : "-translate-x-96 opacity-0"), children: label })] }), _jsx("div", { className: cn("whitespace-nowrap", isOpen
                                    ? "translate-x-0 opacity-100"
                                    : "-translate-x-96 opacity-0"), children: _jsx(ChevronDown, { size: 18, className: "transition-transform duration-200" }) })] }) }) }), _jsx(CollapsibleContent, { className: "overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down", children: submenus.map(({ href, label, active }, index) => (_jsx(Button, { variant: (active === undefined && pathname === href) || active
                        ? "secondary"
                        : "ghost", className: "w-full justify-start h-10 mb-1", asChild: true, children: _jsxs(Link, { href: href, children: [_jsx("span", { className: "mr-4 ml-2", children: _jsx(Dot, { size: 18 }) }), _jsx("p", { className: cn("max-w-[170px] truncate", isOpen
                                    ? "translate-x-0 opacity-100"
                                    : "-translate-x-96 opacity-0"), children: label })] }) }, index))) })] })) : (_jsxs(DropdownMenu, { children: [_jsx(TooltipProvider, { disableHoverableContent: true, children: _jsxs(Tooltip, { delayDuration: 100, children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: isSubmenuActive ? "secondary" : "ghost", className: "w-full justify-start h-10 mb-1", children: _jsx("div", { className: "w-full items-center flex justify-between", children: _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: cn(isOpen === false ? "" : "mr-4"), children: _jsx(Icon, { size: 18 }) }), _jsx("p", { className: cn("max-w-[200px] truncate", isOpen === false ? "opacity-0" : "opacity-100"), children: label })] }) }) }) }) }), _jsx(TooltipContent, { side: "right", align: "start", alignOffset: 2, children: label })] }) }), _jsxs(DropdownMenuContent, { side: "right", sideOffset: 25, align: "start", children: [_jsx(DropdownMenuLabel, { className: "max-w-[190px] truncate", children: label }), _jsx(DropdownMenuSeparator, {}), submenus.map(({ href, label, active }, index) => (_jsx(DropdownMenuItem, { asChild: true, children: _jsx(Link, { className: `cursor-pointer ${((active === undefined && pathname === href) || active) &&
                                "bg-secondary"}`, href: href, children: _jsx("p", { className: "max-w-[180px] truncate", children: label }) }) }, index))), _jsx(DropdownMenuArrow, { className: "fill-border" })] })] }));
}
