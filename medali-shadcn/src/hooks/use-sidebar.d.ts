type SidebarSettings = {
    disabled: boolean;
    isHoverOpen: boolean;
};
type SidebarStore = {
    isOpen: boolean;
    isHover: boolean;
    settings: SidebarSettings;
    toggleOpen: () => void;
    setIsOpen: (isOpen: boolean) => void;
    setIsHover: (isHover: boolean) => void;
    getOpenState: () => boolean;
    setSettings: (settings: Partial<SidebarSettings>) => void;
};
export declare const useSidebar: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<SidebarStore>, "persist" | "setState"> & {
    setState(partial: SidebarStore | Partial<SidebarStore> | ((state: SidebarStore) => SidebarStore | Partial<SidebarStore>), replace?: false): unknown;
    setState(state: SidebarStore | ((state: SidebarStore) => SidebarStore), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<SidebarStore, SidebarStore, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: SidebarStore) => void) => () => void;
        onFinishHydration: (fn: (state: SidebarStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<SidebarStore, SidebarStore, unknown>>;
    };
}>;
export {};
