import React, { useEffect, useState, useMemo } from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { deleteInvoice, getInvoices, updateInvoice } from '../../services/firestore';
import { generateInvoicePDF } from '../../services/pdfService';
import { Invoice } from '../../types';
import { Download, Edit, Filter, Mail, Plus, Search, Trash2 } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    createColumnHelper,
    flexRender,
    SortingState,
    ColumnFiltersState,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper<Invoice>();

const InvoiceList: React.FC = () => {
    const { userProfile } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const [searchParams] = useSearchParams();
    const clientIdFromUrl = searchParams.get('clientId');

    useEffect(() => {
        fetchInvoices();
    }, [userProfile?.uid]);

    const fetchInvoices = async () => {
        if (!userProfile?.uid) return;

        try {
            const invoicesData = await getInvoices(userProfile.uid);
            setInvoices(invoicesData);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast.error('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (invoiceId: string) => {
        if (!confirm('Are you sure you want to delete this invoice?')) return;

        try {
            await deleteInvoice(invoiceId);
            setInvoices(invoices.filter(invoice => invoice.id !== invoiceId));
            toast.success('Invoice deleted successfully');
        } catch (error) {
            console.error('Error deleting invoice:', error);
            toast.error('Failed to delete invoice');
        }
    };

    const handleDownloadPDF = async (invoice: Invoice) => {
        if (!userProfile) return;

        try {
            const pdfBlob = await generateInvoicePDF(invoice, userProfile);
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${invoice.invoiceNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('PDF downloaded successfully');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF');
        }
    };

    const handleSendEmail = async (invoice: Invoice) => {
        if (!userProfile) return;

        try {
            const subject = `Invoice #${invoice.invoiceNumber}`;
            const body = `Dear ${invoice.client.name},

Please find attached invoice #${invoice.invoiceNumber} for the amount of ₹${invoice.total.toLocaleString()}.

Due Date: ${format(invoice.dueDate, 'MMMM dd, yyyy')}

Thank you for your business!

Best regards,
${userProfile.displayName || userProfile.businessName}`;

            window.location.href = `mailto:${invoice.client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            toast.success('Email client opened with invoice details');
        } catch (error) {
            console.error('Error preparing email:', error);
            toast.error('Failed to prepare email');
        }
    };

    const handleStatusChange = async (invoiceId: string, newStatus: Invoice['status']) => {
        try {
            await updateInvoice(invoiceId, { status: newStatus });
            setInvoices(invoices.map(inv =>
                inv.id === invoiceId ? { ...inv, status: newStatus } : inv
            ));
            toast.success('Invoice status updated');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const filteredInvoices = useMemo(() => {
        return clientIdFromUrl
            ? invoices.filter(invoice => invoice.client.id === clientIdFromUrl)
            : invoices;
    }, [invoices, clientIdFromUrl]);

    const columns = useMemo(
        () => [
            columnHelper.accessor('invoiceNumber', {
                header: 'Invoice',
                cell: (info) => (
                    <div>
            <span className="font-medium text-gray-900">
              #{info.getValue()}
            </span>
                        <p className="text-sm text-gray-500">
                            {format(new Date(info.row.original.createdAt), 'MMM dd, yyyy')}
                        </p>
                    </div>
                ),
            }),
            columnHelper.accessor('client.name', {
                header: 'Client',
                cell: (info) => (
                    <div>
            <span className="font-medium text-gray-900">
              {info.getValue()}
            </span>
                        <p className="text-sm text-gray-500">
                            {info.row.original.client.email}
                        </p>
                    </div>
                ),
            }),
            columnHelper.accessor('total', {
                header: 'Amount',
                cell: (info) => (
                    <span className="font-medium text-gray-900">
            ₹{info.getValue().toLocaleString()}
          </span>
                ),
            }),
            columnHelper.accessor('status', {
                header: 'Status',
                cell: (info) => {
                    const invoice = info.row.original;
                    return (
                        <select
                            value={invoice.status}
                            onChange={(e) => handleStatusChange(invoice.id, e.target.value as Invoice['status'])}
                            className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${
                                invoice.status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : invoice.status === 'sent'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : invoice.status === 'overdue'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                        </select>
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
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: (info) => {
                    const invoice = info.row.original;
                    return (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleDownloadPDF(invoice)}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Download PDF"
                            >
                                <Download className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => handleSendEmail(invoice)}
                                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                title="Send Email"
                            >
                                <Mail className="w-4 h-4" />
                            </button>

                            <Link
                                to={`/invoices/edit/${invoice.id}`}
                                className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                                title="Edit Invoice"
                            >
                                <Edit className="w-4 h-4" />
                            </Link>

                            <button
                                onClick={() => handleDelete(invoice.id)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete Invoice"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    );
                },
            }),
        ],
        [handleDelete, handleDownloadPDF, handleSendEmail, handleStatusChange]
    );

    const table = useReactTable({
        data: filteredInvoices,
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
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const statusOptions = ['draft', 'sent', 'paid', 'overdue'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-600 mt-1">Manage all your invoices</p>
                </div>
                <Link
                    to="/invoices/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create Invoice</span>
                </Link>
            </div>

            {/* Invoices Table */}
            {filteredInvoices.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="bg-gray-50 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No invoices yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Get started by creating your first invoice
                    </p>
                    <Link
                        to="/invoices/create"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Create Your First Invoice
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">All Invoices</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {/* Search and Filter Controls */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Global Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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

                            {/* Quick Filter Buttons */}
                            <div className="flex items-center space-x-4">
                                <Filter className="w-5 h-5 text-gray-400" />
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setGlobalFilter('');
                                            table.getColumn('status')?.setFilterValue(undefined);
                                        }}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                            !globalFilter && !table.getColumn('status')?.getFilterValue()
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        All
                                    </button>
                                    {statusOptions.map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setGlobalFilter('');
                                                table.getColumn('status')?.setFilterValue(status);
                                            }}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                                table.getColumn('status')?.getFilterValue() === status
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    key={header.id}
                                                    className="text-left py-3 px-6 font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
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
                                                <td key={cell.id} className="py-4 px-6">
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceList;