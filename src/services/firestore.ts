import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore';
import {deleteUser, EmailAuthProvider, getAuth, reauthenticateWithCredential} from 'firebase/auth';
import {db} from '../config/firebase';
import {Client, Invoice, User} from '../types';

/**
 * Updates user profile information in Firestore
 * @param userId - The user's unique identifier
 * @param data - Partial user data to update
 * @returns Promise<void>
 */
export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
    try {
        await updateDoc(doc(db, 'users', userId), {
            ...data,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw new Error('Failed to update user profile');
    }
};

/**
 * Gets user profile information from Firestore
 * @param userId - The user's unique identifier
 * @returns Promise<User | null> - User data or null if not found
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                uid: docSnap.id,
                ...docSnap.data(),
                createdAt: docSnap.data().createdAt?.toDate(),
                updatedAt: docSnap.data().updatedAt?.toDate(),
            } as User;
        }

        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw new Error('Failed to get user profile');
    }
};

/**
 * Deletes user account completely including all associated data
 * This is a sensitive operation that requires re-authentication
 *
 * @param userId - The user's unique identifier
 * @param password - User's current password for re-authentication
 * @returns Promise<void>
 * @throws Error if authentication fails or deletion encounters issues
 */
export const deleteUserAccount = async (userId: string, password: string): Promise<void> => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || user.uid !== userId) {
        throw new Error('User not authenticated or user ID mismatch');
    }

    try {
        // Re-authenticate user with password for security
        if (!user.email) {
            throw new Error('User email not found');
        }

        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);

        // Create batch for atomic deletion of all user data
        const batch = writeBatch(db);

        // Delete all user's clients
        const clientsQuery = query(
            collection(db, 'clients'),
            where('userId', '==', userId)
        );
        const clientsSnapshot = await getDocs(clientsQuery);

        console.log(`Deleting ${clientsSnapshot.docs.length} client records...`);
        clientsSnapshot.docs.forEach((clientDoc) => {
            batch.delete(clientDoc.ref);
        });

        // Delete all user's invoices
        const invoicesQuery = query(
            collection(db, 'invoices'),
            where('userId', '==', userId)
        );
        const invoicesSnapshot = await getDocs(invoicesQuery);

        console.log(`Deleting ${invoicesSnapshot.docs.length} invoice records...`);
        invoicesSnapshot.docs.forEach((invoiceDoc) => {
            batch.delete(invoiceDoc.ref);
        });

        // Delete user profile document
        batch.delete(doc(db, 'users', userId));

        // Commit all deletions atomically
        await batch.commit();
        console.log('All user data deleted from Firestore');

        // Finally, delete the user from Firebase Auth
        await deleteUser(user);
        console.log('User deleted from Firebase Auth');

    } catch (error: never) {
        console.error('Error deleting user account:', error);

        // Handle specific error cases with user-friendly messages
        switch (error.code) {
            case 'auth/wrong-password':
                throw new Error('Incorrect password provided');
            case 'auth/too-many-requests':
                throw new Error('Too many failed attempts. Please try again later');
            case 'auth/requires-recent-login':
                throw new Error('Please log out and log back in before deleting your account');
            case 'auth/network-request-failed':
                throw new Error('Network error. Please check your internet connection and try again');
            default:
                throw new Error(error.message || 'Failed to delete account. Please try again');
        }
    }
};

// ==================== CLIENT OPERATIONS ====================

/**
 * Creates a new client for the specified user
 * @param userId - The user's unique identifier
 * @param clientData - Client information excluding auto-generated fields
 * @returns Promise<string> - The created client's document ID
 */
export const createClient = async (userId: string, clientData: Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, 'clients'), {
            ...clientData,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating client:', error);
        throw new Error('Failed to create client');
    }
};

/**
 * Retrieves all clients for a specific user
 * @param userId - The user's unique identifier
 * @returns Promise<Client[]> - Array of client objects
 */
export const getClients = async (userId: string): Promise<Client[]> => {
    try {
        const q = query(
            collection(db, 'clients'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
        })) as Client[];
    } catch (error) {
        console.error('Error getting clients:', error);
        throw new Error('Failed to retrieve clients');
    }
};

/**
 * Updates an existing client's information
 * @param clientId - The client's unique identifier
 * @param data - Partial client data to update
 * @returns Promise<void>
 */
export const updateClient = async (clientId: string, data: Partial<Client>): Promise<void> => {
    try {
        await updateDoc(doc(db, 'clients', clientId), {
            ...data,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating client:', error);
        throw new Error('Failed to update client');
    }
};

/**
 * Deletes a client from the database
 * @param clientId - The client's unique identifier
 * @returns Promise<void>
 */
export const deleteClient = async (clientId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'clients', clientId));
    } catch (error) {
        console.error('Error deleting client:', error);
        throw new Error('Failed to delete client');
    }
};

// ==================== INVOICE OPERATIONS ====================

/**
 * Creates a new invoice for the specified user
 * @param userId - The user's unique identifier
 * @param invoiceData - Invoice information excluding auto-generated fields
 * @returns Promise<string> - The created invoice's document ID
 */
export const createInvoice = async (userId: string, invoiceData: Omit<Invoice, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, 'invoices'), {
            ...invoiceData,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            issueDate: new Date(invoiceData.issueDate),
            dueDate: new Date(invoiceData.dueDate),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating invoice:', error);
        throw new Error('Failed to create invoice');
    }
};

/**
 * Retrieves all invoices for a specific user
 * @param userId - The user's unique identifier
 * @returns Promise<Invoice[]> - Array of invoice objects
 */
export const getInvoices = async (userId: string): Promise<Invoice[]> => {
    try {
        const q = query(
            collection(db, 'invoices'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
            issueDate: doc.data().issueDate?.toDate(),
            dueDate: doc.data().dueDate?.toDate(),
        })) as Invoice[];
    } catch (error) {
        console.error('Error getting invoices:', error);
        throw new Error('Failed to retrieve invoices');
    }
};

/**
 * Updates an existing invoice's information
 * @param invoiceId - The invoice's unique identifier
 * @param data - Partial invoice data to update
 * @returns Promise<void>
 */
export const updateInvoice = async (invoiceId: string, data: Partial<Invoice>): Promise<void> => {
    try {
        const updateData: never = {
            ...data,
            updatedAt: serverTimestamp(),
        };

        // Handle date fields properly
        if (data.issueDate) {
            updateData.issueDate = new Date(data.issueDate);
        }
        if (data.dueDate) {
            updateData.dueDate = new Date(data.dueDate);
        }

        await updateDoc(doc(db, 'invoices', invoiceId), updateData);
    } catch (error) {
        console.error('Error updating invoice:', error);
        throw new Error('Failed to update invoice');
    }
};

/**
 * Deletes an invoice from the database
 * @param invoiceId - The invoice's unique identifier
 * @returns Promise<void>
 */
export const deleteInvoice = async (invoiceId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'invoices', invoiceId));
    } catch (error) {
        console.error('Error deleting invoice:', error);
        throw new Error('Failed to delete invoice');
    }
};

/**
 * Retrieves a specific invoice by ID
 * @param invoiceId - The invoice's unique identifier
 * @returns Promise<Invoice | null> - Invoice object or null if not found
 */
export const getInvoice = async (invoiceId: string): Promise<Invoice | null> => {
    try {
        const docRef = doc(db, 'invoices', invoiceId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
                createdAt: docSnap.data().createdAt?.toDate(),
                updatedAt: docSnap.data().updatedAt?.toDate(),
                issueDate: docSnap.data().issueDate?.toDate(),
                dueDate: docSnap.data().dueDate?.toDate(),
            } as Invoice;
        }

        return null;
    } catch (error) {
        console.error('Error getting invoice:', error);
        throw new Error('Failed to retrieve invoice');
    }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Gets user statistics including client and invoice counts
 * @param userId - The user's unique identifier
 * @returns Promise<{clientCount: number, invoiceCount: number, totalInvoiced: number}>
 */
export const getUserStats = async (userId: string): Promise<{
    clientCount: number;
    invoiceCount: number;
    totalInvoiced: number;
    paidInvoices: number;
    pendingInvoices: number;
}> => {
    try {
        // Get client count
        const clientsQuery = query(
            collection(db, 'clients'),
            where('userId', '==', userId)
        );
        const clientsSnapshot = await getDocs(clientsQuery);
        const clientCount = clientsSnapshot.size;

        // Get invoices and calculate stats
        const invoicesQuery = query(
            collection(db, 'invoices'),
            where('userId', '==', userId)
        );
        const invoicesSnapshot = await getDocs(invoicesQuery);
        const invoices = invoicesSnapshot.docs.map(doc => doc.data()) as Invoice[];

        const invoiceCount = invoices.length;
        const totalInvoiced = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
        const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;
        const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending').length;

        return {
            clientCount,
            invoiceCount,
            totalInvoiced,
            paidInvoices,
            pendingInvoices,
        };
    } catch (error) {
        console.error('Error getting user stats:', error);
        throw new Error('Failed to retrieve user statistics');
    }
};