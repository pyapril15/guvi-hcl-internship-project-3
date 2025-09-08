import React, {useEffect, useState} from 'react';
import {useAuth} from '../../contexts/AuthContext';
import {deleteClient, getClients} from '../../services/firestore';
import {Client} from '../../types';
import {Edit, Mail, MapPin, Phone, Plus, Trash2} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ClientForm from './ClientForm';
import toast from 'react-hot-toast';

const ClientList: React.FC = () => {
    const {userProfile} = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    useEffect(() => {
        fetchClients();
    }, [userProfile?.uid]);

    const fetchClients = async () => {
        if (!userProfile?.uid) return;

        try {
            const clientsData = await getClients(userProfile.uid);
            console.log(clientsData)
            setClients(clientsData);
        } catch (error) {
            console.error('Error fetching clients:', error);
            toast.error('Failed to load clients');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (clientId: string) => {
        if (!confirm('Are you sure you want to delete this client?')) return;

        try {
            await deleteClient(clientId);
            setClients(clients.filter(client => client.id !== clientId));
            toast.success('Client deleted successfully');
        } catch (error) {
            console.error('Error deleting client:', error);
            toast.error('Failed to delete client');
        }
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingClient(null);
        fetchClients();
    };

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
                    <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                    <p className="text-gray-600 mt-1">Manage your client database</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <Plus className="w-5 h-5"/>
                    <span>Add Client</span>
                </button>
            </div>

            {/* Clients Grid */}
            {clients.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div
                        className="bg-gray-50 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Plus className="w-8 h-8 text-gray-400"/>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
                    <p className="text-gray-600 mb-6">Get started by adding your first client</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Add Your First Client
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map((client) => (
                        <div key={client.id}
                             className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(client)}
                                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit className="w-4 h-4"/>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(client.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-start space-x-2">
                                        <Mail className="w-4 h-4 text-gray-400 mt-0.5"/>
                                        <span className="text-sm text-gray-600">{client.email}</span>
                                    </div>

                                    {client.phone && (
                                        <div className="flex items-center space-x-2">
                                            <Phone className="w-4 h-4 text-gray-400"/>
                                            <span className="text-sm text-gray-600">{client.phone}</span>
                                        </div>
                                    )}

                                    <div className="flex items-start space-x-2">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5"/>
                                        <span className="text-sm text-gray-600">{client.address}</span>
                                    </div>

                                    {client.gstin && (
                                        <div className="bg-gray-50 p-2 rounded">
                                            <span className="text-xs font-medium text-gray-500">GSTIN</span>
                                            <p className="text-sm font-mono text-gray-700">{client.gstin}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Client Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <ClientForm
                            client={editingClient}
                            onSuccess={handleFormSuccess}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingClient(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientList;