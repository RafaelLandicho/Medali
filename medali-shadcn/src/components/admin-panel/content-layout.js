import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navbar } from "@/components/admin-panel/navbar";
export function ContentLayout({ title, children }) {
    return (_jsxs("div", { children: [_jsx(Navbar, { title: title }), _jsx("div", { className: "container pt-8 pb-8 px-4 sm:px-8", children: children })] }));
}
