"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
export function ModeToggle() {
    const { setTheme, theme } = useTheme();
    return (_jsx(TooltipProvider, { disableHoverableContent: true, children: _jsxs(Tooltip, { delayDuration: 100, children: [_jsx(TooltipTrigger, { asChild: true, children: _jsxs(Button, { className: "rounded-full w-8 h-8 bg-background mr-2", variant: "outline", size: "icon", onClick: () => setTheme(theme === "dark" ? "light" : "dark"), children: [_jsx(SunIcon, { className: "w-[1.2rem] h-[1.2rem] rotate-90 scale-0 transition-transform ease-in-out duration-500 dark:rotate-0 dark:scale-100" }), _jsx(MoonIcon, { className: "absolute w-[1.2rem] h-[1.2rem] rotate-0 scale-1000 transition-transform ease-in-out duration-500 dark:-rotate-90 dark:scale-0" }), _jsx("span", { className: "sr-only", children: "Switch Theme" })] }) }), _jsx(TooltipContent, { side: "bottom", children: "Switch Theme" })] }) }));
}
