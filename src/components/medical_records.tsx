"use client";

import * as React from "react";
import { UserIcon } from "./ui/icons/lucide-user";
import { PillIcon } from "./ui/icons/lucide-pill";
import { PenIcon } from "./ui/icons/lucide-pen";
import { Trash2Icon } from "./ui/icons/lucide-trash-2";
import { Spinner } from "@/components/ui/spinner";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  Search,
  Plus,
  Filter,
  Download,
  Columns3,
  Users,
  AlertTriangle,
  Biohazard,
  UtensilsCrossed,
  Heart,
  Wind,
  Thermometer,
  Droplets,
  Ruler,
  Weight,
  Activity,
  User,
  MapPin,
  Phone,
  ClipboardList,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";

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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { ref, onValue, remove, set, push } from "firebase/database";

import { useAuth } from "@/auth/authprovider";
import { useNavigate } from "react-router-dom";
import { EmptyRecords } from "./empty-records";
import { AddRecordsDrawer } from "./add-records-drawer";
import { EditRecordsSheet } from "./edit-records-sheet";
import { PrescriptionDrawer } from "./add-prescription-drawer";
import { FullRecordsDrawer } from "./viewfull-records-drawer";

// ─── useIsMobile hook ─────────────────────────────────────────────────────────

/**
 * Returns true when the viewport is narrower than `breakpoint` px (default 640).
 * Hydration-safe: starts as false on the server, updates after first paint.
 */
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

export type MedicalHistory = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  age: number;
  birthdate: string;
  patientDiagnosis: { diagnosis: string; severity: string; notes: string }[];
  address: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  telephone: string;
  addedBy: string;
  familyHistory: {
    relation: string;
    age: string;
    healthProblems: string;
    goodHealth: boolean;
    isAlive: boolean;
  }[];
  symptoms?: string;
  bloodPressure?: string;
  heartRate?: string;
  respiratoryRate?: string;
  temperature?: string;
  oxygenSaturation?: string;
  weight?: string;
  height?: string;
  medicalCare: boolean;
  drugAllergy: boolean;
  foodAllergy: boolean;
  isTBPositive: boolean;
  hasClinician: boolean;
  diet: boolean;
};

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  age: number;
  birthdate: string;
  patientDiagnosis: { diagnosis: string; severity: string; notes: string }[];
  address: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  telephone: string;
  addedBy: string;
  symptoms?: string;
  bloodPressure?: string;
  heartRate?: string;
  respiratoryRate?: string;
  temperature?: string;
  oxygenSaturation?: string;
  weight?: string;
  height?: string;
  familyHistory: {
    relation: string;
    age: string;
    healthProblems: string;
    goodHealth: boolean;
    isAlive: boolean;
  }[];
  medicalCare: boolean;
  drugAllergy: boolean;
  foodAllergy: boolean;
  isTBPositive: boolean;
  hasClinician: boolean;
  diet: boolean;
  medicalHistory?: { [key: string]: MedicalHistory };
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
  gender: string;
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

