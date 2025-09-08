import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext';
import {deleteInvoice, getInvoices, updateInvoice} from '../../services/firestore';
import {generateInvoicePDF} from '../../services/pdfService';
import {Invoice} from '../../types';
import {Download, Edit, Filter, Mail, Plus, Trash2} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import {format} from 'date-fns';

const InvoiceList: React.FC = () => {
    const {userProfile} = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all');

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
            await updateInvoice(invoiceId, {status: newStatus});
            setInvoices(invoices.map(inv =>
                inv.id === invoiceId ? {...inv, status: newStatus} : inv
            ));
            toast.success('Invoice status updated');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const filteredInvoices = invoices.filter(invoice => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'overdue') {
            return invoice.status !== 'paid' && new Date(invoice.dueDate) < new Date();
        }
        return invoice.status === filterStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg"/>
            </div>
        );
    }

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
                    <Plus className="w-5 h-5"/>
                    <span>Create Invoice</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center space-x-4">
                    <Filter className="w-5 h-5 text-gray-400"/>
                    <div className="flex space-x-2">
                        {[
                            {key: 'all', label: 'All'},
                            {key: 'draft', label: 'Draft'},
                            {key: 'sent', label: 'Sent'},
                            {key: 'paid', label: 'Paid'},
                            {key: 'overdue', label: 'Overdue'}
                        ].map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => setFilterStatus(filter.key as any)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    filterStatus === filter.key
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            {filteredInvoices.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div
                        className="bg-gray-50 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Plus className="w-8 h-8 text-gray-400"/>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {filterStatus === 'all' ? 'No invoices yet' : `No ${filterStatus} invoices`}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {filterStatus === 'all'
                            ? 'Get started by creating your first invoice'
                            : `You don't have any ${filterStatus} invoices at the moment`
                        }
                    </p>
                    {filterStatus === 'all' && (
                        <Link
                            to="/invoices/create"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            Create Your First Invoice
                        </Link>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-6 font-medium text-gray-700">Invoice</th>
                                <th className="text-left py-3 px-6 font-medium text-gray-700">Client</th>
                                <th className="text-left py-3 px-6 font-medium text-gray-700">Amount</th>
                                <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                                <th className="text-left py-3 px-6 font-medium text-gray-700">Due Date</th>
                                <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-6">
                                        <div>
                        <span className="font-medium text-gray-900">
                          #{invoice.invoiceNumber}
                        </span>
                                            <p className="text-sm text-gray-500">
                                                {format(invoice.createdAt, 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div>
                        <span className="font-medium text-gray-900">
                          {invoice.client.name}
                        </span>
                                            <p className="text-sm text-gray-500">
                                                {invoice.client.email}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 font-medium text-gray-900">
                                        ₹{invoice.total.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6">
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
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">
                                        {format(invoice.dueDate, 'MMM dd, yyyy')}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleDownloadPDF(invoice)}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Download PDF"
                                            >
                                                <Download className="w-4 h-4"/>
                                            </button>

                                            <button
                                                onClick={() => handleSendEmail(invoice)}
                                                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                                title="Send Email"
                                            >
                                                <Mail className="w-4 h-4"/>
                                            </button>

                                            <Link
                                                to={`/invoices/edit/${invoice.id}`}
                                                className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                                                title="Edit Invoice"
                                            >
                                                <Edit className="w-4 h-4"/>
                                            </Link>

                                            <button
                                                onClick={() => handleDelete(invoice.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete Invoice"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceList;