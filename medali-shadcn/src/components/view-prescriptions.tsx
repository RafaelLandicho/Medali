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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { MoreHorizontal, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { ref, onValue, remove, push, set } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import { EmptyRecords } from "./empty-records";
import { PrescriptionDrawer } from "./edit-prescription-drawer";
import { FullPrescriptionDrawer } from "./view-full-prescription-drawer";

export type Prescription = {
  id: string;
  patientFirstName: string;
  patientLastName: string;
  patientGender?: string;
  patientAge?: number;
  patientAddress: string;
  doctorId: string;
  diagnosis: {
    diagnosis: string;
    severity: string;
    notes: string;
  }[];
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

export const columns: ColumnDef<Prescription>[] = [
  {
    id: "icon",
    header: "",
    cell: ({ row }) => {
      const { user } = useAuth();
      const [openDetails, setOpenDetails] = React.useState(false);
      const [openEdit, setOpenEdit] = React.useState(false);
      const prescription = row.original;
      const userIsDoctor =
        user?.type?.toLowerCase() === "doctor" ||
        user?.type?.toLowerCase() === "admin";

      return (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setOpenDetails(true)}
            className="!bg-white rounded hover:bg-gray-200"
          >
            <PillIcon className="text-orange-600" />
          </Button>
          <FullPrescriptionDrawer
            open={openDetails}
            onOpenChange={setOpenDetails}
            prescription={prescription}
          />
          {userIsDoctor && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOpenEdit(true)}
              className="!bg-white rounded hover:bg-gray-200"
            >
              <PenIcon className="text-orange-600" />
            </Button>
          )}

          <PrescriptionDrawer
            open={openEdit}
            onOpenChange={setOpenEdit}
            prescription={prescription}
          />
        </>
      );
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

      if (!diagnosisList?.length) return "No diagnosis";

      return (
        <div className="space-y-1 max-w-[300px]">
          {diagnosisList.map((diag, i) => (
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
    accessorKey: "drugs",
    header: "Drugs",
    cell: ({ row }) => {
      const drugs = row.original.drugs;
      if (!drugs?.length) return "No drugs";

      return (
        <div className="space-y-1">
          {drugs.map((drug, i) => (
            <div key={i}>
              {drug.medicine} : {drug.dosage} : {drug.unit}
            </div>
          ))}
        </div>
      );
    },
  },

  {
    id: "delete",
    header: "",
    cell: ({ row }) => {
      const prescription = row.original;
      const { user } = useAuth();
      const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);

      if (!user) return <></>;

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
        } catch (error) {
          console.error("Error deleting prescription:", error);
          toast.success("Failed to delete prescription!");
        }
      };

      return (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setOpenDeleteDialog(true)}
            className="!bg-white rounded hover:bg-gray-200"
          >
            <Trash2Icon className="text-orange-600" />
          </Button>

          <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete this prescription?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. It will permanently the
                  prescription of{" "}
                  <span className="font-semibold">
                    {prescription.patientFirstName}{" "}
                    {prescription.patientLastName}
                  </span>{" "}
                  from your database.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end gap-2">
                <DialogClose className="!bg-gray-200">Cancel</DialogClose>
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
    },
    enableSorting: false,
    enableHiding: false,
  },
];

export function Prescriptions() {
  const { user } = useAuth();
  const [data, setData] = React.useState<Prescription[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("patientFirstName");
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
        const data = snapshot.val();
        const prescriptions: Prescription[] = data
          ? Object.entries(data)
              .map(([id, value]) => ({ id, ...(value as any) }))
              .filter((prescription) => {
                if (currentUser.type === "admin") return true;

                return (
                  "createdBy" in prescription &&
                  canSee.includes(prescription.createdBy)
                );
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

  return (
    <div className="flex flex-col p-4 gap-2">
      <div>
        <span className="!font-bold !text-orange-500 !text-4xl !flex justify-center">
          Medical Prescriptions
        </span>
      </div>
      <div className="flex flex-row p-4 gap-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-10">
          <Input
            placeholder={`🔍 Search by ${filter.toUpperCase()}`}
            value={(table.getColumn(filter)?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn(filter)?.setFilterValue(e.target.value)
            }
            className="w-96 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto !bg-orange-500 !text-white"
              >
                Filter <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((col) => col.getCanFilter())
                .map((col) => (
                  <DropdownMenuItem
                    key={col.id}
                    onSelect={(e) => {
                      e.preventDefault();
                      setFilter(col.id);
                      col.setFilterValue("");
                    }}
                    className={`capitalize ${
                      filter === col.id ? "!bg-blue-100 !text-blue-700" : ""
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

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="overflow-auto">
          <Table className="min-w-full text-sm">
            <TableHeader className="sticky top-0 bg-[#00a896] z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-white">
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
                    className="!bg-white !text-black"
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <IconFolderCode />
                        </EmptyMedia>
                        <EmptyTitle>No Prescriptions Created Yet</EmptyTitle>
                        <EmptyDescription>
                          You haven&apos;t created any records yet. Get started
                          by creating your first prescription.
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent></EmptyContent>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-2 border-t bg-white">
        <div className="text-muted-foreground text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="!bg-orange-500 !text-white"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="!bg-orange-500 !text-white"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
