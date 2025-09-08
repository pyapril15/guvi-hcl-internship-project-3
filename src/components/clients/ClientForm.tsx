import React, {useState} from 'react';
import {useAuth} from '../../contexts/AuthContext';
import {createClient, updateClient} from '../../services/firestore';
import {Client} from '../../types';
import {X} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

interface ClientFormProps {
    client?: Client | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({client, onSuccess, onCancel}) => {
    const {userProfile} = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: client?.name || '',
        email: client?.email || '',
        phone: client?.phone || '',
        address: client?.address || '',
        gstin: client?.gstin || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.address) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!userProfile?.uid) return;

        setLoading(true);
        try {
            if (client) {
                await updateClient(client.id, formData);
                toast.success('Client updated successfully');
            } else {
                await createClient(userProfile.uid, formData);
                toast.success('Client added successfully');
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving client:', error);
            toast.error('Failed to save client');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                    {client ? 'Edit Client' : 'Add New Client'}
                </h2>
                <button
                    onClick={onCancel}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5"/>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Client Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter client name"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email address"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                    />
                </div>

                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                    </label>
                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full address"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="gstin" className="block text-sm font-medium text-gray-700 mb-2">
                        GSTIN
                    </label>
                    <input
                        type="text"
                        id="gstin"
                        name="gstin"
                        value={formData.gstin}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter GSTIN (if applicable)"
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {loading && <LoadingSpinner size="sm" color="text-white"/>}
                        <span>{client ? 'Update Client' : 'Add Client'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClientForm;