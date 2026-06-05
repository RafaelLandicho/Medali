import { type CheckboxProps as CheckboxPrimitiveProps } from '@/components/animate-ui/primitives/radix/checkbox';
import { type VariantProps } from 'class-variance-authority';
declare const checkboxVariants: (props?: {
    variant?: "default" | "accent";
    size?: "default" | "sm" | "lg";
} & import("class-variance-authority/types").ClassProp) => string;
type CheckboxProps = CheckboxPrimitiveProps & VariantProps<typeof checkboxVariants>;
declare function Checkbox({ className, children, variant, size, ...props }: CheckboxProps): import("react/jsx-runtime").JSX.Element;
export { Checkbox, type CheckboxProps };
