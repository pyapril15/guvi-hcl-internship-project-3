import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createInvoice, getClients } from '../../services/firestore';
import { Client, InvoiceItem } from '../../types';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const CreateInvoice: React.FC = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const clientIdFromUrl = searchParams.get('clientId');
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        invoiceNumber: `INV-${Date.now()}`,
        clientId: clientIdFromUrl || '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        taxRate: 18,
        notes: '',
        status: 'draft' as const
    });
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
    ]);

    useEffect(() => {
        fetchClients();
    }, [userProfile?.uid]);

    useEffect(() => {
        if (clientIdFromUrl) {
            setFormData(prev => ({ ...prev, clientId: clientIdFromUrl }));
        }
    }, [clientIdFromUrl]);

    const fetchClients = async () => {
        if (!userProfile?.uid) return;

        try {
            const clientsData = await getClients(userProfile.uid);
            setClients(clientsData);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        if (field === 'quantity' || field === 'rate') {
            updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
        }

        setItems(updatedItems);
    };

    const addItem = () => {
        setItems([...items, {
            id: Date.now().toString(),
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0
        }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const taxAmount = (subtotal * formData.taxRate) / 100;
        const total = subtotal + taxAmount;
        return { subtotal, taxAmount, total };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.clientId) {
            toast.error('Please select a client');
            return;
        }

        if (items.some(item => !item.description || item.quantity <= 0 || item.rate <= 0)) {
            toast.error('Please fill in all item details');
            return;
        }

        if (!userProfile?.uid) return;

        setLoading(true);
        try {
            const selectedClient = clients.find(c => c.id === formData.clientId);
            if (!selectedClient) {
                throw new Error('Selected client not found');
            }

            const { subtotal, taxAmount, total } = calculateTotals();

            const invoiceData = {
                invoiceNumber: formData.invoiceNumber,
                clientId: formData.clientId,
                client: selectedClient,
                items,
                subtotal,
                taxRate: formData.taxRate,
                taxAmount,
                total,
                status: formData.status,
                issueDate: new Date(formData.issueDate),
                dueDate: new Date(formData.dueDate),
                notes: formData.notes
            };

            await createInvoice(userProfile.uid, invoiceData);
            toast.success('Invoice created successfully');

            // Navigate back to filtered invoices if came from client page
            if (clientIdFromUrl) {
                navigate(`/invoices?clientId=${clientIdFromUrl}`);
            } else {
                navigate('/invoices');
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
            toast.error('Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (clientIdFromUrl) {
            navigate(`/invoices?clientId=${clientIdFromUrl}`);
        } else {
            navigate('/invoices');
        }
    };

    const { subtotal, taxAmount, total } = calculateTotals();
    const selectedClient = clients.find(c => c.id === formData.clientId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={handleCancel}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {clientIdFromUrl ? `Create Invoice for ${selectedClient?.name || 'Client'}` : 'Create New Invoice'}
                    </h1>
                    <p className="text-gray-600 mt-1">Fill in the details to create a new invoice</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Invoice Details */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                Invoice Number
                            </label>
                            <input
                                type="text"
                                id="invoiceNumber"
                                name="invoiceNumber"
                                value={formData.invoiceNumber}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-2">
                                Issue Date
                            </label>
                            <input
                                type="date"
                                id="issueDate"
                                name="issueDate"
                                value={formData.issueDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                                Due Date
                            </label>
                            <input
                                type="date"
                                id="dueDate"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Client Selection */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
                    <div>
                        <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                            Select Client {clientIdFromUrl && <span className="text-blue-600">(Pre-selected)</span>}
                        </label>
                        <select
                            id="clientId"
                            name="clientId"
                            value={formData.clientId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            disabled={!!clientIdFromUrl}
                        >
                            <option value="">Choose a client...</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name} - {client.email}
                                </option>
                            ))}
                        </select>
                        {clientIdFromUrl && selectedClient && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    Creating invoice for: <strong>{selectedClient.name}</strong> ({selectedClient.email})
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Items</h2>
                        <button
                            type="button"
                            onClick={addItem}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Item</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                                <div className="col-span-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Item description"
                                        required
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rate (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={item.rate}
                                        onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount (₹)
                                    </label>
                                    <input
                                        type="text"
                                        value={item.amount.toFixed(2)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                        readOnly
                                    />
                                </div>

                                <div className="col-span-1">
                                    {items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals & Settings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tax Settings */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax & Notes</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tax Rate (%)
                                </label>
                                <input
                                    type="number"
                                    id="taxRate"
                                    name="taxRate"
                                    value={formData.taxRate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                />
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Additional notes or terms..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
                                <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-3">
                                <div className="flex justify-between">
                                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                                    <span className="text-lg font-bold text-blue-600">₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {loading && <LoadingSpinner size="sm" color="text-white" />}
                        <span>Create Invoice</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateInvoice;