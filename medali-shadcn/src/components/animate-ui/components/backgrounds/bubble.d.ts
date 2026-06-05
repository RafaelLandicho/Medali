import * as React from 'react';
import { type SpringOptions } from 'motion/react';
type BubbleColors = {
    first: string;
    second: string;
    third: string;
    fourth: string;
    fifth: string;
    sixth: string;
};
type BubbleBackgroundProps = React.ComponentProps<'div'> & {
    interactive?: boolean;
    transition?: SpringOptions;
    colors?: BubbleColors;
};
declare function BubbleBackground({ ref, className, children, interactive, transition, colors, ...props }: BubbleBackgroundProps): import("react/jsx-runtime").JSX.Element;
export { BubbleBackground, type BubbleBackgroundProps };
