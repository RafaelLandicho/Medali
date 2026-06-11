"use client";

import * as React from "react";
import { UserIcon } from "./ui/icons/lucide-user";
import { PillIcon } from "./ui/icons/lucide-pill";
import { PenIcon } from "./ui/icons/lucide-pen";
import { Trash2Icon } from "./ui/icons/lucide-trash-2";
import { Spinner } from "@/components/ui/spinner";
import { CircleXIcon } from "./ui/icons/lucide-circle-x";
import { CheckIcon } from "./ui/icons/lucide-check";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Search, X } from "lucide-react";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

import { db } from "@/firebaseConfig";
import { ref, onValue, remove, set, push } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import { EmptyRecords } from "./empty-records";
import { AddRecordsDrawer } from "./add-records-drawer";
import { EditRecordsSheet } from "./edit-records-sheet";
import { PrescriptionDrawer } from "./add-prescription-drawer";
import { FullRecordsDrawer } from "./viewfull-records-drawer";

export type MedicalHistory = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  age: number;
  birthdate: string;
  patientDiagnosis: {
    diagnosis: string;
    severity: string;
    notes: string;
  }[];
  address: string;
  telephone: string;
  addedBy: string;
  bloodPressure?: string;
  heartRate?: string;
  respiratoryRate?: string;
  temperature?: string;
  oxygenSaturation?: string;
};

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  age: number;
  birthdate: string;
  patientDiagnosis: {
    diagnosis: string;
    severity: string;
    notes: string;
  }[];
  address: string;
  telephone: string;
  addedBy: string;
  bloodPressure?: string;
  heartRate?: string;
  respiratoryRate?: string;
  temperature?: string;
  oxygenSaturation?: string;
  status?: string;
  medicalHistory?: { [key: string]: MedicalHistory };
};

const PatientActions = ({ patient }: { patient: Patient }) => {
  const { user } = useAuth();
  const [openUser, setOpenUser] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openPrescription, setOpenPrescription] = React.useState(false);

  const userIsDoctor =
    user?.type?.toLowerCase() === "doctor" ||
    user?.type?.toLowerCase() === "admin";
};

