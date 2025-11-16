import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { ScrollArea, Scrollbar } from '@radix-ui/react-scroll-area';
import {
    ColumnDef,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    RowSelectionState,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

interface IAirport {
    id: string;
    iata_code: string;
    airport_name: string;
    city: string;
    country: string;
    airport_status: string;
    timezone: string;
}

export default function Index({ airports }: { airports: IAirport[] }) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'airport_name', desc: false },
    ]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [generatedIds, setGeneratedIds] = useState<Set<string>>(new Set());

    const columns = useMemo<ColumnDef<IAirport>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <input
                        type="checkbox"
                        checked={table.getIsAllRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                ),
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                ),
                size: 50,
            },
            { accessorKey: 'iata_code', header: 'IATA Code', size: 100 },
            { accessorKey: 'airport_name', header: 'Airport Name', size: 200 },
            {
                accessorKey: 'city',
                header: 'City',
                size: 150,
                filterFn: 'includesString',
            },
            { accessorKey: 'country', header: 'Country', size: 150 },
            { accessorKey: 'airport_status', header: 'Status', size: 120 },
            { accessorKey: 'timezone', header: 'Timezone', size: 150 },
            {
                id: 'generated',
                header: 'Generated',
                cell: ({ row }) => (
                    generatedIds.has(row.original.id) ? (
                        <svg
                            className="h-5 w-5 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    ) : null
                ),
                size: 100,
            },
        ],
        [generatedIds],
    );

    const table = useReactTable({
        columns,
        data: airports,
        pageCount: Math.ceil((airports?.length || 0) / pagination.pageSize),
        getRowId: (row: IAirport) => row.id,
        state: { pagination, sorting, rowSelection },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableRowSelection: true,
    });

    const generateAllNotams = async () => {
        setLoading(true);
        setNotification(null);

        try {
            const selectedRows = table.getSelectedRowModel().rows;
            const selectedAirports = selectedRows.map((row) => row.original);

            if (selectedAirports.length === 0) {
                setNotification('No airports selected');
                setLoading(false);
                return;
            }

            const response = await fetch('/api/generate-batch-notams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ airports: selectedAirports }),
            });

            const data = await response.json();

            if (data.success) {
                setNotification(data.message);
                // Mark selected rows as generated
                const newGeneratedIds = new Set(generatedIds);
                selectedAirports.forEach((airport) => newGeneratedIds.add(airport.id));
                setGeneratedIds(newGeneratedIds);
                // Removed router.reload() to prevent resetting the generatedIds state
            } else {
                setNotification('Error generating NOTAMs');
            }
        } catch (err) {
            setNotification('Error generating NOTAMs');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Airports', href: '/Airports' }]}>
            <Head title="Airports" />
            <div className="flex h-full flex-1 flex-col space-y-3 p-3">
                <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                    Airports Table
                </h1>

                <div className="flex items-center justify-between mb-4">
  {/* Filter Input */}
  <div className="flex items-center space-x-2">
    <label
      htmlFor="city-filter"
      className="text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      Filter by City:
    </label>
    <input
      id="city-filter"
      type="text"
      placeholder="Enter city name..."
      value={(table.getColumn('city')?.getFilterValue() as string) ?? ''}
      onChange={(e) =>
        table.getColumn('city')?.setFilterValue(e.target.value)
      }
      className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
    />
  </div>

  {/* Generate Button */}
  <button
    onClick={generateAllNotams}
    disabled={loading}
    className={`rounded-md px-6 py-2 text-white transition ${
      loading ? 'cursor-not-allowed bg-gray-400' : 'bg-green-600 hover:bg-green-700'
    }`}
  >
    {loading ? (
      <span className="flex items-center space-x-2">
        <svg
          className="h-5 w-5 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <span>Generating...</span>
      </span>
    ) : (
      'Generate Selected NOTAMs'
    )}
  </button>
</div>

                <DataGrid table={table} recordCount={airports?.length || 0}>
                    <div className="w-full space-y-2.5 overflow-hidden rounded-lg bg-white shadow-md transition dark:bg-gray-800">
                        <DataGridContainer>
                            <ScrollArea className="rounded-lg">
                                <DataGridTable />
                                <Scrollbar
                                    orientation="horizontal"
                                    className="rounded-b-lg"
                                />
                            </ScrollArea>
                        </DataGridContainer>

                        <div className="flex justify-end border-t border-gray-200 px-4 py-2 dark:border-gray-700">
                            <DataGridPagination />
                        </div>
                    </div>
                </DataGrid>
            </div>
        </AppLayout>
    );
}
