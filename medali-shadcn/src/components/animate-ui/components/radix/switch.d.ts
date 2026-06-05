import * as React from 'react';
import { type SwitchProps as SwitchPrimitiveProps } from '@/components/animate-ui/primitives/radix/switch';
type SwitchProps = SwitchPrimitiveProps & {
    pressedWidth?: number;
    startIcon?: React.ReactElement;
    endIcon?: React.ReactElement;
    thumbIcon?: React.ReactElement;
};
declare function Switch({ className, pressedWidth, startIcon, endIcon, thumbIcon, ...props }: SwitchProps): import("react/jsx-runtime").JSX.Element;
export { Switch, type SwitchProps };