const RiskIndicators = ({ patient }: { patient: Patient }) => (
  <div className="flex items-center gap-1 flex-wrap">
    {patient.isTBPositive && (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200">
        <Biohazard className="w-2.5 h-2.5" />
        TB+
      </span>
    )}
    {patient.drugAllergy && (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-700 border border-orange-200">
        <AlertTriangle className="w-2.5 h-2.5" />
        Drug
      </span>
    )}
    {patient.foodAllergy && (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
        <UtensilsCrossed className="w-2.5 h-2.5" />
        Food
      </span>
    )}
    {!patient.isTBPositive && !patient.drugAllergy && !patient.foodAllergy && (
      <span className="text-gray-300 text-xs">—</span>
    )}
  </div>
);

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const StatsBar = ({
  patients,
  isMobile,
}: {
  patients: Patient[];
  isMobile: boolean;
}) => {
  const total = patients.length;
  const tbPositive = patients.filter((p) => p.isTBPositive).length;
  const drugAllergy = patients.filter((p) => p.drugAllergy).length;
  const foodAllergy = patients.filter((p) => p.foodAllergy).length;

  const stats = [
    {
      label: "Total",
      value: total,
      icon: <Users className="w-4 h-4" />,
      color: "text-[#00a896]",
      bg: "bg-[#00a896]/10",
    },
    {
      label: "TB+",
      value: tbPositive,
      icon: <Biohazard className="w-4 h-4" />,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Drug",
      value: drugAllergy,
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Food",
      value: foodAllergy,
      icon: <UtensilsCrossed className="w-4 h-4" />,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
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
              {isMobile
                ? s.label
                : s.label === "Total"
                  ? "Total Patients"
                  : s.label === "TB+"
                    ? "TB Positive"
                    : s.label === "Drug"
                      ? "Drug Allergy"
                      : "Food Allergy"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Mobile Patient Card ──────────────────────────────────────────────────────

const MobilePatientCard = ({ patient }: { patient: Patient }) => {
  const { user } = useAuth();
  const [openUser, setOpenUser] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openPrescription, setOpenPrescription] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);

  const userIsDoctor =
    user?.type?.toLowerCase() === "doctor" ||
    user?.type?.toLowerCase() === "admin";

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
      toast.success("Record deleted successfully!");
      setOpenDelete(false);
    } catch {
      toast.error("Failed to delete record!");
    }
  };

  const primaryDiag = patient.patientDiagnosis?.[0];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      {/* Top row: avatar + name + actions */}
      <div className="flex items-start gap-3">
        <PatientAvatar
          firstName={patient.firstName}
          lastName={patient.lastName}
          gender={patient.gender}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm leading-tight">
            {patient.firstName} {patient.lastName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {patient.gender} · {patient.age} yrs · {patient.birthdate}
          </p>
          {/* Risk flags */}
          <div className="mt-1.5">
            <RiskIndicators patient={patient} />
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setOpenUser(true)}
            title="View patient"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <UserIcon className="w-4 h-4 text-[#00a896]" />
          </button>
          <button
            onClick={() => setOpenEdit(true)}
            title="Edit patient"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <PenIcon className="w-4 h-4 text-[#00a896]" />
          </button>
          {userIsDoctor && (
            <button
              onClick={() => setOpenPrescription(true)}
              title="Prescriptions"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              <PillIcon className="w-4 h-4 text-[#00a896]" />
            </button>
          )}
          <button
            onClick={() => setOpenDelete(true)}
            title="Delete patient"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <Trash2Icon className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Detail rows */}
      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <div>
          <span className="text-gray-400">Contact</span>
          <p className="text-gray-700 font-medium truncate">
            {patient.telephone || "—"}
          </p>
        </div>
        <div>
          <span className="text-gray-400">Added by</span>
          <p className="text-gray-700 font-medium truncate">
            {patient.addedBy || "—"}
          </p>
        </div>
        <div className="col-span-2">
          <span className="text-gray-400">Address</span>
          <p className="text-gray-700 font-medium truncate">
            {patient.address || "—"}
          </p>
        </div>
        {primaryDiag && (
          <div className="col-span-2">
            <span className="text-gray-400">Diagnosis</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-gray-700 font-medium truncate">
                {primaryDiag.diagnosis}
              </p>
              <SeverityBadge severity={primaryDiag.severity} />
            </div>
            {patient.patientDiagnosis.length > 1 && (
              <p className="text-gray-400 text-[10px] mt-0.5">
                +{patient.patientDiagnosis.length - 1} more
              </p>
            )}
          </div>
        )}
      </div>

      {/* Drawers / dialogs */}
      <FullRecordsDrawer
        open={openUser}
        onOpenChange={setOpenUser}
        patient={patient}
      />
      <EditRecordsSheet
        open={openEdit}
        onOpenChange={setOpenEdit}
        patient={patient}
      />
      <PrescriptionDrawer
        open={openPrescription}
        onOpenChange={setOpenPrescription}
        patient={patient}
      />

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this patient record?</DialogTitle>
            <DialogDescription>
              This cannot be undone. It will permanently remove the record of{" "}
              <span className="font-semibold">
                {patient.firstName} {patient.lastName}
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

