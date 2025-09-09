import React, {useEffect, useMemo, useState} from 'react';
import {useAuth} from '../../contexts/AuthContext';
import {getClients, getInvoices} from '../../services/firestore';
import {Client, Invoice} from '../../types';
import {AlertCircle, Clock, DollarSign, FileText, Search, TrendingUp, Users} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import {format} from 'date-fns';
import {
    ColumnFiltersState,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper<Invoice>();

const Dashboard: React.FC = () => {
    const {userProfile} = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!userProfile?.uid) return;

            try {
                const [invoicesData, clientsData] = await Promise.all([
                    getInvoices(userProfile.uid),
                    getClients(userProfile.uid)
                ]);

                setInvoices(invoicesData);
                setClients(clientsData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userProfile?.uid]);

    const columns = useMemo(
        () => [
            columnHelper.accessor('invoiceNumber', {
                header: 'Invoice',
                cell: (info) => (
                    <span className="font-medium text-gray-900">
            #{info.getValue()}
          </span>
                ),
            }),
            columnHelper.accessor('client.name', {
                header: 'Client',
                cell: (info) => (
                    <span className="text-gray-600">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor('total', {
                header: 'Amount',
                cell: (info) => (
                    <span className="font-medium">
            ₹{info.getValue().toLocaleString()}
          </span>
                ),
            }),
            columnHelper.accessor('status', {
                header: 'Status',
                cell: (info) => {
                    const status = info.getValue();
                    return (
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : status === 'sent'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : status === 'overdue'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                        }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
                    );
                },
                filterFn: 'equals',
            }),
            columnHelper.accessor('dueDate', {
                header: 'Due Date',
                cell: (info) => (
                    <span className="text-gray-600">
            {format(new Date(info.getValue()), 'MMM dd, yyyy')}
          </span>
                ),
                sortingFn: (rowA, rowB) => {
                    const dateA = new Date(rowA.original.dueDate);
                    const dateB = new Date(rowB.original.dueDate);
                    return dateA.getTime() - dateB.getTime();
                },
            }),
        ],
        []
    );

    const table = useReactTable({
        data: invoices,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg"/>
            </div>
        );
    }

    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const paidRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const pendingInvoices = invoices.filter(inv => inv.status === 'sent');
    const overdueInvoices = invoices.filter(inv =>
        inv.status !== 'paid' && new Date(inv.dueDate) < new Date()
    );

    const stats = [
        {
            title: 'Total Revenue',
            value: `₹${totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Paid Revenue',
            value: `₹${paidRevenue.toLocaleString()}`,
            icon: TrendingUp,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Total Invoices',
            value: invoices.length.toString(),
            icon: FileText,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Total Clients',
            value: clients.length.toString(),
            icon: Users,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        }
    ];

    const statusOptions = ['draft', 'sent', 'paid', 'overdue'];

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {userProfile?.displayName || 'User'}!
                </h1>
                <p className="text-gray-600 mt-1">
                    Here's what's happening with your business today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`}/>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Alerts */}
            {(pendingInvoices.length > 0 || overdueInvoices.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pendingInvoices.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                            <div className="flex items-center">
                                <Clock className="w-6 h-6 text-yellow-600"/>
                                <h3 className="text-lg font-semibold text-yellow-800 ml-2">
                                    Pending Invoices
                                </h3>
                            </div>
                            <p className="text-yellow-700 mt-2">
                                You have {pendingInvoices.length} invoice(s) waiting for payment
                            </p>
                        </div>
                    )}

                    {overdueInvoices.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                            <div className="flex items-center">
                                <AlertCircle className="w-6 h-6 text-red-600"/>
                                <h3 className="text-lg font-semibold text-red-800 ml-2">
                                    Overdue Invoices
                                </h3>
                            </div>
                            <p className="text-red-700 mt-2">
                                You have {overdueInvoices.length} overdue invoice(s) requiring attention
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Invoices Table */}
            <div className="bg-white rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
                </div>
                <div className="p-6">
                    {invoices.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="inline-block bg-blue-600 p-2 rounded-lg">
                                <img
                                    src="/favicon.ico"
                                    alt="Logo"
                                    className="w-6 h-6"
                                />
                            </div>
                            <p className="text-gray-500">No invoices yet. Create your first invoice!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Search and Filter Controls */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Global Search */}
                                <div className="relative flex-1">
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
                                    <input
                                        type="text"
                                        placeholder="Search invoices..."
                                        value={globalFilter ?? ''}
                                        onChange={(e) => setGlobalFilter(String(e.target.value))}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="sm:w-48">
                                    <select
                                        value={(table.getColumn('status')?.getFilterValue() as string) ?? ''}
                                        onChange={(e) => {
                                            table.getColumn('status')?.setFilterValue(
                                                e.target.value === '' ? undefined : e.target.value
                                            );
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Statuses</option>
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id} className="border-b border-gray-200">
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    key={header.id}
                                                    className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    <div className="flex items-center space-x-1">
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                        <span>
                                {header.column.getIsSorted()
                                    ? header.column.getIsSorted() === 'desc'
                                        ? ' ↓'
                                        : ' ↑'
                                    : ''}
                              </span>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                    </thead>
                                    <tbody>
                                    {table.getRowModel().rows.map((row) => (
                                        <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="py-3 px-4">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        onClick={() => table.setPageIndex(0)}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        {'<<'}
                                    </button>
                                    <button
                                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        {'<'}
                                    </button>
                                    <button
                                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        {'>'}
                                    </button>
                                    <button
                                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        {'>>'}
                                    </button>
                                </div>

                                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                      {table.getPageCount()}
                  </span>
                                    <select
                                        value={table.getState().pagination.pageSize}
                                        onChange={(e) => {
                                            table.setPageSize(Number(e.target.value));
                                        }}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                                    >
                                        {[10, 20, 30, 40, 50].map((pageSize) => (
                                            <option key={pageSize} value={pageSize}>
                                                Show {pageSize}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="text-sm text-gray-700">
                                    Showing {table.getRowModel().rows.length} of{' '}
                                    {table.getFilteredRowModel().rows.length} entries
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;