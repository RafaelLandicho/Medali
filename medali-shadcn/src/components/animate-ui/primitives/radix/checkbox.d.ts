import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { SVGMotionProps, type HTMLMotionProps } from 'motion/react';
type CheckboxContextType = {
    isChecked: boolean | 'indeterminate';
    setIsChecked: (checked: boolean | 'indeterminate') => void;
};
declare const useCheckbox: any;
type CheckboxProps = HTMLMotionProps<'button'> & Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, 'asChild'>;
declare function Checkbox({ defaultChecked, checked, onCheckedChange, disabled, required, name, value, ...props }: CheckboxProps): import("react/jsx-runtime").JSX.Element;
type CheckboxIndicatorProps = SVGMotionProps<SVGSVGElement>;
declare function CheckboxIndicator(props: CheckboxIndicatorProps): import("react/jsx-runtime").JSX.Element;
export { Checkbox, CheckboxIndicator, useCheckbox, type CheckboxProps, type CheckboxIndicatorProps, type CheckboxContextType, };
