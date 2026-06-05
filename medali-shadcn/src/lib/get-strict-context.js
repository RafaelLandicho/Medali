import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
function getStrictContext(name) {
    const Context = React.createContext(undefined);
    const Provider = ({ value, children, }) => _jsx(Context.Provider, { value: value, children: children });
    const useSafeContext = () => {
        const ctx = React.useContext(Context);
        if (ctx === undefined) {
            throw new Error(`useContext must be used within ${name ?? 'a Provider'}`);
        }
        return ctx;
    };
    return [Provider, useSafeContext];
}
export { getStrictContext };
