"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { db } from "@/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// ---------------- Columns ----------------
export const columns = [
    {
        id: "select",
        header: ({ table }) => (_jsx(Checkbox, { checked: table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate"), className: "!bg-white !checked:bg-green-600 !checked:border-blue-600 ", onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value), "aria-label": "Select all" })),
        cell: ({ row }) => (_jsx(Checkbox, { checked: row.getIsSelected(), onCheckedChange: (value) => row.toggleSelected(!!value), className: "!bg-white !checked:bg-green-600 !checked:border-blue-600 ", "aria-label": "Select row" })),
        enableSorting: false,
        enableHiding: false,
    },
    { accessorKey: "firstName", header: "First Name" },
    { accessorKey: "lastName", header: "Last Name" },
    { accessorKey: "gender", header: "Gender" },
    { accessorKey: "age", header: "Age" },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "telephone", header: "Contact Number" },
    { accessorKey: "addedBy", header: "Added By" },
    { accessorKey: "bloodPressure", header: "Blood Pressure" },
    { accessorKey: "heartRate", header: "Heart Rate" },
    { accessorKey: "respiratoryRate", header: "Respiratory Rate" },
    { accessorKey: "temperature", header: "Temperature" },
    { accessorKey: "oxygenSaturation", header: "Oxygen Saturation" },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const patient = row.original;
            return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", className: "h-8 w-8 p-0 hidden sm:inline-flex", children: [_jsx("span", { className: "sr-only", children: "Open menu" }), _jsx(MoreHorizontal, {})] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuLabel, { children: "Actions" }), _jsx(DropdownMenuItem, { onClick: () => navigator.clipboard.writeText(patient.id), children: "Copy Patient ID" }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuItem, { children: "View patient details" })] })] }));
        },
    },
];
// ---------------- Component ----------------
export function DataTableDemo() {
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
        const auth = getAuth();
        signInWithEmailAndPassword(auth, "newtest@gmail.com", "password123")
            .then(() => {
            const patientsRef = ref(db, "patients");
            const unsubscribe = onValue(patientsRef, (snapshot) => {
                const dbData = snapshot.val();
                const patients = dbData
                    ? Object.entries(dbData).map(([id, value]) => ({ id, ...value }))
                    : [];
                setData(patients);
                setLoading(false);
            });
            return () => unsubscribe();
        })
            .catch((err) => {
            console.error("Auth error:", err);
            setLoading(false);
        });
    }, []);
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});
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
        onRowSelectionChange: setRowSelection,
        state: { sorting, columnFilters, columnVisibility, rowSelection },
    });
    if (loading)
        return _jsx("div", { className: "p-10 text-center", children: "Loading..." });
    return (_jsxs("div", { className: "w-screen h-[calc(100vh-120px)] flex flex-col p-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center py-2 gap-2", children: [_jsx(Input, { placeholder: "Filter by First Name.", value: table.getColumn("firstName")?.getFilterValue() ?? "", onChange: (e) => table.getColumn("firstName")?.setFilterValue(e.target.value), className: "max-w-sm w-full sm:w-auto" }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "ml-auto !bg-blue-600 !text-white", children: ["Columns ", _jsx(ChevronDown, {})] }) }), _jsx(DropdownMenuContent, { align: "end", children: table.getAllColumns().filter(col => col.getCanHide()).map(col => (_jsx(DropdownMenuCheckboxItem, { className: "capitalize", checked: col.getIsVisible(), onCheckedChange: (value) => col.toggleVisibility(!!value), children: col.id }, col.id))) })] })] }), _jsx("div", { className: "flex-1 overflow-auto rounded-md border", children: _jsxs(Table, { className: "min-w-full !bg-green-50", children: [_jsx(TableHeader, { children: table.getHeaderGroups().map(headerGroup => (_jsx(TableRow, { children: headerGroup.headers.map(header => (_jsx(TableHead, { children: header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext()) }, header.id))) }, headerGroup.id))) }), _jsx(TableBody, { children: table.getRowModel().rows.length ? (table.getRowModel().rows.map(row => (_jsx(TableRow, { "data-state": row.getIsSelected() && "selected", children: row.getVisibleCells().map(cell => (_jsx(TableCell, { children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))) }, row.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: columns.length, className: "h-24 text-center ", children: "No records found." }) })) })] }) }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 py-4", children: [_jsxs("div", { className: "text-muted-foreground text-sm", children: [table.getFilteredSelectedRowModel().rows.length, " of ", table.getFilteredRowModel().rows.length, " row(s) selected."] }), _jsxs("div", { className: "space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", className: "!bg-blue-600 !text-white", onClick: () => table.previousPage(), disabled: !table.getCanPreviousPage(), children: "Previous" }), _jsx(Button, { variant: "outline", size: "sm", className: "!bg-blue-600 !text-white", onClick: () => table.nextPage(), disabled: !table.getCanNextPage(), children: "Next" })] })] })] }));
}
