"use client";

import * as React from "react";
import { IconFolderCode } from "@tabler/icons-react";
import { PillIcon } from "./ui/icons/lucide-pill";
import { PenIcon } from "./ui/icons/lucide-pen";
import { Trash2Icon } from "./ui/icons/lucide-trash-2";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
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
import {
  ChevronDown,
  Search,
  Filter,
  Download,
  Columns3,
  Pill,
  ClipboardList,
  Users,
  Stethoscope,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ref, onValue, remove, push, set } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import { PrescriptionDrawer } from "./edit-prescription-drawer";
import { FullPrescriptionDrawer } from "./view-full-prescription-drawer";

// ─── useIsMobile hook ─────────────────────────────────────────────────────────

function useIsMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type Prescription = {
  id: string;
  patientFirstName: string;
  patientLastName: string;
  patientGender?: string;
  patientAge?: number;
  patientAddress: string;
  doctorId: string;
  diagnosis: { diagnosis: string; severity: string; notes: string }[];
  drugs: {
    medicine: string;
    dosage: string;
    unit: string;
    purpose: string;
    frequency: string;
  }[];
  examination: number | string;
  recommendation: string;
  addedBy: string;
  field: string;
  createdBy: string;
  createdAt: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SeverityBadge = ({ severity }: { severity: string }) => {
  const s = severity?.toLowerCase() ?? "";
  const styles =
    s === "severe" || s === "critical"
      ? "bg-red-100 text-red-700 border-red-200"
      : s === "moderate"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : s === "mild" || s === "low"
          ? "bg-green-100 text-green-700 border-green-200"
          : "bg-gray-100 text-gray-500 border-gray-200";
  if (!severity) return null;
  return (
    <span
      className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded border uppercase tracking-wide ${styles}`}
    >
      {severity}
    </span>
  );
};

const PatientAvatar = ({
  firstName,
  lastName,
  gender,
  size = "sm",
}: {
  firstName: string;
  lastName: string;
  gender?: string;
  size?: "sm" | "md";
}) => {
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  const isMale = gender?.toLowerCase() === "male";
  const bg = isMale ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700";
  const dim = size === "md" ? "w-11 h-11 text-sm" : "w-8 h-8 text-xs";
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-bold shrink-0 ${bg}`}
      title={`${firstName} ${lastName}`}
    >
      {initials || "?"}
    </div>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const StatsBar = ({
  prescriptions,
  isMobile,
}: {
  prescriptions: Prescription[];
  isMobile: boolean;
}) => {
  const total = prescriptions.length;
  const uniquePatients = new Set(
    prescriptions.map((p) => `${p.patientFirstName} ${p.patientLastName}`),
  ).size;
  const totalDrugs = prescriptions.reduce(
    (acc, p) => acc + (p.drugs?.length ?? 0),
    0,
  );
  const withDiagnosis = prescriptions.filter(
    (p) => p.diagnosis?.length > 0,
  ).length;

  const stats = [
    {
      label: "Total Prescriptions",
      shortLabel: "Total",
      value: total,
      icon: <ClipboardList className="w-4 h-4" />,
      color: "text-[#00a896]",
      bg: "bg-[#00a896]/10",
    },
    {
      label: "Unique Patients",
      shortLabel: "Patients",
      value: uniquePatients,
      icon: <Users className="w-4 h-4" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Drugs Prescribed",
      shortLabel: "Drugs",
      value: totalDrugs,
      icon: <Pill className="w-4 h-4" />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "With Diagnosis",
      shortLabel: "Diagnosed",
      value: withDiagnosis,
      icon: <Stethoscope className="w-4 h-4" />,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 bg-white rounded-lg border border-gray-200 px-2 sm:px-4 py-2.5 sm:py-3 shadow-sm text-center sm:text-left"
        >
          <div className={`p-1.5 sm:p-2 rounded-md ${s.bg} ${s.color}`}>
            {s.icon}
          </div>
          <div>
            <p className="text-lg sm:text-xl font-bold text-gray-800 leading-none">
              {s.value}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
              {isMobile ? s.shortLabel : s.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Mobile Prescription Card ─────────────────────────────────────────────────

const MobilePrescriptionCard = ({
  prescription,
}: {
  prescription: Prescription;
}) => {
  const { user } = useAuth();
  const [openDetails, setOpenDetails] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);

  const userIsDoctor =
    user?.type?.toLowerCase() === "doctor" ||
    user?.type?.toLowerCase() === "admin";

  const handleDelete = async () => {
    try {
      const logsRef = ref(db, "logs/");
      const prescriptionRef = ref(db, `prescriptions/${prescription.id}`);
      const newLog = push(logsRef);
      await remove(prescriptionRef);
      await set(newLog, {
        prescriptionLog: `Prescription deleted by ${user?.firstName} ${user?.lastName}`,
        logTime: new Date().toLocaleString(),
      });
      toast.success("Prescription deleted successfully!");
      setOpenDelete(false);
    } catch {
      toast.error("Failed to delete prescription!");
    }
  };

  const primaryDiag = prescription.diagnosis?.[0];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      {/* Top row: avatar + name + actions */}
      <div className="flex items-start gap-3">
        <PatientAvatar
          firstName={prescription.patientFirstName}
          lastName={prescription.patientLastName}
          gender={prescription.patientGender}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm leading-tight">
            {prescription.patientFirstName} {prescription.patientLastName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {prescription.patientGender}
            {prescription.patientAge ? ` · ${prescription.patientAge} yrs` : ""}
          </p>
          {prescription.createdAt && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              {prescription.createdAt}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setOpenDetails(true)}
            title="View prescription"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <PillIcon className="w-4 h-4 text-[#00a896]" />
          </button>
          {userIsDoctor && (
            <button
              onClick={() => setOpenEdit(true)}
              title="Edit prescription"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              <PenIcon className="w-4 h-4 text-[#00a896]" />
            </button>
          )}
          <button
            onClick={() => setOpenDelete(true)}
            title="Delete prescription"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <Trash2Icon className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Detail rows */}
      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-xs">
        {/* Diagnosis */}
        {primaryDiag && (
          <div>
            <span className="text-gray-400">Diagnosis</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-gray-700 font-medium truncate">
                {primaryDiag.diagnosis}
              </p>
              <SeverityBadge severity={primaryDiag.severity} />
            </div>
            {prescription.diagnosis.length > 1 && (
              <p className="text-gray-400 text-[10px] mt-0.5">
                +{prescription.diagnosis.length - 1} more
              </p>
            )}
          </div>
        )}

        {/* Drugs */}
        {(prescription.drugs?.length ?? 0) > 0 && (
          <div>
            <span className="text-gray-400">Drugs</span>
            <div className="mt-0.5 space-y-0.5">
              {prescription.drugs.slice(0, 2).map((drug, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00a896] shrink-0" />
                  <span className="text-gray-700 font-medium truncate">
                    {drug.medicine}
                  </span>
                  <span className="text-gray-400 shrink-0">
                    {drug.dosage}
                    {drug.unit}
                  </span>
                </div>
              ))}
              {prescription.drugs.length > 2 && (
                <p className="text-gray-400 text-[10px]">
                  +{prescription.drugs.length - 2} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Recommendation + Added by */}
        <div className="grid grid-cols-2 gap-x-4">
          {prescription.recommendation && (
            <div>
              <span className="text-gray-400">Recommendation</span>
              <p className="text-gray-700 font-medium line-clamp-2 mt-0.5">
                {prescription.recommendation}
              </p>
            </div>
          )}
          <div>
            <span className="text-gray-400">Added by</span>
            <p className="text-gray-700 font-medium truncate mt-0.5">
              {prescription.addedBy || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Drawers / dialogs */}
      <FullPrescriptionDrawer
        open={openDetails}
        onOpenChange={setOpenDetails}
        prescription={prescription}
      />
      <PrescriptionDrawer
        open={openEdit}
        onOpenChange={setOpenEdit}
        prescription={prescription}
      />

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this prescription?</DialogTitle>
            <DialogDescription>
              This cannot be undone. It will permanently remove the prescription
              of{" "}
              <span className="font-semibold">
                {prescription.patientFirstName} {prescription.patientLastName}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleDelete}
              className="!bg-red-500 hover:!bg-red-600 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── CSV Export ───────────────────────────────────────────────────────────────

const exportToCSV = (prescriptions: Prescription[]) => {
  const headers = [
    "First Name",
    "Last Name",
    "Age",
    "Gender",
    "Address",
    "Diagnosis",
    "Drugs",
    "Recommendation",
    "Added By",
    "Created At",
  ];
  const rows = prescriptions.map((p) => [
    p.patientFirstName,
    p.patientLastName,
    p.patientAge ?? "",
    p.patientGender ?? "",
    p.patientAddress,
    (p.diagnosis ?? [])
      .map((d) => `${d.diagnosis}${d.severity ? ` (${d.severity})` : ""}`)
      .join("; "),
    (p.drugs ?? []).map((d) => `${d.medicine} ${d.dosage}${d.unit}`).join("; "),
    p.recommendation,
    p.addedBy,
    p.createdAt,
  ]);
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prescriptions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Prescriptions exported successfully!");
};

// ─── Column Definitions ───────────────────────────────────────────────────────

const ActionsCell = ({ prescription }: { prescription: Prescription }) => {
  const { user } = useAuth();
  const [openDetails, setOpenDetails] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const userIsDoctor =
    user?.type?.toLowerCase() === "doctor" ||
    user?.type?.toLowerCase() === "admin";

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setOpenDetails(true)}
        title="View prescription"
        className="inline-flex items-center justify-center w-7 h-7 rounded border border-gray-200 !bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        <PillIcon className="w-3.5 h-3.5 !text-[#00a896]" />
      </button>
      <FullPrescriptionDrawer
        open={openDetails}
        onOpenChange={setOpenDetails}
        prescription={prescription}
      />
      {userIsDoctor && (
        <button
          onClick={() => setOpenEdit(true)}
          title="Edit prescription"
          className="inline-flex items-center justify-center w-7 h-7 rounded border border-gray-200 !bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          <PenIcon className="w-3.5 h-3.5 !text-[#00a896]" />
        </button>
      )}
      <PrescriptionDrawer
        open={openEdit}
        onOpenChange={setOpenEdit}
        prescription={prescription}
      />
    </div>
  );
};

const DeleteCell = ({ prescription }: { prescription: Prescription }) => {
  const { user } = useAuth();
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  if (!user) return null;

  const handleDelete = async () => {
    try {
      const logsRef = ref(db, "logs/");
      const prescriptionRef = ref(db, `prescriptions/${prescription.id}`);
      const newLog = push(logsRef);
      await remove(prescriptionRef);
      await set(newLog, {
        prescriptionLog: `Prescription deleted by ${user?.firstName} ${user?.lastName}`,
        logTime: new Date().toLocaleString(),
      });
      toast.success("Prescription deleted successfully!");
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting prescription:", error);
      toast.error("Failed to delete prescription!");
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setOpenDeleteDialog(true)}
        title="Delete prescription"
        className="inline-flex items-center justify-center w-7 h-7 rounded border border-gray-200 !bg-white hover:bg-red-50 hover:border-red-200 transition-colors"
      >
        <Trash2Icon className="w-3.5 h-3.5 text-red-400" />
      </button>
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this prescription?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. It will permanently remove the
              prescription of{" "}
              <span className="font-semibold">
                {prescription.patientFirstName} {prescription.patientLastName}
              </span>{" "}
              from your database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleDelete}
              className="!bg-red-500 hover:!bg-red-600 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function Prescriptions() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [data, setData] = React.useState<Prescription[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("patient");
  const [searchValue, setSearchValue] = React.useState("");

  React.useEffect(() => {
    if (!user) return;
    const usersRef = ref(db, "users");
    const prescriptionsRef = ref(db, "prescriptions");

    const unsubscribeUsers = onValue(usersRef, (usersSnap) => {
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

      const unsubscribePrescriptions = onValue(prescriptionsRef, (snapshot) => {
        const raw = snapshot.val();
        const prescriptions: Prescription[] = raw
          ? Object.entries(raw)
              .map(([id, value]) => ({ id, ...(value as any) }))
              .filter((p) => {
                if (currentUser.type === "admin") return true;
                return "createdBy" in p && canSee.includes(p.createdBy);
              })
          : [];
        setData(prescriptions);
        setLoading(false);
      });

      return () => unsubscribePrescriptions();
    });

    return () => unsubscribeUsers();
  }, [user]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<string, boolean>
  >({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Updated columns with filter functions
  const columnsWithFilters: ColumnDef<Prescription>[] = [
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => <ActionsCell prescription={row.original} />,
    },
    {
      id: "patient",
      header: "Patient",
      enableHiding: false,
      filterFn: (row, id, filterValue) => {
        if (!filterValue) return true;
        const prescription = row.original;
        const fullName =
          `${prescription.patientFirstName} ${prescription.patientLastName}`.toLowerCase();
        const searchTerm = String(filterValue).toLowerCase();
        return fullName.includes(searchTerm);
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <PatientAvatar
            firstName={row.original.patientFirstName}
            lastName={row.original.patientLastName}
            gender={row.original.patientGender}
          />
          <div className="leading-tight">
            <p className="font-medium text-gray-800 text-sm">
              {row.original.patientFirstName} {row.original.patientLastName}
            </p>
            <p className="text-xs text-gray-400">
              {row.original.patientGender}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "patientAge",
      header: "Age",
      filterFn: "includesString",
    },
    {
      id: "diagnosis",
      header: "Diagnosis",
      filterFn: (row, id, filterValue) => {
        if (!filterValue) return true;
        const diagnoses = row.original.diagnosis || [];
        const searchTerm = String(filterValue).toLowerCase();
        return diagnoses.some(
          (d) =>
            d.diagnosis.toLowerCase().includes(searchTerm) ||
            d.severity?.toLowerCase().includes(searchTerm) ||
            d.notes?.toLowerCase().includes(searchTerm),
        );
      },
      cell: ({ row }) => {
        const diagnosisList = row.original.diagnosis;
        if (!diagnosisList?.length)
          return <span className="text-gray-300 text-xs">No diagnosis</span>;
        return (
          <div className="space-y-1.5 max-w-[260px]">
            {diagnosisList.map((diag, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-800">
                  {diag.diagnosis}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <SeverityBadge severity={diag.severity} />
                  {diag.notes && (
                    <span className="text-[11px] text-gray-400 italic">
                      {diag.notes}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "drugs",
      header: "Drugs",
      filterFn: (row, id, filterValue) => {
        if (!filterValue) return true;
        const drugs = row.original.drugs || [];
        const searchTerm = String(filterValue).toLowerCase();
        return drugs.some(
          (d) =>
            d.medicine.toLowerCase().includes(searchTerm) ||
            d.purpose?.toLowerCase().includes(searchTerm),
        );
      },
      cell: ({ row }) => {
        const drugs = row.original.drugs;
        if (!drugs?.length)
          return <span className="text-gray-300 text-xs">None</span>;
        return (
          <div className="space-y-1 max-w-[220px]">
            {drugs.map((drug, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#00a896] shrink-0" />
                <div className="text-xs leading-snug">
                  <span className="font-medium text-gray-800">
                    {drug.medicine}
                  </span>
                  <span className="text-gray-400">
                    {" "}
                    · {drug.dosage}
                    {drug.unit}
                  </span>
                  {drug.frequency && (
                    <span className="text-gray-400"> · {drug.frequency}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "recommendation",
      header: "Recommendation",
      filterFn: "includesString",
      cell: ({ row }) => (
        <p className="text-xs text-gray-600 max-w-[200px] line-clamp-2">
          {row.original.recommendation || (
            <span className="text-gray-300">—</span>
          )}
        </p>
      ),
    },
    {
      accessorKey: "addedBy",
      header: "Added By",
      filterFn: "includesString",
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      filterFn: "includesString",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {row.original.createdAt || "—"}
        </span>
      ),
    },
    {
      id: "delete",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => <DeleteCell prescription={row.original} />,
    },
  ];

  const table = useReactTable({
    data,
    columns: columnsWithFilters,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    initialState: { pagination: { pageSize: isMobile ? 8 : 10 } },
  });

  // Debounced search
  React.useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const column = table.getColumn(filter);
      if (column) {
        if (searchValue) {
          column.setFilterValue(searchValue);
        } else {
          column.setFilterValue(undefined);
        }
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchValue, filter, table]);

  const clearSearch = () => {
    setSearchValue("");
    const column = table.getColumn(filter);
    if (column) {
      column.setFilterValue(undefined);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center p-10 text-gray-500 text-sm gap-2">
        <Spinner className="w-5 h-5" />
        <span>Loading prescriptions…</span>
      </div>
    );

  const filterOptions = [
    { id: "patient", label: "Patient Name" },
    { id: "patientAge", label: "Age" },
    { id: "diagnosis", label: "Diagnosis" },
    { id: "drugs", label: "Drugs" },
    { id: "recommendation", label: "Recommendation" },
    { id: "addedBy", label: "Added By" },
    { id: "createdAt", label: "Date" },
  ];

  const filterLabel =
    filterOptions.find((f) => f.id === filter)?.label || "Patient Name";

  const hidableColumns = table
    .getAllColumns()
    .filter(
      (col) => col.getCanHide() && col.id !== "actions" && col.id !== "delete",
    );
  const filteredRows = table.getFilteredRowModel().rows;

  const Toolbar = (
    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
      {/* Search */}
      <div className="relative flex-1 sm:max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder={`Search by ${filterLabel}…`}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pl-8 pr-8 py-2 text-sm !bg-white border border-gray-200 rounded-lg shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a896]/40 focus:border-[#00a896] transition"
        />
        {searchValue && (
          <button
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2"
          >
            <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {/* Filter field */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium !bg-[#00a896] !text-white border border-gray-200 rounded-lg shadow-sm hover:opacity-90 transition flex-1 sm:flex-none justify-center">
              <Filter className="w-3.5 h-3.5" />
              {isMobile ? "Filter" : filterLabel}
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel className="text-xs text-gray-400">
              Search field
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {filterOptions.map((col) => (
              <DropdownMenuItem
                key={col.id}
                onSelect={(e) => {
                  e.preventDefault();
                  setFilter(col.id);
                  setSearchValue("");
                  const column = table.getColumn(col.id);
                  if (column) {
                    column.setFilterValue(undefined);
                  }
                }}
                className={`text-sm capitalize ${filter === col.id ? "bg-[#00a896]/10 text-[#00a896] font-medium" : ""}`}
              >
                {col.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Column visibility — desktop only */}
        {!isMobile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium !bg-[#00a896] !text-white border border-gray-200 rounded-lg shadow-sm hover:opacity-90 transition">
                <Columns3 className="w-3.5 h-3.5" />
                Columns
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs text-gray-400">
                Toggle columns
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {hidableColumns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize text-sm"
                  checked={col.getIsVisible()}
                  onCheckedChange={(val) => col.toggleVisibility(val)}
                >
                  {col.id === "patient"
                    ? "Patient Name"
                    : col.id === "patientAge"
                      ? "Age"
                      : col.id === "diagnosis"
                        ? "Diagnosis"
                        : col.id === "drugs"
                          ? "Drugs"
                          : col.id === "recommendation"
                            ? "Recommendation"
                            : col.id === "addedBy"
                              ? "Added By"
                              : col.id === "createdAt"
                                ? "Date"
                                : col.id
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (s) => s.toUpperCase())}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Export CSV */}
        <button
          onClick={() => exportToCSV(filteredRows.map((r) => r.original))}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium !bg-[#00a896] !text-white border border-gray-200 rounded-lg shadow-sm hover:opacity-90 transition flex-1 sm:flex-none justify-center"
        >
          <Download className="w-3.5 h-3.5" />
          {isMobile ? "CSV" : "Export CSV"}
        </button>
      </div>
    </div>
  );

  const Pagination = (
    <div className="flex items-center justify-between pt-1 text-xs text-gray-500">
      <span>
        {filteredRows.length === 0
          ? "No prescriptions"
          : `${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–${Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              filteredRows.length,
            )} of ${filteredRows.length} prescription${filteredRows.length !== 1 ? "s" : ""}`}
      </span>
      <div className="flex gap-1.5 items-center">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-3 py-1.5 text-xs font-medium rounded border border-gray-200 !bg-[#00a896] !text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          ← {isMobile ? "" : "Previous"}
        </button>
        <span className="px-2 text-xs text-gray-500">
          {table.getState().pagination.pageIndex + 1} /{" "}
          {table.getPageCount() || 1}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-3 py-1.5 text-xs font-medium rounded border border-gray-200 !bg-[#00a896] !text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {isMobile ? "" : "Next"} →
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
            Medical Prescriptions
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            View and manage patient prescriptions
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatsBar prescriptions={data} isMobile={isMobile} />

      {/* Toolbar */}
      {Toolbar}

      {/* ── Mobile: card list ── */}
      {isMobile ? (
        <>
          {filteredRows.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconFolderCode />
                  </EmptyMedia>
                  <EmptyTitle>No Prescriptions Yet</EmptyTitle>
                  <EmptyDescription>
                    No prescriptions have been created. Start by adding a
                    prescription from a patient record.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent />
              </Empty>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {table.getRowModel().rows.map((row) => (
                <MobilePrescriptionCard
                  key={row.id}
                  prescription={row.original}
                />
              ))}
            </div>
          )}
          {Pagination}
        </>
      ) : (
        /* ── Desktop: data table ── */
        <>
          <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className="overflow-x-auto">
              <Table className="min-w-[1000px] text-sm">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-0">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="bg-[#1a1a2e] text-gray-100 font-medium text-xs uppercase tracking-wider py-3 px-3 border-0 whitespace-nowrap"
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
                    table.getRowModel().rows.map((row, i) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={`border-b border-gray-100 transition-colors hover:bg-[#00a896]/5 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="py-2.5 px-3 text-gray-700 text-sm"
                          >
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
                        colSpan={columnsWithFilters.length}
                        className="h-40 text-center"
                      >
                        <Empty>
                          <EmptyHeader>
                            <EmptyMedia variant="icon">
                              <IconFolderCode />
                            </EmptyMedia>
                            <EmptyTitle>No Prescriptions Yet</EmptyTitle>
                            <EmptyDescription>
                              No prescriptions have been created. Start by
                              adding a prescription from a patient record.
                            </EmptyDescription>
                          </EmptyHeader>
                          <EmptyContent />
                        </Empty>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          {Pagination}
        </>
      )}
    </div>
  );
}
