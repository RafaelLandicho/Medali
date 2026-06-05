import * as React from 'react';
import { Switch as SwitchPrimitives } from 'radix-ui';
import { type TargetAndTransition, type VariantLabels, type HTMLMotionProps, type LegacyAnimationControls } from 'motion/react';
type SwitchContextType = {
    isChecked: boolean;
    setIsChecked: (isChecked: boolean) => void;
    isPressed: boolean;
    setIsPressed: (isPressed: boolean) => void;
};
declare const useSwitch: any;
type SwitchProps = Omit<React.ComponentProps<typeof SwitchPrimitives.Root>, 'asChild'> & HTMLMotionProps<'button'>;
declare function Switch(props: SwitchProps): import("react/jsx-runtime").JSX.Element;
type SwitchThumbProps = Omit<React.ComponentProps<typeof SwitchPrimitives.Thumb>, 'asChild'> & HTMLMotionProps<'div'> & {
    pressedAnimation?: TargetAndTransition | VariantLabels | boolean | LegacyAnimationControls;
};
declare function SwitchThumb({ pressedAnimation, transition, ...props }: SwitchThumbProps): import("react/jsx-runtime").JSX.Element;
type SwitchIconPosition = 'left' | 'right' | 'thumb';
type SwitchIconProps = HTMLMotionProps<'div'> & {
    position: SwitchIconPosition;
};
declare function SwitchIcon({ position, transition, ...props }: SwitchIconProps): import("react/jsx-runtime").JSX.Element;
export { Switch, SwitchThumb, SwitchIcon, useSwitch, type SwitchProps, type SwitchThumbProps, type SwitchIconProps, type SwitchIconPosition, type SwitchContextType, };
