"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { Ellipsis, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/menu-list";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CollapseMenuButton } from "@/components/admin-panel/collapse-menu-button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
export function Menu({ isOpen }) {
    const pathname = usePathname();
    const menuList = getMenuList(pathname);
    return (_jsx(ScrollArea, { className: "[&>div>div[style]]:!block", children: _jsx("nav", { className: "mt-8 h-full w-full", children: _jsxs("ul", { className: "flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2", children: [menuList.map(({ groupLabel, menus }, index) => (_jsxs("li", { className: cn("w-full", groupLabel ? "pt-5" : ""), children: [(isOpen && groupLabel) || isOpen === undefined ? (_jsx("p", { className: "text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate", children: groupLabel })) : !isOpen && isOpen !== undefined && groupLabel ? (_jsx(TooltipProvider, { children: _jsxs(Tooltip, { delayDuration: 100, children: [_jsx(TooltipTrigger, { className: "w-full", children: _jsx("div", { className: "w-full flex justify-center items-center", children: _jsx(Ellipsis, { className: "h-5 w-5" }) }) }), _jsx(TooltipContent, { side: "right", children: _jsx("p", { children: groupLabel }) })] }) })) : (_jsx("p", { className: "pb-2" })), menus.map(({ href, label, icon: Icon, active, submenus }, index) => !submenus || submenus.length === 0 ? (_jsx("div", { className: "w-full", children: _jsx(TooltipProvider, { disableHoverableContent: true, children: _jsxs(Tooltip, { delayDuration: 100, children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { variant: (active === undefined &&
                                                        pathname.startsWith(href)) ||
                                                        active
                                                        ? "secondary"
                                                        : "ghost", className: "w-full justify-start h-10 mb-1", asChild: true, children: _jsxs(Link, { href: href, children: [_jsx("span", { className: cn(isOpen === false ? "" : "mr-4"), children: _jsx(Icon, { size: 18 }) }), _jsx("p", { className: cn("max-w-[200px] truncate", isOpen === false
                                                                    ? "-translate-x-96 opacity-0"
                                                                    : "translate-x-0 opacity-100"), children: label })] }) }) }), isOpen === false && (_jsx(TooltipContent, { side: "right", children: label }))] }) }) }, index)) : (_jsx("div", { className: "w-full", children: _jsx(CollapseMenuButton, { icon: Icon, label: label, active: active === undefined
                                        ? pathname.startsWith(href)
                                        : active, submenus: submenus, isOpen: isOpen }) }, index)))] }, index))), _jsx("li", { className: "w-full grow flex items-end", children: _jsx(TooltipProvider, { disableHoverableContent: true, children: _jsxs(Tooltip, { delayDuration: 100, children: [_jsx(TooltipTrigger, { asChild: true, children: _jsxs(Button, { onClick: () => { }, variant: "outline", className: "w-full justify-center h-10 mt-5", children: [_jsx("span", { className: cn(isOpen === false ? "" : "mr-4"), children: _jsx(LogOut, { size: 18 }) }), _jsx("p", { className: cn("whitespace-nowrap", isOpen === false ? "opacity-0 hidden" : "opacity-100"), children: "Sign out" })] }) }), isOpen === false && (_jsx(TooltipContent, { side: "right", children: "Sign out" }))] }) }) })] }) }) }));
}
