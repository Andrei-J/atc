import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit() {
    const { notam } = usePage<{ notam: { id: number; message: string; airport_id: string } }>().props;
    const [message, setMessage] = useState(notam.message || '');
    const [loading, setLoading] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.put(`/notams/${notam.id}`, { message }, {
            onFinish: () => setLoading(false)
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Edit NOTAM', href: `/notams/${notam.id}/edit` }]}>
            <Head title="Edit NOTAM" />
            <div className="flex h-full flex-1 flex-col space-y-6 p-6 bg-white dark:bg-gray-900 animate-fade-in">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    Edit NOTAM
                </h1>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                                Message
                            </label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={8}
                                placeholder="Enter the NOTAM message..."
                                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out resize-vertical hover:border-gray-400 dark:hover:border-gray-500"
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => router.visit('/notams')}
                                className="rounded-md bg-gray-300 dark:bg-gray-600 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200 transform hover:scale-105"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                            >
                                {loading && (
                                    <svg
                                        className="animate-spin h-4 w-4 text-white"
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
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        />
                                    </svg>
                                )}
                                <span>{loading ? 'Updating...' : 'Update NOTAM'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}