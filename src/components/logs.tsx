"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  IconFolderCode,
  IconSearch,
  IconFilter,
  IconClock,
  IconFileText,
  IconPill,
  IconArrowLeft,
  IconArrowRight,
  IconRefresh,
  IconDownload,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";

import { db } from "@/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { useAuth } from "@/auth/authprovider";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type Log = {
  id: string;
  prescriptionLog?: string;
  medicalRecordLog?: string;
  logTime: string;
  userId?: string;
  userName?: string;
};

const getLogTypeIcon = (type: string) => {
  switch (type) {
    case "Prescription":
      return <IconPill className="w-4 h-4" />;
    case "Medical Record":
      return <IconFileText className="w-4 h-4" />;
    default:
      return <IconFolderCode className="w-4 h-4" />;
  }
};

export function ViewLogs() {
  const { user } = useAuth();
  const [data, setData] = React.useState<Log[]>([]);
  const [filteredData, setFilteredData] = React.useState<Log[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterField, setFilterField] = React.useState("description");
  const [logTypeFilter, setLogTypeFilter] = React.useState<string>("all");
  const [searchValue, setSearchValue] = React.useState("");
  const [dateRange, setDateRange] = React.useState<{
    start: string;
    end: string;
  }>({
    start: "",
    end: "",
  });

  React.useEffect(() => {
    if (!user) return;

    const logsRef = ref(db, "logs");
    const unsubscribe = onValue(logsRef, (snapshot) => {
      const val = snapshot.val() || {};
      const logs: Log[] = Object.entries(val).map(([id, value]) => ({
        id,
        ...(value as any),
      }));

      logs.sort(
        (a, b) => new Date(b.logTime).getTime() - new Date(a.logTime).getTime(),
      );
      setData(logs);
      setFilteredData(logs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Apply filters whenever data or filter criteria change
  React.useEffect(() => {
    let result = [...data];

    // Apply log type filter
    if (logTypeFilter !== "all") {
      result = result.filter((log) => {
        const type = log.prescriptionLog
          ? "Prescription"
          : log.medicalRecordLog
            ? "Medical Record"
            : "Other";
        return type === logTypeFilter;
      });
    }

    // Apply search filter
    if (searchValue) {
      result = result.filter((log) => {
        if (filterField === "description") {
          const description = log.prescriptionLog || log.medicalRecordLog || "";
          return description.toLowerCase().includes(searchValue.toLowerCase());
        } else if (filterField === "logType") {
          const type = log.prescriptionLog
            ? "Prescription"
            : log.medicalRecordLog
              ? "Medical Record"
              : "Other";
          return type.toLowerCase().includes(searchValue.toLowerCase());
        }
        return true;
      });
    }

    // Apply date range filter
    if (dateRange.start) {
      result = result.filter(
        (log) => new Date(log.logTime) >= new Date(dateRange.start),
      );
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      result = result.filter((log) => new Date(log.logTime) <= endDate);
    }

    setFilteredData(result);
  }, [data, logTypeFilter, searchValue, filterField, dateRange]);

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "logTime", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<string, boolean>
  >({});

  const columns: ColumnDef<Log>[] = [
    {
      accessorKey: "logTime",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 !bg-[#00a896] !text-white hover:bg-transparent"
        >
          <IconClock className="w-4 h-4" />
          Time
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.logTime);
        return (
          <div className="font-mono text-sm">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">
              {date.toLocaleTimeString()}
            </div>
          </div>
        );
      },
    },
    {
      accessorFn: (row) =>
        row.prescriptionLog
          ? "Prescription"
          : row.medicalRecordLog
            ? "Medical Record"
            : "Other",
      id: "logType",
      header: "Log Type",
      cell: ({ row }) => {
        const type = row.getValue("logType") as string;
        return (
          <Badge variant="secondary" className="flex items-center gap-2 w-fit">
            {getLogTypeIcon(type)}
            {type}
          </Badge>
        );
      },
    },
    {
      accessorFn: (row) => row.prescriptionLog || row.medicalRecordLog || "",
      id: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        const [isExpanded, setIsExpanded] = React.useState(false);
        const shouldTruncate = description.length > 100;

        return (
          <div className="max-w-md">
            <p className="text-sm">
              {shouldTruncate && !isExpanded
                ? `${description.substring(0, 100)}...`
                : description}
            </p>
            {shouldTruncate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 hover:text-blue-700 p-0 h-auto mt-1"
              >
                {isExpanded ? "Show less" : "Read more"}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const exportToCSV = () => {
    const headers = ["Time", "Log Type", "Description"];
    const csvData = filteredData.map((log) => [
      new Date(log.logTime).toLocaleString(),
      log.prescriptionLog
        ? "Prescription"
        : log.medicalRecordLog
          ? "Medical Record"
          : "Other",
      log.prescriptionLog || log.medicalRecordLog || "",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearSearch = () => {
    setSearchValue("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a896] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
            <p className="text-gray-500 mt-1">
              Monitor and track all system activities
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 !bg-[#00a896] !text-white hover:!bg-[#008f7a]"
            >
              <IconRefresh className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="flex items-center gap-2 !bg-[#00a896] !text-white hover:!bg-[#008f7a]"
            >
              <IconDownload className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <IconFilter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop layout - 2 columns for search and log type */}
            <div className="hidden md:grid md:grid-cols-2 gap-4">
              {/* Search Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select value={filterField} onValueChange={setFilterField}>
                      <SelectTrigger className="w-[140px] !bg-[#00a896] !text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="description">Description</SelectItem>
                        <SelectItem value="logType">Log Type</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-[2] relative">
                    <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder={`Search by ${filterField === "description" ? "Description" : "Log Type"}...`}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Log Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Log Type
                </label>
                <Select value={logTypeFilter} onValueChange={setLogTypeFilter}>
                  <SelectTrigger className="!bg-[#00a896] !text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Prescription">Prescription</SelectItem>
                    <SelectItem value="Medical Record">
                      Medical Record
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mobile layout - stacked */}
            <div className="md:hidden space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Search Field
                </label>
                <Select value={filterField} onValueChange={setFilterField}>
                  <SelectTrigger className="!bg-[#00a896] !text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="description">Description</SelectItem>
                    <SelectItem value="logType">Log Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={`Search by ${filterField}...`}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Log Type
                </label>
                <Select value={logTypeFilter} onValueChange={setLogTypeFilter}>
                  <SelectTrigger className="!bg-[#00a896] !text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Prescription">Prescription</SelectItem>
                    <SelectItem value="Medical Record">
                      Medical Record
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range - same for both mobile and desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  From Date
                </label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  To Date
                </label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredData.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Prescription Logs</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredData.filter((l) => l.prescriptionLog).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Medical Record Logs</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredData.filter((l) => l.medicalRecordLog).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-50 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-b">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="font-semibold text-gray-700"
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
                        className="h-64 text-center"
                      >
                        <Empty>
                          <EmptyHeader>
                            <EmptyMedia variant="icon">
                              <IconFolderCode className="w-12 h-12 text-gray-400" />
                            </EmptyMedia>
                            <EmptyTitle>No Logs Found</EmptyTitle>
                            <EmptyDescription>
                              {dateRange.start || dateRange.end || searchValue
                                ? "No logs match your filter criteria. Try adjusting your filters."
                                : "No logs have been recorded yet. System activities will appear here."}
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600 order-2 sm:order-1">
            Showing{" "}
            {table.getFilteredRowModel().rows.length === 0
              ? "0"
              : table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                1}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}{" "}
            of {table.getFilteredRowModel().rows.length} entries
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 order-1 sm:order-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-20 !bg-[#00a896] !text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="!bg-[#00a896] !text-white hover:!bg-[#008f7a]"
              >
                <IconArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, table.getPageCount()) },
                  (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <Button
                        key={i}
                        variant={
                          table.getState().pagination.pageIndex === i
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => table.setPageIndex(i)}
                        className={`w-8 ${
                          table.getState().pagination.pageIndex === i
                            ? "!bg-[#00a896] !text-white"
                            : "!bg-white !text-gray-700 hover:!bg-gray-100"
                        }`}
                      >
                        {pageNumber}
                      </Button>
                    );
                  },
                )}
                {table.getPageCount() > 5 && (
                  <span className="text-gray-500">...</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="!bg-[#00a896] !text-white hover:!bg-[#008f7a]"
              >
                <IconArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
