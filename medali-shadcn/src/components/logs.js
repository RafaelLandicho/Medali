"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { IconFolderCode } from "@tabler/icons-react";
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, useReactTable, } from "@tanstack/react-table";
import { db } from "@/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, } from "@/components/ui/empty";
export const columns = [
    { accessorKey: "logTime", header: "Time" },
    {
        accessorFn: (row) => row.prescriptionLog ? "Prescription" : row.medicalRecordLog ? "Medical Record" : "Other",
        id: "logType",
        header: "Log Type",
    },
    {
        accessorFn: (row) => row.prescriptionLog || row.medicalRecordLog || "",
        id: "description",
        header: "Description",
    },
];
export function ViewLogs() {
    const { user } = useAuth();
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState("description");
    React.useEffect(() => {
        if (!user)
            return;
        const logsRef = ref(db, "logs");
        const unsubscribe = onValue(logsRef, (snapshot) => {
            const val = snapshot.val() || {};
            const logs = Object.entries(val).map(([id, value]) => ({
                id,
                ...value,
            }));
            logs.sort((a, b) => new Date(b.logTime).getTime() - new Date(a.logTime).getTime());
            setData(logs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: { sorting, columnFilters, columnVisibility },
    });
    if (loading)
        return _jsx("div", { className: "p-10 text-center", children: "Loading logs..." });
    return (_jsxs("div", { className: "flex flex-col p-4 gap-4", children: [_jsx("h1", { className: "text-3xl font-bold text-center text-blue-600", children: "System Logs" }), _jsx("div", { className: "flex flex-row gap-4", children: _jsx(Input, { placeholder: `🔍 Search by ${filter.toUpperCase()}`, value: table.getColumn(filter)?.getFilterValue() ?? "", onChange: (e) => table.getColumn(filter)?.setFilterValue(e.target.value), className: "w-96 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500" }) }), _jsx("div", { className: "border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm", children: _jsx("div", { className: "overflow-auto", children: _jsxs(Table, { className: "min-w-full text-sm", children: [_jsx(TableHeader, { className: "sticky top-0 bg-blue-200 z-10", children: table.getHeaderGroups().map((headerGroup) => (_jsx(TableRow, { children: headerGroup.headers.map((header) => (_jsx(TableHead, { children: header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext()) }, header.id))) }, headerGroup.id))) }), _jsx(TableBody, { children: table.getRowModel().rows.length ? (table.getRowModel().rows.map((row) => (_jsx(TableRow, { children: row.getVisibleCells().map((cell) => (_jsx(TableCell, { children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))) }, row.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: columns.length, className: "h-24 text-center", children: _jsxs(Empty, { children: [_jsxs(EmptyHeader, { children: [_jsx(EmptyMedia, { variant: "icon", children: _jsx(IconFolderCode, {}) }), _jsx(EmptyTitle, { children: "No Logs Available" }), _jsx(EmptyDescription, { children: "No logs have been recorded yet." })] }), _jsx(EmptyContent, {})] }) }) })) })] }) }) }), _jsxs("div", { className: "flex items-center justify-between py-2 border-t bg-white", children: [_jsxs("div", { className: "text-muted-foreground text-sm", children: [table.getFilteredRowModel().rows.length, " row(s)"] }), _jsxs("div", { className: "space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", className: "!bg-blue-600 !text-white", onClick: () => table.previousPage(), disabled: !table.getCanPreviousPage(), children: "Previous" }), _jsx(Button, { variant: "outline", size: "sm", className: "!bg-blue-600 !text-white", onClick: () => table.nextPage(), disabled: !table.getCanNextPage(), children: "Next" })] })] })] }));
}
