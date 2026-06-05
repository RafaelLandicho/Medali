"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from "react";
import { UserIcon } from "./ui/icons/lucide-user";
import { PillIcon } from "./ui/icons/lucide-pill";
import { PenIcon } from "./ui/icons/lucide-pen";
import { Trash2Icon } from "./ui/icons/lucide-trash-2";
import { Spinner } from "@/components/ui/spinner";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { toast } from "sonner";
import { db } from "@/firebaseConfig";
import { ref, onValue, remove, set, push } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import { EmptyRecords } from "./empty-records";
import { AddRecordsDrawer } from "./add-records-drawer";
import { EditRecordsSheet } from "./edit-records-sheet";
import { PrescriptionDrawer } from "./add-prescription-drawer";
import { FullRecordsDrawer } from "./viewfull-records-drawer";
const PatientActions = ({ patient }) => {
    const { user } = useAuth();
    const [openUser, setOpenUser] = React.useState(false);
    const [openEdit, setOpenEdit] = React.useState(false);
    const [openPrescription, setOpenPrescription] = React.useState(false);
    const userIsDoctor = user?.type?.toLowerCase() === "doctor" ||
        user?.type?.toLowerCase() === "admin";
    return (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: () => setOpenUser(true), className: "!bg-white rounded hover:bg-gray-200", children: _jsx(UserIcon, { className: "text-orange-600" }) }), _jsx(FullRecordsDrawer, { open: openUser, onOpenChange: setOpenUser, patient: patient }), _jsx(Button, { variant: "outline", size: "icon", onClick: () => setOpenEdit(true), className: "!bg-white rounded hover:bg-gray-200", children: _jsx(PenIcon, { className: "text-orange-600" }) }), _jsx(EditRecordsSheet, { open: openEdit, onOpenChange: setOpenEdit, patient: patient }), userIsDoctor && (_jsx(Button, { variant: "outline", size: "icon", onClick: () => setOpenPrescription(true), className: "!bg-white rounded hover:bg-gray-200", children: _jsx(PillIcon, { className: "text-orange-600" }) })), _jsx(PrescriptionDrawer, { open: openPrescription, onOpenChange: setOpenPrescription, patient: patient })] }));
};
const DeletePatient = ({ patient }) => {
    const { user } = useAuth();
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    if (!user)
        return _jsx(_Fragment, {});
    const handleDelete = async () => {
        try {
            const logsRef = ref(db, "logs/");
            const patientRef = ref(db, `patients/${patient.id}`);
            const newLog = push(logsRef);
            await remove(patientRef);
            await set(newLog, {
                medicalRecordLog: `Record deleted by ${user?.firstName} ${user?.lastName}`,
                logTime: new Date().toLocaleString(),
            });
            toast.success("Record has been deleted successfully!");
            setOpenDeleteDialog(false);
        }
        catch (error) {
            console.error("Error deleting patient:", error);
            toast.error("Failed to delete record!");
        }
    };
    return (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: () => setOpenDeleteDialog(true), className: "!bg-white rounded hover:bg-gray-200", children: _jsx(Trash2Icon, { className: "text-orange-600" }) }), _jsx(Dialog, { open: openDeleteDialog, onOpenChange: setOpenDeleteDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Delete this patient record?" }), _jsxs(DialogDescription, { children: ["This action cannot be undone. It will permanently remove the record of", " ", _jsxs("span", { className: "font-semibold", children: [patient.firstName, " ", patient.lastName] }), " ", "from your database."] })] }), _jsxs(DialogFooter, { className: "flex justify-end gap-2", children: [_jsx(DialogClose, { asChild: true, children: _jsx(Button, { className: "!bg-gray-200", children: "Cancel" }) }), _jsx(Button, { onClick: handleDelete, className: "!bg-red-500 hover:!bg-red-600 text-white", children: "Delete" })] })] }) })] }));
};
export const columns = [
    {
        id: "actions",
        header: "",
        cell: ({ row }) => _jsx(PatientActions, { patient: row.original }),
        enableSorting: false,
        enableHiding: false,
    },
    { accessorKey: "firstName", header: "First Name" },
    { accessorKey: "lastName", header: "Last Name" },
    { accessorKey: "gender", header: "Gender" },
    { accessorKey: "age", header: "Age" },
    { accessorKey: "birthdate", header: "Birth Date" },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "telephone", header: "Contact Number" },
    { accessorKey: "addedBy", header: "Added By" },
    {
        accessorKey: "patientDiagnosis",
        header: "Diagnosis",
        cell: ({ row }) => {
            const diagnosis = row.original.patientDiagnosis;
            console.log("PATIENT DIAGNOSIS:", diagnosis);
            if (!diagnosis?.length)
                return "No diagnosis";
            return (_jsx("div", { className: "space-y-1 max-w-[300px]", children: diagnosis.map((diag, i) => (_jsxs("div", { className: "text-sm border-b pb-1 last:border-b-0", children: [_jsx("span", { className: "font-medium", children: diag.diagnosis }), diag.severity && _jsxs("span", { children: [" - ", diag.severity] }), diag.notes && _jsxs("span", { children: [" (", diag.notes, ")"] })] }, i))) }));
        },
    },
    {
        id: "delete",
        header: "",
        cell: ({ row }) => _jsx(DeletePatient, { patient: row.original }),
        enableSorting: false,
        enableHiding: false,
    },
];
export function MedicalRecords() {
    const { user } = useAuth();
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState("firstName");
    React.useEffect(() => {
        if (!user)
            return;
        const usersRef = ref(db, "users");
        const patientsRef = ref(db, "patients");
        const unsubscribe = onValue(usersRef, (usersSnap) => {
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
            const unsubscribePatients = onValue(patientsRef, (snapshot) => {
                const data = snapshot.val();
                console.log("RAW PATIENT DATA:", data); // Debug log
                const patients = data
                    ? Object.entries(data)
                        .map(([id, value]) => {
                        const diagnosisData = value.diagnosis || value.patientDiagnosis || [];
                        return {
                            id,
                            ...value,
                            patientDiagnosis: Array.isArray(diagnosisData)
                                ? diagnosisData
                                : [],
                        };
                    })
                        .filter((patient) => {
                        if (currentUser.type === "admin")
                            return true;
                        const createdBy = patient.createdBy;
                        const sharedWith = patient.sharedWith || [];
                        return createdBy === user.uid || sharedWith.includes(user.uid);
                    })
                    : [];
                console.log("PROCESSED PATIENTS:", patients); // Debug log
                setData(patients);
                setLoading(false);
            });
            return () => unsubscribePatients();
        });
        return () => unsubscribe();
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
    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                table.getAllColumns().forEach((col) => {
                    if ([
                        "bloodPressure",
                        "heartRate",
                        "respiratoryRate",
                        "temperature",
                        "oxygenSaturation",
                    ].includes(col.id)) {
                        col.toggleVisibility(false);
                    }
                });
            }
            else {
                table.getAllColumns().forEach((col) => col.toggleVisibility(true));
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [table]);
    if (loading)
        return (_jsxs("div", { className: "flex justify-center items-center p-10", children: [_jsx(Spinner, { className: "w-8 h-8" }), _jsx("span", { className: "ml-2", children: "Loading medical records..." })] }));
    return (_jsxs("div", { className: "flex flex-col p-4 gap-4", children: [_jsx("h1", { className: "text-4xl font-bold text-orange-400 text-center", children: "Medical Records" }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center p-2", children: [_jsx(Input, { placeholder: `🔍 Search by ${filter.toUpperCase()}`, value: table.getColumn(filter)?.getFilterValue() ?? "", onChange: (e) => table.getColumn(filter)?.setFilterValue(e.target.value), className: "w-full sm:w-96 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500" }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "!bg-orange-500 !text-white", children: ["Filter ", _jsx(ChevronDown, { className: "ml-2 h-4 w-4" })] }) }), _jsx(DropdownMenuContent, { align: "end", children: table
                                    .getAllColumns()
                                    .filter((col) => col.getCanFilter())
                                    .map((col) => (_jsx(DropdownMenuItem, { onSelect: (e) => {
                                        e.preventDefault();
                                        setFilter(col.id);
                                        col.setFilterValue("");
                                    }, className: `capitalize ${filter === col.id ? "!bg-blue-100 !text-blue-700" : ""}`, children: col.id
                                        .replace(/([A-Z])/g, " $1")
                                        .replace(/^./, (str) => str.toUpperCase()) }, col.id))) })] })] }), _jsx("div", { className: "border border-gray-200 rounded-lg overflow-x-auto bg-white shadow-sm", children: _jsxs(Table, { className: "min-w-[1000px] text-sm", children: [_jsx(TableHeader, { className: "sticky top-0 bg-[#00a896] z-10", children: table.getHeaderGroups().map((headerGroup) => (_jsx(TableRow, { children: headerGroup.headers.map((header) => (_jsx(TableHead, { className: "text-white", children: header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext()) }, header.id))) }, headerGroup.id))) }), _jsx(TableBody, { children: table.getRowModel().rows.length ? (table.getRowModel().rows.map((row) => (_jsx(TableRow, { className: "!bg-white !text-black", "data-state": row.getIsSelected() && "selected", children: row.getVisibleCells().map((cell) => (_jsx(TableCell, { children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))) }, row.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: columns.length, className: "h-24 text-center", children: _jsx(EmptyRecords, { children: _jsx(AddRecordsDrawer, {}) }) }) })) })] }) }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between py-2 border-t bg-white gap-2 sm:gap-0", children: [_jsxs("div", { className: "text-muted-foreground text-sm", children: [table.getFilteredSelectedRowModel().rows.length, " of", " ", table.getFilteredRowModel().rows.length, " row(s) selected."] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", className: "!bg-orange-500 !text-white", onClick: () => table.previousPage(), disabled: !table.getCanPreviousPage(), children: "Previous" }), _jsx(Button, { variant: "outline", size: "sm", className: "!bg-orange-500 !text-white", onClick: () => table.nextPage(), disabled: !table.getCanNextPage(), children: "Next" })] })] })] }));
}
