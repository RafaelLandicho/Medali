import { jsx as _jsx } from "react/jsx-runtime";
export function MenuIcon({ size = 24, color = "currentColor", strokeWidth = 2, className, ...props }) {
    return (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", className: className, ...props, children: _jsx("path", { d: "M4 5h16M4 12h16M4 19h16" }) }));
}
