import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/admin-panel/user-nav";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";
export function Navbar({ title }) {
    return (_jsx("header", { className: "sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary", children: _jsxs("div", { className: "mx-4 sm:mx-8 flex h-14 items-center", children: [_jsxs("div", { className: "flex items-center space-x-4 lg:space-x-0", children: [_jsx(SheetMenu, {}), _jsx("h1", { className: "font-bold", children: title })] }), _jsxs("div", { className: "flex flex-1 items-center justify-end", children: [_jsx(ModeToggle, {}), _jsx(UserNav, {})] })] }) }));
}
