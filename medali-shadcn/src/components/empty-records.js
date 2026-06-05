import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconFolderCode } from "@tabler/icons-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, } from "@/components/ui/empty";
export function EmptyRecords({ children }) {
    return (_jsxs(Empty, { children: [_jsxs(EmptyHeader, { children: [_jsx(EmptyMedia, { variant: "icon", children: _jsx(IconFolderCode, {}) }), _jsx(EmptyTitle, { children: "No Records Yet" }), _jsx(EmptyDescription, { children: "You haven't created any records yet. Get started by creating your first record." }), children] }), _jsx(EmptyContent, {})] }));
}
