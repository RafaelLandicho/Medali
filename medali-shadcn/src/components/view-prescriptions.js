"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { IconFolderCode } from "@tabler/icons-react";
import { PillIcon } from "./ui/icons/lucide-pill";
import { PenIcon } from "./ui/icons/lucide-pen";
import { Trash2Icon } from "./ui/icons/lucide-trash-2";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, } from "@/components/ui/empty";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter, } from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { toast } from "sonner";
import { db } from "@/firebaseConfig";
import { ref, onValue, remove, push, set } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import { PrescriptionDrawer } from "./edit-prescription-drawer";
import { FullPrescriptionDrawer } from "./view-full-prescription-drawer";
export const columns = [
    {
        id: "icon",
        header: "",
        cell: ({ row }) => {
            const { user } = useAuth();
            const [openDetails, setOpenDetails] = React.useState(false);
            const [openEdit, setOpenEdit] = React.useState(false);
            const prescription = row.original;
            const userIsDoctor = user?.type?.toLowerCase() === "doctor" ||
                user?.type?.toLowerCase() === "admin";
            return (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", size: "icon", onClick: () => setOpenDetails(true), className: "!bg-white rounded hover:bg-gray-200", children: _jsx(PillIcon, { className: "text-orange-600" }) }), _jsx(FullPrescriptionDrawer, { open: openDetails, onOpenChange: setOpenDetails, prescription: prescription }), userIsDoctor && (_jsx(Button, { variant: "outline", size: "icon", onClick: () => setOpenEdit(true), className: "!bg-white rounded hover:bg-gray-200", children: _jsx(PenIcon, { className: "text-orange-600" }) })), _jsx(PrescriptionDrawer, { open: openEdit, onOpenChange: setOpenEdit, prescription: prescription })] }));
        },
        enableSorting: false,
        enableHiding: false,
    },
    { accessorKey: "patientFirstName", header: "First Name" },
    { accessorKey: "patientLastName", header: "Last Name" },
    { accessorKey: "patientAge", header: "Age" },
    { accessorKey: "patientGender", header: "Gender" },
    {
        id: "diagnosis",
        header: "Diagnosis",
        cell: ({ row }) => {
            const diagnosisList = row.original.diagnosis;
            if (!diagnosisList?.length)
                return "No diagnosis";
            return (_jsx("div", { className: "space-y-1 max-w-[300px]", children: diagnosisList.map((diag, i) => (_jsxs("div", { className: "text-sm border-b pb-1 last:border-b-0", children: [_jsx("span", { className: "font-medium", children: diag.diagnosis }), diag.severity && _jsxs("span", { children: [" - ", diag.severity] }), diag.notes && _jsxs("span", { children: [" (", diag.notes, ")"] })] }, i))) }));
        },
    },
    {
        accessorKey: "drugs",
        header: "Drugs",
        cell: ({ row }) => {
            const drugs = row.original.drugs;
            if (!drugs?.length)
                return "No drugs";
            return (_jsx("div", { className: "space-y-1", children: drugs.map((drug, i) => (_jsxs("div", { children: [drug.medicine, " : ", drug.dosage, " : ", drug.unit] }, i))) }));
        },
    },
    {
        id: "delete",
        header: "",
        cell: ({ row }) => {
            const prescription = row.original;
            const { user } = useAuth();
            const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
            if (!user)
                return _jsx(_Fragment, {});
            const handleDelete = async () => {
                try {
                    const logsRef = ref(db, "logs/");
                    const patientRef = ref(db, `prescriptions/${prescription.id}`);
                    const newLog = push(logsRef);
                    await remove(patientRef);
                    await set(newLog, {
                        prescriptionLog: `Record deleted by ${user?.firstName} ${user?.lastName}`,
                        logTime: new Date().toLocaleString(),
                    });
                    toast.success("Prescription has been deleted successfully!");
                    setOpenDeleteDialog(false);
                }
                catch (error) {
                    console.error("Error deleting prescription:", error);
                    toast.success("Failed to delete prescription!");
                }
            };
            return (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: () => setOpenDeleteDialog(true), className: "!bg-white rounded hover:bg-gray-200", children: _jsx(Trash2Icon, { className: "text-orange-600" }) }), _jsx(Dialog, { open: openDeleteDialog, onOpenChange: setOpenDeleteDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Delete this prescription?" }), _jsxs(DialogDescription, { children: ["This action cannot be undone. It will permanently the prescription of", " ", _jsxs("span", { className: "font-semibold", children: [prescription.patientFirstName, " ", prescription.patientLastName] }), " ", "from your database."] })] }), _jsxs(DialogFooter, { className: "flex justify-end gap-2", children: [_jsx(DialogClose, { className: "!bg-gray-200", children: "Cancel" }), _jsx(Button, { onClick: handleDelete, className: "!bg-red-500 hover:!bg-red-600 text-white", children: "Delete" })] })] }) })] }));
        },
        enableSorting: false,
        enableHiding: false,
    },
];
export function Prescriptions() {
    const { user } = useAuth();
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState("patientFirstName");
    React.useEffect(() => {
        if (!user)
            return;
        const usersRef = ref(db, "users");
        const prescriptionsRef = ref(db, "prescriptions");
        const unsubscribeUsers = onValue(usersRef, (usersSnap) => {
            const usersData = usersSnap.val() || {};
            const currentUser = usersData[user.uid];
            if (!currentUser) {
                setLoading(false);
                return;
            }
            let canSee = [user.uid];
            if (currentUser.type === "doctor") {
                canSee = [...canSee, ...(currentUser.secretaries || [])];
            }
            else if (currentUser.type === "secretary") {
                canSee = [...canSee, ...(currentUser.doctors || [])];
            }
            const unsubscribePrescriptions = onValue(prescriptionsRef, (snapshot) => {
                const data = snapshot.val();
                const prescriptions = data
                    ? Object.entries(data)
                        .map(([id, value]) => ({ id, ...value }))
                        .filter((prescription) => {
                        if (currentUser.type === "admin")
                            return true;
                        return ("createdBy" in prescription &&
                            canSee.includes(prescription.createdBy));
                    })
                    : [];
                setData(prescriptions);
                setLoading(false);
            });
            return () => unsubscribePrescriptions();
        });
        return () => unsubscribeUsers();
    }, [user]);
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
    return (_jsxs("div", { className: "flex flex-col p-4 gap-2", children: [_jsx("div", { children: _jsx("span", { className: "!font-bold !text-orange-500 !text-4xl !flex justify-center", children: "Medical Prescriptions" }) }), _jsx("div", { className: "flex flex-row p-4 gap-2", children: _jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center gap-10", children: [_jsx(Input, { placeholder: `🔍 Search by ${filter.toUpperCase()}`, value: table.getColumn(filter)?.getFilterValue() ?? "", onChange: (e) => table.getColumn(filter)?.setFilterValue(e.target.value), className: "w-96 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500" }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "ml-auto !bg-orange-500 !text-white", children: ["Filter ", _jsx(ChevronDown, { className: "ml-2 h-4 w-4" })] }) }), _jsx(DropdownMenuContent, { align: "end", children: table
                                        .getAllColumns()
                                        .filter((col) => col.getCanFilter())
                                        .map((col) => (_jsx(DropdownMenuItem, { onSelect: (e) => {
                                            e.preventDefault();
                                            setFilter(col.id);
                                            col.setFilterValue("");
                                        }, className: `capitalize ${filter === col.id ? "!bg-blue-100 !text-blue-700" : ""}`, children: col.id
                                            .replace(/([A-Z])/g, " $1")
                                            .replace(/^./, (str) => str.toUpperCase()) }, col.id))) })] })] }) }), _jsx("div", { className: "border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm", children: _jsx("div", { className: "overflow-auto", children: _jsxs(Table, { className: "min-w-full text-sm", children: [_jsx(TableHeader, { className: "sticky top-0 bg-[#00a896] z-10", children: table.getHeaderGroups().map((headerGroup) => (_jsx(TableRow, { children: headerGroup.headers.map((header) => (_jsx(TableHead, { className: "text-white", children: header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext()) }, header.id))) }, headerGroup.id))) }), _jsx(TableBody, { children: table.getRowModel().rows.length ? (table.getRowModel().rows.map((row) => (_jsx(TableRow, { className: "!bg-white !text-black", "data-state": row.getIsSelected() && "selected", children: row.getVisibleCells().map((cell) => (_jsx(TableCell, { children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))) }, row.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: columns.length, className: "h-24 text-center", children: _jsxs(Empty, { children: [_jsxs(EmptyHeader, { children: [_jsx(EmptyMedia, { variant: "icon", children: _jsx(IconFolderCode, {}) }), _jsx(EmptyTitle, { children: "No Prescriptions Created Yet" }), _jsx(EmptyDescription, { children: "You haven't created any records yet. Get started by creating your first prescription." })] }), _jsx(EmptyContent, {})] }) }) })) })] }) }) }), _jsxs("div", { className: "flex items-center justify-between py-2 border-t bg-white", children: [_jsxs("div", { className: "text-muted-foreground text-sm", children: [table.getFilteredSelectedRowModel().rows.length, " of", " ", table.getFilteredRowModel().rows.length, " row(s) selected."] }), _jsxs("div", { className: "space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", className: "!bg-orange-500 !text-white", onClick: () => table.previousPage(), disabled: !table.getCanPreviousPage(), children: "Previous" }), _jsx(Button, { variant: "outline", size: "sm", className: "!bg-orange-500 !text-white", onClick: () => table.nextPage(), disabled: !table.getCanNextPage(), children: "Next" })] })] })] }));
}
