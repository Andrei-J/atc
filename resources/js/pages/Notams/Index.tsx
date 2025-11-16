import { useState } from 'react';
import { ScrollArea, Scrollbar } from '@radix-ui/react-scroll-area';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';  // Added router for navigation

export default function Index() {
    // Pull notams from Inertia props, ensure fallback empty array
    const { notams = [] } = usePage<{
        notams?: Array<{
            id: number;
            airport_id: string;
            airport_name: string;
            city?: string;
            message?: string;
            created_at?: string | null;
            airport?: { iata_code?: string; airport_name: string | null } | null;
        }>;
    }>().props;

    // Pagination state
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const perPageOptions = [5, 10, 20, 50, 100];

    // Search bar state
    const [airportSearch, setAirportSearch] = useState('');

    // Filter notams by airport name (case-insensitive)
    const filteredNotams = notams.filter(n =>
        (n.airport?.airport_name ?? n.airport_name ?? '')
            .toLowerCase()
            .includes(airportSearch.toLowerCase())
    );

    // Calculate pagination for filtered results
    const totalItems = filteredNotams.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    // Ensure page is always in bounds
    const safePage = Math.max(1, Math.min(page, totalPages));
    if (safePage !== page) setPage(safePage);

    const paginatedNotams = filteredNotams.slice((safePage - 1) * perPage, safePage * perPage);

    const handlePageChange = (newPage: number) => {
        setPage(Math.max(1, Math.min(totalPages, newPage)));
    };

    const handlePerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setPerPage(Number(event.target.value));
        setPage(1);
    };

    const handleAirportSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAirportSearch(e.target.value);
        setPage(1); // Reset to first page on search change
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Notams', href: '/Notams' }]}>
            <Head title="Notice to Airmen" />
            <div className="flex h-full flex-1 flex-col space-y-3 p-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Notams Table
                </h1>

                {/* Search Airport */}
                <div className="mb-3 flex items-center space-x-2">
                    <label htmlFor="airport-search" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Search Airport:
                    </label>
                    <input
                        id="airport-search"
                        type="text"
                        value={airportSearch}
                        placeholder="Type airport name..."
                        onChange={handleAirportSearchChange}
                        className="border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        autoComplete="off"
                    />
                </div>

                <ScrollArea className="w-full rounded-md border bg-white/50 p-2 dark:bg-gray-900/50">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">IATA</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Airport</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">City</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Message</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Created</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedNotams && paginatedNotams.length > 0 ? (
                                paginatedNotams.map((n) => (
                                    <tr key={n.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                            {n.airport?.iata_code ?? n.airport_id}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                            {n.airport?.airport_name ?? '-'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                            {n.city ?? '-'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                            {n.message ?? '-'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                            {n.created_at ? new Date(n.created_at).toLocaleString() : '-'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                            <button
                                                onClick={() => router.visit(`/notams/edit?id=${n.id}`)}
                                                className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 transition"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No NOTAMs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Scrollbar orientation="horizontal" />

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between mt-4 px-2">
                        <div className="flex items-center">
                            <span className="mr-2 text-sm">Rows per page:</span>
                            <select
                                value={perPage}
                                onChange={handlePerPageChange}
                                className="border rounded px-2 py-1 bg-white dark:bg-gray-900 text-sm"
                            >
                                {perPageOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                disabled={safePage === 1}
                                className={`px-2 py-1 border rounded text-sm ${safePage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                                onClick={() => handlePageChange(safePage - 1)}
                            >
                                Prev
                            </button>
                            <span className="text-sm px-2">
                                Page {safePage} of {totalPages}
                            </span>
                            <button
                                disabled={safePage === totalPages || totalPages === 0}
                                className={`px-2 py-1 border rounded text-sm ${safePage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                                onClick={() => handlePageChange(safePage + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </AppLayout>
    );
}