const exportToCSV = (patients: Patient[]) => {
  const headers = [
    "First Name",
    "Last Name",
    "Gender",
    "Age",
    "Birth Date",
    "Address",
    "Contact Number",
    "Added By",
    "Diagnosis",
    "TB Positive",
    "Drug Allergy",
    "Food Allergy",
  ];
  const rows = patients.map((p) => [
    p.firstName,
    p.lastName,
    p.gender,
    p.age,
    p.birthdate,
    p.address,
    p.telephone,
    p.addedBy,
    (p.patientDiagnosis ?? [])
      .map((d) => `${d.diagnosis}${d.severity ? ` (${d.severity})` : ""}`)
      .join("; "),
    p.isTBPositive ? "Yes" : "No",
    p.drugAllergy ? "Yes" : "No",
    p.foodAllergy ? "Yes" : "No",
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
  a.download = `medical-records-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Records exported successfully!");
};

// ─── Desktop Action Buttons ───────────────────────────────────────────────────

const PatientActions = ({ patient }: { patient: Patient }) => {
  const { user } = useAuth();
  const [openUser, setOpenUser] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openPrescription, setOpenPrescription] = React.useState(false);
  const userIsDoctor =
    user?.type?.toLowerCase() === "doctor" ||
    user?.type?.toLowerCase() === "admin";

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setOpenUser(true)}
        title="View patient"
        className="inline-flex items-center justify-center w-7 h-7 rounded border border-gray-200 !bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        <UserIcon className="w-3.5 h-3.5 text-[#00a896]" />
      </button>
      <FullRecordsDrawer
        open={openUser}
        onOpenChange={setOpenUser}
        patient={patient}
      />

      <button
        onClick={() => setOpenEdit(true)}
        title="Edit patient"
        className="inline-flex items-center justify-center w-7 h-7 rounded border border-gray-200 !bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        <PenIcon className="w-3.5 h-3.5 text-[#00a896]" />
      </button>
      <EditRecordsSheet
        open={openEdit}
        onOpenChange={setOpenEdit}
        patient={patient}
      />

      {userIsDoctor && (
        <button
          onClick={() => setOpenPrescription(true)}
          title="Prescriptions"
          className="inline-flex items-center justify-center w-7 h-7 rounded border border-gray-200 !bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          <PillIcon className="w-3.5 h-3.5 text-[#00a896]" />
        </button>
      )}
      <PrescriptionDrawer
        open={openPrescription}
        onOpenChange={setOpenPrescription}
        patient={patient}
      />
    </div>
  );
};

const DeletePatient = ({ patient }: { patient: Patient }) => {
  const { user } = useAuth();
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  if (!user) return <></>;

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
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error("Failed to delete record!");
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setOpenDeleteDialog(true)}
        title="Delete patient"
        className="inline-flex items-center justify-center w-7 h-7 rounded border border-gray-200 !bg-white hover:bg-red-50 hover:border-red-200 transition-colors"
      >
        <Trash2Icon className="w-3.5 h-3.5 text-red-400" />
      </button>
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this patient record?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. It will permanently remove the
              record of{" "}
              <span className="font-semibold">
                {patient.firstName} {patient.lastName}
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

// ─── Column Definitions ───────────────────────────────────────────────────────

export const columns: ColumnDef<Patient>[] = [
  {
    id: "actions",
    header: "",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => <PatientActions patient={row.original} />,
  },
  {
    id: "patient",
    header: "Patient",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <PatientAvatar
          firstName={row.original.firstName}
          lastName={row.original.lastName}
          gender={row.original.gender}
        />
        <div className="leading-tight">
          <p className="font-medium text-gray-800 text-sm">
            {row.original.firstName} {row.original.lastName}
          </p>
          <p className="text-xs text-gray-400">{row.original.gender}</p>
        </div>
      </div>
    ),
  },
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
      if (!diagnosis?.length)
        return <span className="text-gray-300 text-xs">No diagnosis</span>;
      return (
        <div className="space-y-1.5 max-w-[280px]">
          {diagnosis.map((diag, i) => (
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
    id: "risks",
    header: "Risk Flags",
    enableSorting: false,
    cell: ({ row }) => <RiskIndicators patient={row.original} />,
  },
  {
    id: "delete",
    header: "",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => <DeletePatient patient={row.original} />,
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

// Replace your entire MedicalRecords component with this updated version:

export function MedicalRecords() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [data, setData] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("patient"); // Changed to 'patient'

  React.useEffect(() => {
    if (!user) return;
    const usersRef = ref(db, "users");
    const patientsRef = ref(db, "patients");

    const unsubscribe = onValue(usersRef, (usersSnap) => {
      const usersData = usersSnap.val() || {};
      const currentUser = usersData[user.uid];
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const unsubscribePatients = onValue(patientsRef, (snapshot) => {
        const raw = snapshot.val();
        const patients: Patient[] = raw
          ? Object.entries(raw)
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
                const sharedWith = patient.sharedWith || [];
                return (
                  patient.createdBy === user.uid ||
                  sharedWith.includes(user.uid)
                );
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

  // Updated columns with filterFn for patient column
  const columnsWithFilters: ColumnDef<Patient>[] = [
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => <PatientActions patient={row.original} />,
    },
    {
      id: "patient",
      header: "Patient",
      enableHiding: false,
      filterFn: (row, id, filterValue) => {
        if (!filterValue) return true;
        const patient = row.original;
        const fullName =
          `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const searchTerm = String(filterValue).toLowerCase();
        return fullName.includes(searchTerm);
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <PatientAvatar
            firstName={row.original.firstName}
            lastName={row.original.lastName}
            gender={row.original.gender}
          />
          <div className="leading-tight">
            <p className="font-medium text-gray-800 text-sm">
              {row.original.firstName} {row.original.lastName}
            </p>
            <p className="text-xs text-gray-400">{row.original.gender}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: "age", header: "Age", filterFn: "includesString" },
    {
      accessorKey: "birthdate",
      header: "Birth Date",
      filterFn: "includesString",
    },
    { accessorKey: "address", header: "Address", filterFn: "includesString" },
    {
      accessorKey: "telephone",
      header: "Contact Number",
      filterFn: "includesString",
    },
    { accessorKey: "addedBy", header: "Added By", filterFn: "includesString" },
    {
      accessorKey: "patientDiagnosis",
      header: "Diagnosis",
      filterFn: (row, id, filterValue) => {
        if (!filterValue) return true;
        const diagnoses = row.original.patientDiagnosis || [];
        const searchTerm = String(filterValue).toLowerCase();
        return diagnoses.some(
          (d) =>
            d.diagnosis.toLowerCase().includes(searchTerm) ||
            d.severity?.toLowerCase().includes(searchTerm) ||
            d.notes?.toLowerCase().includes(searchTerm),
        );
      },
      cell: ({ row }) => {
        const diagnosis = row.original.patientDiagnosis;
        if (!diagnosis?.length)
          return <span className="text-gray-300 text-xs">No diagnosis</span>;
        return (
          <div className="space-y-1.5 max-w-[280px]">
            {diagnosis.map((diag, i) => (
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
      id: "risks",
      header: "Risk Flags",
      enableSorting: false,
      cell: ({ row }) => <RiskIndicators patient={row.original} />,
    },
    {
      id: "delete",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => <DeletePatient patient={row.original} />,
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

  if (loading)
    return (
      <div className="flex justify-center items-center p-10 text-gray-500 text-sm gap-2">
        <Spinner className="w-5 h-5" />
        <span>Loading medical records…</span>
      </div>
    );

  const filterOptions = [
    { id: "patient", label: "Patient Name" },
    { id: "age", label: "Age" },
    { id: "birthdate", label: "Birth Date" },
    { id: "address", label: "Address" },
    { id: "telephone", label: "Contact Number" },
    { id: "addedBy", label: "Added By" },
    { id: "patientDiagnosis", label: "Diagnosis" },
  ];

  const filterLabel =
    filterOptions.find((f) => f.id === filter)?.label || "Patient Name";

  const filteredRows = table.getFilteredRowModel().rows;

  const Toolbar = (
    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
      <div className="relative flex-1 sm:max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder={`Search by ${filterLabel}…`}
          value={
            filter === "patientDiagnosis"
              ? ((table
                  .getColumn("patientDiagnosis")
                  ?.getFilterValue() as string) ?? "")
              : ((table.getColumn(filter)?.getFilterValue() as string) ?? "")
          }
          onChange={(e) => {
            const column = table.getColumn(filter);
            if (column) {
              column.setFilterValue(e.target.value || undefined);
            }
          }}
          className="w-full pl-8 pr-3 py-2 text-sm !bg-white border border-gray-200 rounded-lg shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a896]/40 focus:border-[#00a896] transition"
        />
      </div>

      <div className="flex gap-2">
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
                  const column = table.getColumn(col.id);
                  if (column) {
                    column.setFilterValue("");
                  }
                }}
                className={`text-sm capitalize ${filter === col.id ? "bg-[#00a896]/10 text-[#00a896] font-medium" : ""}`}
              >
                {col.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize text-sm"
                    checked={col.getIsVisible()}
                    onCheckedChange={(val) => col.toggleVisibility(val)}
                  >
                    {col.id === "patient"
                      ? "Patient Name"
                      : col.id === "patientDiagnosis"
                        ? "Diagnosis"
                        : col.id
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (s) => s.toUpperCase())}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <button
          onClick={() => exportToCSV(filteredRows.map((r) => r.original))}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium !bg-[#00a896] !text-white border border-gray-200 rounded-lg shadow-sm hover:opacity-90 transition sm:ml-auto flex-1 sm:flex-none justify-center"
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
          ? "No records"
          : `${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–${Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              filteredRows.length,
            )} of ${filteredRows.length}`}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
            Medical Records
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Manage and review patient records
          </p>
        </div>
        <button
          onClick={() => navigate("/add-record")}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-semibold text-white !bg-[#00a896] rounded-lg shadow hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          {isMobile ? "Add" : "Add Record"}
        </button>
      </div>

      <StatsBar patients={data} isMobile={isMobile} />
      {Toolbar}

      {isMobile ? (
        <>
          {filteredRows.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <EmptyRecords>
                <AddRecordsDrawer />
              </EmptyRecords>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {table.getRowModel().rows.map((row) => (
                <MobilePatientCard key={row.id} patient={row.original} />
              ))}
            </div>
          )}
          {Pagination}
        </>
      ) : (
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
                        className="h-32 text-center"
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
          </div>
          {Pagination}
        </>
      )}
    </div>
  );
}
