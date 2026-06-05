import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { QuickTool } from "@/components/quick-tool";
import { useAuth } from "@/auth/authprovider";
import HeaderPage from "./components/header";
export default function Layout({ children }) {
    const { user } = useAuth();
    return (_jsx("div", { className: "flex min-h-screen w-full", children: _jsxs("div", { className: "flex flex-col flex-1 min-w-0", children: [_jsx("div", { className: "sticky top-0 z-50 w-full bg-background border-b", children: _jsx(HeaderPage, {}) }), _jsx("div", { children: _jsx(QuickTool, {}) }), _jsx("main", { className: "flex-1 overflow-auto", children: children })] }) }));
}
