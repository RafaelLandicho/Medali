import { LucideIcon } from "lucide-react";
type Submenu = {
    href: string;
    label: string;
    active?: boolean;
};
type Menu = {
    href: string;
    label: string;
    active?: boolean;
    icon: LucideIcon;
    submenus?: Submenu[];
};
type Group = {
    groupLabel: string;
    menus: Menu[];
};
export declare function getMenuList(pathname: string): Group[];
export {};
