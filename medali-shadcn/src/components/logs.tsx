"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { IconFolderCode } from "@tabler/icons-react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table"

import { db } from "@/firebaseConfig"
import { ref, onValue } from "firebase/database"
import { useAuth } from "@/auth/authprovider"

import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export type Log = {
  id: string
  prescriptionLog?: string
  medicalRecordLog?: string
  logTime: string
}

export const columns: ColumnDef<Log>[] = [
  { accessorKey: "logTime", header: "Time" },
  {
    accessorFn: (row) =>
      row.prescriptionLog ? "Prescription" : row.medicalRecordLog ? "Medical Record" : "Other",
    id: "logType",
    header: "Log Type",
  },
  {
    accessorFn: (row) => row.prescriptionLog || row.medicalRecordLog || "",
    id: "description",
    header: "Description",
  },
]

export function ViewLogs() {
  const { user } = useAuth()
  const [data, setData] = React.useState<Log[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState("description")

  React.useEffect(() => {
    if (!user) return
    const logsRef = ref(db, "logs")
    const unsubscribe = onValue(logsRef, (snapshot) => {
      const val = snapshot.val() || {}
      const logs: Log[] = Object.entries(val).map(([id, value]) => ({
        id,
        ...(value as any),
      }))
      
      logs.sort((a, b) => new Date(b.logTime).getTime() - new Date(a.logTime).getTime())
      setData(logs)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({})

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
  })

  if (loading) return <div className="p-10 text-center">Loading logs...</div>

  return (
    <div className="flex flex-col p-4 gap-4">
      <h1 className="text-3xl font-bold text-center text-blue-600">System Logs</h1>

      <div className="flex flex-row gap-4">
        <Input
          placeholder={`🔍 Search by ${filter.toUpperCase()}`}
          value={(table.getColumn(filter)?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn(filter)?.setFilterValue(e.target.value)}
          className="w-96 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

    
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="overflow-auto">
          <Table className="min-w-full text-sm">
            <TableHeader className="sticky top-0 bg-blue-200 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
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
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <IconFolderCode />
                        </EmptyMedia>
                        <EmptyTitle>No Logs Available</EmptyTitle>
                        <EmptyDescription>
                          No logs have been recorded yet.
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

    
      <div className="flex items-center justify-between py-2 border-t bg-white">
        <div className="text-muted-foreground text-sm">
          {table.getFilteredRowModel().rows.length} row(s)
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="!bg-blue-600 !text-white"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="!bg-blue-600 !text-white"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
