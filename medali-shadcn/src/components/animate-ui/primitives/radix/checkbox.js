'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { motion } from 'motion/react';
import { getStrictContext } from '@/lib/get-strict-context';
import { useControlledState } from '@/hooks/use-controlled-state';
const [CheckboxProvider, useCheckbox] = getStrictContext('CheckboxContext');
function Checkbox({ defaultChecked, checked, onCheckedChange, disabled, required, name, value, ...props }) {
    const [isChecked, setIsChecked] = useControlledState({
        value: checked,
        defaultValue: defaultChecked,
        onChange: onCheckedChange,
    });
    return (_jsx(CheckboxProvider, { value: { isChecked, setIsChecked }, children: _jsx(CheckboxPrimitive.Root, { defaultChecked: defaultChecked, checked: checked, onCheckedChange: setIsChecked, disabled: disabled, required: required, name: name, value: value, asChild: true, children: _jsx(motion.button, { "data-slot": "checkbox", whileTap: { scale: 0.95 }, whileHover: { scale: 1.05 }, ...props }) }) }));
}
function CheckboxIndicator(props) {
    const { isChecked } = useCheckbox();
    return (_jsx(CheckboxPrimitive.Indicator, { forceMount: true, asChild: true, children: _jsx(motion.svg, { "data-slot": "checkbox-indicator", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: "3.5", stroke: "currentColor", initial: "unchecked", animate: isChecked ? 'checked' : 'unchecked', ...props, children: isChecked === 'indeterminate' ? (_jsx(motion.line, { x1: "5", y1: "12", x2: "19", y2: "12", strokeLinecap: "round", initial: { pathLength: 0, opacity: 0 }, animate: {
                    pathLength: 1,
                    opacity: 1,
                    transition: { duration: 0.2 },
                } })) : (_jsx(motion.path, { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 12.75l6 6 9-13.5", variants: {
                    checked: {
                        pathLength: 1,
                        opacity: 1,
                        transition: {
                            duration: 0.2,
                            delay: 0.2,
                        },
                    },
                    unchecked: {
                        pathLength: 0,
                        opacity: 0,
                        transition: {
                            duration: 0.2,
                        },
                    },
                } })) }) }));
}
export { Checkbox, CheckboxIndicator, useCheckbox, };
