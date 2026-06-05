/**
 * This hook fix hydration when use persist to save hook data to localStorage
 */
export declare const useStore: <T, F>(store: (callback: (state: T) => unknown) => unknown, callback: (state: T) => F) => F;
