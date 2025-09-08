import React, {useEffect, useState} from 'react';
import {useAuth} from '../../contexts/AuthContext';
import {getClients, getInvoices} from '../../services/firestore';
import {Client, Invoice} from '../../types';
import {AlertCircle, Clock, DollarSign, FileText, TrendingUp, Users} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import {format} from 'date-fns';

const Dashboard: React.FC = () => {
    const {userProfile} = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="space-y-6">
            {/* Welcome, Header */}
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

            {/* Recent Invoices */}
            <div className="bg-white rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
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
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Invoice</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Client</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Due Date</th>
                                </tr>
                                </thead>
                                <tbody>
                                {invoices.slice(0, 5).map((invoice) => (
                                    <tr key={invoice.id} className="border-b border-gray-100">
                                        <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">
                          #{invoice.invoiceNumber}
                        </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {invoice.client.name}
                                        </td>
                                        <td className="py-3 px-4 font-medium">
                                            ₹{invoice.total.toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : invoice.status === 'sent'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : invoice.status === 'overdue'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {format(invoice.dueDate, 'MMM dd, yyyy')}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;