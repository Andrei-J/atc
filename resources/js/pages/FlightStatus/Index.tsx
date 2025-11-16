import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, Scrollbar } from '@radix-ui/react-scroll-area';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import {
    ColumnDef,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

// --- Interface for Flight Status ---
interface IFlightStatus {
    id: string;
    id_status_code: string; // Added field
    status_code: string;
    status_name: string;
    description: string;
}

// --- Props interface ---
interface FlightStatusIndexProps {
    flightStatuses: IFlightStatus[];
}

// --- Component ---
export default function FlightStatusIndex({ flightStatuses }: FlightStatusIndexProps) {
    // --- Pagination state ---
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // --- Columns definition ---
    const columns = useMemo<ColumnDef<IFlightStatus>[]>(() => [
        {
            id: 'index',
            header: '#',
            cell: ({ row }) => row.index + 1,
            size: 50,
        },
        { accessorKey: 'id_status_code', header: 'ID Status Code', size: 100 },
        { accessorKey: 'status_code', header: 'Status Code', size: 120 },
        { accessorKey: 'status_name', header: 'Status Name', size: 150 },
        { accessorKey: 'description', header: 'Description', size: 300 },
    ], []);

    // --- Table instance ---
    const table = useReactTable({
        columns,
        data: flightStatuses,
        pageCount: Math.ceil((flightStatuses?.length || 0) / pagination.pageSize),
        getRowId: (row: IFlightStatus) => row.id,
        state: { pagination },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    // --- Render ---
    return (
        <AppLayout breadcrumbs={[{ title: 'Flight Status', href: '/FlightStatus' } as BreadcrumbItem]}>
            <Head title="Flight Status" />
            <div className="flex h-full flex-1 flex-col space-y-3 p-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Flight Status Table
                </h1>

                <DataGrid table={table} recordCount={flightStatuses?.length || 0}>
                    <div className="w-full space-y-2.5 rounded-lg shadow-md overflow-hidden bg-white dark:bg-gray-800 transition">
                        <DataGridContainer>
                            <ScrollArea className="rounded-lg">
                                <DataGridTable />
                                <Scrollbar orientation="horizontal" className="rounded-b-lg" />
                            </ScrollArea>
                        </DataGridContainer>

                        {/* Pagination footer */}
                        <div className="flex justify-end px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                            <DataGridPagination />
                        </div>
                    </div>
                </DataGrid>
            </div>
        </AppLayout>
    );
}
