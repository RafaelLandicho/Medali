"use client";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Spinner } from "@/components/ui/spinner";
import { CircleXIcon } from "./ui/icons/lucide-circle-x";
import { CheckIcon } from "./ui/icons/lucide-check";
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
const PatientActions = ({ patient }) => {
    const { user } = useAuth();
    const [openUser, setOpenUser] = React.useState(false);
    const [openEdit, setOpenEdit] = React.useState(false);
    const [openPrescription, setOpenPrescription] = React.useState(false);
    const userIsDoctor = user?.type?.toLowerCase() === "doctor" ||
        user?.type?.toLowerCase() === "admin";
};
const RejectRecord = ({ patient }) => {
    const { user } = useAuth();
    const [openRejectDialog, setOpenRejectDialog] = React.useState(false);
    if (!user)
        return _jsx(_Fragment, {});
    const handleReject = async () => {
        try {
            const pendingRef = ref(db, `pending/${patient.id}`);
            const logsRef = ref(db, "logs/");
            const newLog = push(logsRef);
            await remove(pendingRef);
            await set(newLog, {
                medicalRecordLog: `Record rejected by ${user.firstName} ${user.lastName}`,
                logTime: new Date().toLocaleString(),
            });
            toast.success("Patient record rejected!");
            setOpenRejectDialog(false);
        }
        catch (error) {
            console.error(error);
            toast.error("Failed to reject record");
        }
    };
    return (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: () => setOpenRejectDialog(true), className: "!bg-white rounded hover:bg-gray-200", children: _jsx(CircleXIcon, { className: "text-orange-600" }) }), _jsx(Dialog, { open: openRejectDialog, onOpenChange: setOpenRejectDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Would you like to reject this patient record?" }), _jsxs(DialogDescription, { children: ["THis action will reject and delete pending record of", " ", _jsxs("span", { className: "font-semibold", children: [patient.firstName, " ", patient.lastName] }), " ", "to your database."] })] }), _jsxs(DialogFooter, { className: "flex justify-end gap-2", children: [_jsx(Button, { onClick: handleReject, className: "!bg-green-400 hover:!bg-green-600 text-white", children: "Approve" }), _jsx(DialogClose, { asChild: true, children: _jsx(Button, { className: "!bg-gray-200", children: "Cancel" }) })] })] }) })] }));
};
const AcceptRecord = ({ patient }) => {
    const { user } = useAuth();
    const [openAcceptDialog, setOpenAcceptDialog] = React.useState(false);
    if (!user)
        return _jsx(_Fragment, {});
    const handleAccept = async () => {
        try {
            const patientRef = ref(db, `patients/${patient.id}`);
            const pendingRef = ref(db, `pending/${patient.id}`);
            const logsRef = ref(db, "logs/");
            const newLog = push(logsRef);
            await set(patientRef, {
                ...patient,
                status: "approved",
                approvedBy: `${user.firstName} ${user.lastName}`,
                approvedAt: new Date().toISOString(),
            });
            await remove(pendingRef);
            await set(newLog, {
                medicalRecordLog: `Record approved by ${user.firstName} ${user.lastName}`,
                logTime: new Date().toLocaleString(),
            });
            toast.success("Patient record approved!");
            setOpenAcceptDialog(false);
        }
        catch (error) {
            console.error(error);
            toast.error("Failed to approve record");
        }
    };
    return (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: () => setOpenAcceptDialog(true), className: "!bg-white rounded hover:bg-gray-200", children: _jsx(CheckIcon, { className: "text-orange-600" }) }), _jsx(Dialog, { open: openAcceptDialog, onOpenChange: setOpenAcceptDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Would you like to approve this patient record?" }), _jsxs(DialogDescription, { children: ["THis action will move the pending record of", " ", _jsxs("span", { className: "font-semibold", children: [patient.firstName, " ", patient.lastName] }), " ", "to your database."] })] }), _jsxs(DialogFooter, { className: "flex justify-end gap-2", children: [_jsx(Button, { onClick: handleAccept, className: "!bg-green-400 hover:!bg-green-600 text-white", children: "Approve" }), _jsx(DialogClose, { asChild: true, children: _jsx(Button, { className: "!bg-gray-200", children: "Cancel" }) })] })] }) })] }));
};
export const columns = [
    { accessorKey: "firstName", header: "First Name" },
    { accessorKey: "lastName", header: "Last Name" },
    { accessorKey: "gender", header: "Gender" },
    { accessorKey: "age", header: "Age" },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "telephone", header: "Contact Number" },
    { accessorKey: "status", header: "Status" },
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
        id: "accept",
        header: "",
        cell: ({ row }) => _jsx(AcceptRecord, { patient: row.original }),
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: "reject",
        header: "",
        cell: ({ row }) => _jsx(RejectRecord, { patient: row.original }),
        enableSorting: false,
        enableHiding: false,
    },
];
export function PendingRecords() {
    const { user } = useAuth();
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState("firstName");
    React.useEffect(() => {
        if (!user)
            return;
        const usersRef = ref(db, "users");
        const patientsRef = ref(db, "pending");
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
    return (_jsxs("div", { className: "flex flex-col p-4 gap-4", children: [_jsx("h1", { className: "text-4xl font-bold text-orange-400 text-center", children: "Pending Medical Records" }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center p-2", children: [_jsx(Input, { placeholder: `🔍 Search by ${filter.toUpperCase()}`, value: table.getColumn(filter)?.getFilterValue() ?? "", onChange: (e) => table.getColumn(filter)?.setFilterValue(e.target.value), className: "w-full sm:w-96 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500" }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "!bg-orange-500 !text-white", children: ["Filter ", _jsx(ChevronDown, { className: "ml-2 h-4 w-4" })] }) }), _jsx(DropdownMenuContent, { align: "end", children: table
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
