import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function CircleXIcon({ size = 24, color = "currentColor", strokeWidth = 2, className, ...props }) {
    return (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", className: className, ...props, children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("path", { d: "m15 9l-6 6m0-6l6 6" })] }));
}