const RejectRecord = ({ patient }: { patient: Patient }) => {
  const { user } = useAuth();
  const [openRejectDialog, setOpenRejectDialog] = React.useState(false);

  if (!user) return <></>;

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
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject record");
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpenRejectDialog(true)}
        className="bg-white rounded hover:bg-red-50 border-red-200"
      >
        <CircleXIcon className="text-red-600 h-4 w-4" />
      </Button>

      <Dialog open={openRejectDialog} onOpenChange={setOpenRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Patient Record</DialogTitle>
            <DialogDescription>
              This action will reject and delete the pending record of{" "}
              <span className="font-semibold">
                {patient.firstName} {patient.lastName}
              </span>{" "}
              from the system. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reject
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AcceptRecord = ({ patient }: { patient: Patient }) => {
  const { user } = useAuth();
  const [openAcceptDialog, setOpenAcceptDialog] = React.useState(false);

  if (!user) return <></>;

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
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve record");
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpenAcceptDialog(true)}
        className="bg-white rounded hover:bg-green-50 border-green-200"
      >
        <CheckIcon className="text-green-600 h-4 w-4" />
      </Button>

      <Dialog open={openAcceptDialog} onOpenChange={setOpenAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Patient Record</DialogTitle>
            <DialogDescription>
              This action will move the pending record of{" "}
              <span className="font-semibold">
                {patient.firstName} {patient.lastName}
              </span>{" "}
              to your active patients database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              onClick={handleAccept}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const columns: ColumnDef<Patient>[] = [
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
      if (!diagnosis?.length) return "No diagnosis";

      return (
        <div className="space-y-1 max-w-[300px]">
          {diagnosis.map((diag, i) => (
            <div key={i} className="text-sm border-b pb-1 last:border-b-0">
              <span className="font-medium">{diag.diagnosis}</span>
              {diag.severity && <span> - {diag.severity}</span>}
              {diag.notes && <span> ({diag.notes})</span>}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "accept",
    header: "Actions",
    cell: ({ row }) => <AcceptRecord patient={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "reject",
    header: "",
    cell: ({ row }) => <RejectRecord patient={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];

export function PendingRecords() {
  const { user } = useAuth();
  const [data, setData] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("firstName");
  const [searchValue, setSearchValue] = React.useState("");
  const [isMobile, setIsMobile] = React.useState(false);

  // Mobile detection
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    if (!user) return;

    const usersRef = ref(db, "users");
    const patientsRef = ref(db, "pending");

    const unsubscribe = onValue(usersRef, (usersSnap) => {
      const usersData = usersSnap.val() || {};
      const currentUser = usersData[user.uid];
      if (!currentUser) {
        setLoading(false);
        return;
      }

      let canSee: string[] = [user.uid];
      if (currentUser.type === "doctor") {
        canSee = [...canSee, ...(currentUser.secretaries || [])];
      } else if (currentUser.type === "secretary") {
        canSee = [...canSee, ...(currentUser.doctors || [])];
      }

      const unsubscribePatients = onValue(patientsRef, (snapshot) => {
        const data = snapshot.val();

        const patients: Patient[] = data
          ? Object.entries(data)
              .map(([id, value]: [string, any]) => {
                const diagnosisData =
                  value.diagnosis || value.patientDiagnosis || [];
                return {
                  id,
                  ...value,
                  patientDiagnosis: Array.isArray(diagnosisData)
                    ? diagnosisData
                    : [],
                };
              })
              .filter((patient) => {
                if (currentUser.type === "admin") return true;
                const createdBy = patient.createdBy;
                const sharedWith = patient.sharedWith || [];
                return createdBy === user.uid || sharedWith.includes(user.uid);
              })
          : [];

        setData(patients);
        setLoading(false);
      });

      return () => unsubscribePatients();
    });

    return () => unsubscribe();
  }, [user]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<string, boolean>
  >({});
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

  // Handle mobile column visibility
  React.useEffect(() => {
    if (isMobile) {
      table.getAllColumns().forEach((col) => {
        if (
          [
            "address",
            "telephone",
            "status",
            "addedBy",
            "patientDiagnosis",
          ].includes(col.id)
        ) {
          col.toggleVisibility(false);
        }
      });
      // Keep accept and reject columns visible
      table.getColumn("accept")?.toggleVisibility(true);
      table.getColumn("reject")?.toggleVisibility(true);
    } else {
      table.getAllColumns().forEach((col) => {
        if (col.id !== "accept" && col.id !== "reject") {
          col.toggleVisibility(true);
        }
      });
    }
  }, [isMobile, table]);

  // Handle search
  React.useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchValue) {
        table.getColumn(filter)?.setFilterValue(searchValue);
      } else {
        table.getColumn(filter)?.setFilterValue("");
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchValue, filter, table]);

  const clearSearch = () => {
    setSearchValue("");
    table.getColumn(filter)?.setFilterValue("");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center p-10">
        <Spinner className="w-8 h-8" />
        <span className="ml-2">Loading pending records...</span>
      </div>
    );

  return (
    <div className="flex flex-col p-4 gap-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-teal-600 mb-6">
          Pending Medical Records
          <p className="text-sm font-normal text-gray-500 mt-1">
            Review and manage patient records awaiting approval
          </p>
        </h1>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Search by ${filter.replace(/([A-Z])/g, " $1").toLowerCase()}...`}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-10 rounded-lg border-gray-200 focus:ring-2 focus:ring-teal-500"
            />
            {searchValue && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-200">
                  <span className="mr-2">🔍</span>
                  Filter by: {filter.replace(/([A-Z])/g, " $1")}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(
                    (col) =>
                      col.getCanFilter() &&
                      col.id !== "accept" &&
                      col.id !== "reject",
                  )
                  .map((col) => (
                    <DropdownMenuItem
                      key={col.id}
                      onSelect={() => {
                        setFilter(col.id);
                        setSearchValue("");
                        col.setFilterValue("");
                      }}
                      className={`capitalize ${
                        filter === col.id ? "bg-teal-50 text-teal-700" : ""
                      }`}
                    >
                      {col.id
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Records Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {table.getRowModel().rows.length} of {data.length} pending
          records
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-lg overflow-x-auto bg-white">
          <Table className="min-w-[800px] md:min-w-full">
            <TableHeader className="bg-teal-600">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-white font-semibold"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <EmptyRecords>
                      <AddRecordsDrawer />
                    </EmptyRecords>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
          <div className="text-sm text-gray-600 order-2 sm:order-1">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-gray-200 hover:bg-teal-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-gray-200 hover:bg-teal-50"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
