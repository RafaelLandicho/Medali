import { jsx as _jsx } from "react/jsx-runtime";
export function PillIcon({ size = 24, color = "currentColor", strokeWidth = 2, className, ...props }) {
    return (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", className: className, ...props, children: _jsx("path", { d: "m10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7m-2-12l7 7" }) }));
}
