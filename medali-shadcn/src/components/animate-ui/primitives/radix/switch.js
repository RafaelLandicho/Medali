'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { Switch as SwitchPrimitives } from 'radix-ui';
import { motion, } from 'motion/react';
import { getStrictContext } from '@/lib/get-strict-context';
import { useControlledState } from '@/hooks/use-controlled-state';
const [SwitchProvider, useSwitch] = getStrictContext('SwitchContext');
function Switch(props) {
    const [isPressed, setIsPressed] = React.useState(false);
    const [isChecked, setIsChecked] = useControlledState({
        value: props.checked,
        defaultValue: props.defaultChecked,
        onChange: props.onCheckedChange,
    });
    return (_jsx(SwitchProvider, { value: { isChecked, setIsChecked, isPressed, setIsPressed }, children: _jsx(SwitchPrimitives.Root, { ...props, onCheckedChange: setIsChecked, asChild: true, children: _jsx(motion.button, { "data-slot": "switch", whileTap: "tap", initial: false, onTapStart: () => setIsPressed(true), onTapCancel: () => setIsPressed(false), onTap: () => setIsPressed(false), ...props }) }) }));
}
function SwitchThumb({ pressedAnimation, transition = { type: 'spring', stiffness: 300, damping: 25 }, ...props }) {
    const { isPressed } = useSwitch();
    return (_jsx(SwitchPrimitives.Thumb, { asChild: true, children: _jsx(motion.div, { "data-slot": "switch-thumb", whileTap: "tab", layout: true, transition: transition, animate: isPressed ? pressedAnimation : undefined, ...props }) }));
}
function SwitchIcon({ position, transition = { type: 'spring', bounce: 0 }, ...props }) {
    const { isChecked } = useSwitch();
    const isAnimated = React.useMemo(() => {
        if (position === 'right')
            return !isChecked;
        if (position === 'left')
            return isChecked;
        if (position === 'thumb')
            return true;
        return false;
    }, [position, isChecked]);
    return (_jsx(motion.div, { "data-slot": `switch-${position}-icon`, animate: isAnimated ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }, transition: transition, ...props }));
}
export { Switch, SwitchThumb, SwitchIcon, useSwitch, };
