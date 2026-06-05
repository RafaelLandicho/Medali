"use client"

import * as React from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { db } from "@/firebaseConfig"
import { ref, onValue } from "firebase/database"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"

// ---------------- Data Type ----------------
export type Patient = {
  id: string
  firstName: string
  lastName: string
  gender: string
  age: number
  address: string
  telephone: string
  addedBy: string
  bloodPressure?: string
  heartRate?: string
  respiratoryRate?: string
  temperature?: string
  oxygenSaturation?: string
}

// ---------------- Columns ----------------
export const columns: ColumnDef<Patient>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        className="!bg-white !checked:bg-green-600 !checked:border-blue-600 "
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        className="!bg-white !checked:bg-green-600 !checked:border-blue-600 "
        aria-label="Select row"
      />
    ),
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
      const patient = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hidden sm:inline-flex">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(patient.id)}>
              Copy Patient ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View patient details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// ---------------- Component ----------------
export function DataTableDemo() {
  const [data, setData] = React.useState<Patient[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const auth = getAuth()
    signInWithEmailAndPassword(auth, "newtest@gmail.com", "password123")
      .then(() => {
        const patientsRef = ref(db, "patients")
        const unsubscribe = onValue(patientsRef, (snapshot) => {
          const dbData = snapshot.val()
          const patients: Patient[] = dbData
            ? Object.entries(dbData).map(([id, value]) => ({ id, ...(value as any) }))
            : []
          setData(patients)
          setLoading(false)
        })
        return () => unsubscribe()
      })
      .catch((err) => {
        console.error("Auth error:", err)
        setLoading(false)
      })
  }, [])

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({})
  const [rowSelection, setRowSelection] = React.useState({})

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
  })

  if (loading) return <div className="p-10 text-center">Loading...</div>

  return (
    <div className="w-screen h-[calc(100vh-120px)] flex flex-col p-4">
      {/* Filter & Column Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center py-2 gap-2">
        <Input
          placeholder="Filter by First Name."
          value={(table.getColumn("firstName")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("firstName")?.setFilterValue(e.target.value)}
          className="max-w-sm w-full sm:w-auto"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto !bg-blue-600 !text-white">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns().filter(col => col.getCanHide()).map(col => (
              <DropdownMenuCheckboxItem
                key={col.id}
                className="capitalize"
                checked={col.getIsVisible()}
                onCheckedChange={(value) => col.toggleVisibility(!!value)}
              >
                {col.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-md border">
        <Table className="min-w-full !bg-green-50">
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center ">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination & Selected Count */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 py-4">
        <div className="text-muted-foreground text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" className="!bg-blue-600 !text-white" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" className="!bg-blue-600 !text-white" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
