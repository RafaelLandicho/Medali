import { LucideIcon } from "lucide-react";
type Submenu = {
    href: string;
    label: string;
    active?: boolean;
};
interface CollapseMenuButtonProps {
    icon: LucideIcon;
    label: string;
    active: boolean;
    submenus: Submenu[];
    isOpen: boolean | undefined;
}
export declare function CollapseMenuButton({ icon: Icon, label, active, submenus, isOpen }: CollapseMenuButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
