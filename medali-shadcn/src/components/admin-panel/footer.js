import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
export function Footer() {
    return (_jsx("div", { className: "z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60", children: _jsx("div", { className: "mx-4 md:mx-8 flex h-14 items-center", children: _jsxs("p", { className: "text-xs md:text-sm leading-loose text-muted-foreground text-left", children: ["Built on top of", " ", _jsx(Link, { href: "https://ui.shadcn.com", target: "_blank", rel: "noopener noreferrer", className: "font-medium underline underline-offset-4", children: "shadcn/ui" }), ". The source code is available on", " ", _jsx(Link, { href: "https://github.com/salimi-my/shadcn-ui-sidebar", target: "_blank", rel: "noopener noreferrer", className: "font-medium underline underline-offset-4", children: "GitHub" }), "."] }) }) }));
}
