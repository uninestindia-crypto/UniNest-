"use client"

import * as React from "react"
import {
    ArrowDown,
    ArrowUp,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    Filter as FilterIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type ColumnDef<T> = {
    header: string | React.ReactNode;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
    sortable?: boolean;
}

type DataTableProps<T> = {
    data: T[];
    columns: ColumnDef<T>[];
    searchKey?: keyof T;
    searchPlaceholder?: string;
    className?: string;
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    searchKey,
    searchPlaceholder = "Search...",
    className,
}: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(10)
    const [sortConfig, setSortConfig] = React.useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null)
    const [searchTerm, setSearchTerm] = React.useState("")

    // Filter
    const filteredData = React.useMemo(() => {
        if (!searchKey || !searchTerm) return data

        return data.filter((item) => {
            const value = item[searchKey]
            if (value == null) return false
            return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
    }, [data, searchKey, searchTerm])

    // Sort
    const sortedData = React.useMemo(() => {
        if (!sortConfig) return filteredData

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key]
            const bValue = b[sortConfig.key]

            if (aValue === bValue) return 0

            const comparison = aValue > bValue ? 1 : -1
            return sortConfig.direction === 'asc' ? comparison : -comparison
        })
    }, [filteredData, sortConfig])

    // Pagination
    const totalPages = Math.ceil(sortedData.length / pageSize)
    const paginatedData = React.useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return sortedData.slice(startIndex, startIndex + pageSize)
    }, [sortedData, currentPage, pageSize])

    // Reset page when filter changes
    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, pageSize])

    const handleSort = (key: keyof T) => {
        setSortConfig((current) => {
            if (current?.key === key) {
                if (current.direction === 'asc') return { key, direction: 'desc' }
                return null // atomic toggle: asc -> desc -> none
            }
            return { key, direction: 'asc' }
        })
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
                {searchKey && (
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-10 w-[200px] lg:w-[300px]"
                        />
                    </div>
                )}
                <div className="flex items-center space-x-2">
                    {/* Additional toolbar actions can be injected here if needed */}
                </div>
            </div>

            <div className="rounded-md border border-border/50 overflow-hidden bg-card">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent border-border/50">
                            {columns.map((col, index) => (
                                <TableHead
                                    key={index}
                                    className={cn(col.className, "h-12")}
                                >
                                    {col.sortable && col.accessorKey ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                                            onClick={() => handleSort(col.accessorKey!)}
                                        >
                                            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{col.header}</span>
                                            {sortConfig?.key === col.accessorKey ? (
                                                sortConfig.direction === 'asc' ? (
                                                    <ArrowUp className="ml-2 h-3.5 w-3.5" />
                                                ) : (
                                                    <ArrowDown className="ml-2 h-3.5 w-3.5" />
                                                )
                                            ) : (
                                                <FilterIcon className="ml-2 h-3 w-3 opacity-0 group-hover:opacity-100" />
                                            )}
                                        </Button>
                                    ) : (
                                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{col.header}</span>
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item, i) => (
                                <TableRow key={i} className="group hover:bg-muted/30 border-border/50 transition-colors">
                                    {columns.map((col, j) => (
                                        <TableCell key={j} className={cn("py-3", col.className)}>
                                            {col.cell ? col.cell(item) : col.accessorKey ? item[col.accessorKey] : null}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-muted-foreground">Rows per page</p>
                        <Select
                            value={`${pageSize}`}
                            onValueChange={(value) => setPageSize(Number(value))}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[5, 10, 20, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
