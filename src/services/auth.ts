import {
    createUserWithEmailAndPassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    updatePassword,
    updateProfile,
    User as FirebaseUser
} from 'firebase/auth';
import {doc, setDoc} from 'firebase/firestore';
import {auth, db} from '../config/firebase';
import {User} from '../types';

/**
 * Creates a new user account with email and password
 * @param email - User's email address
 * @param password - User's password
 * @param displayName - User's display name
 * @returns Promise<UserCredential> - Firebase user credential
 */
export const signUp = async (email: string, password: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Update the user's display name in Firebase Auth
    await updateProfile(result.user, {
        displayName: displayName
    });

    // Create user document in Firestore
    const userData: Omit<User, 'uid'> = {
        email,
        displayName,
        businessName: '',
        address: '',
        phone: '',
        website: '',
    };

    await setDoc(doc(db, 'users', result.user.uid), userData);

    return result;
};

/**
 * Signs in a user with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise<UserCredential> - Firebase user credential
 */
export const signIn = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

/**
 * Sends a password reset email to the specified email address
 * @param email - Email address to send reset link to
 * @returns Promise<void>
 * @throws Error if email is not found or invalid
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
    try {
        await sendPasswordResetEmail(auth, email, {
            // Custom action code settings for better UX
            url: window.location.origin, // Redirect back to app after reset
            handleCodeInApp: false
        });
    } catch (error: never) {
        // Enhanced error handling with user-friendly messages
        switch (error.code) {
            case 'auth/user-not-found':
                throw new Error('No account found with this email address');
            case 'auth/invalid-email':
                throw new Error('Invalid email address');
            case 'auth/too-many-requests':
                throw new Error('Too many reset attempts. Please try again later');
            default:
                throw new Error('Failed to send password reset email. Please try again');
        }
    }
};

/**
 * Changes the current user's password after re-authentication
 * @param currentPassword - User's current password for verification
 * @param newPassword - New password to set
 * @returns Promise<void>
 * @throws Error if current password is incorrect or new password is invalid
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    const user = auth.currentUser;

    if (!user || !user.email) {
        throw new Error('No authenticated user found');
    }

    try {
        // Re-authenticate user with current password before allowing password change
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update to new password
        await updatePassword(user, newPassword);

    } catch (error: never) {
        // Enhanced error handling for password change
        switch (error.code) {
            case 'auth/wrong-password':
                throw new Error('Current password is incorrect');
            case 'auth/weak-password':
                throw new Error('New password is too weak. Please choose a stronger password');
            case 'auth/requires-recent-login':
                throw new Error('Please sign out and sign back in before changing your password');
            case 'auth/too-many-requests':
                throw new Error('Too many failed attempts. Please try again later');
            default:
                throw new Error('Failed to change password. Please try again');
        }
    }
};

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Object with validation result and message
 */
export const validatePasswordStrength = (password: string): {
    isValid: boolean;
    message: string;
    strength: 'weak' | 'medium' | 'strong'
} => {
    if (password.length < 6) {
        return {isValid: false, message: 'Password must be at least 6 characters long', strength: 'weak'};
    }

    if (password.length < 8) {
        return {isValid: true, message: 'Password strength: Weak', strength: 'weak'};
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);

    const score = [hasLowerCase, hasUpperCase, hasNumbers, hasNonalphas].filter(Boolean).length;

    if (score < 2) {
        return {isValid: true, message: 'Password strength: Weak', strength: 'weak'};
    } else if (score < 4) {
        return {isValid: true, message: 'Password strength: Medium', strength: 'medium'};
    } else {
        return {isValid: true, message: 'Password strength: Strong', strength: 'strong'};
    }
};

/**
 * Checks if user needs to re-authenticate based on last sign-in time
 * @param user - Firebase user object
 * @returns boolean indicating if re-authentication is needed
 */
export const shouldReauthenticate = (user: FirebaseUser | null): boolean => {
    if (!user || !user.metadata.lastSignInTime) {
        return true;
    }

    const lastSignIn = new Date(user.metadata.lastSignInTime);
    const now = new Date();
    const timeDiff = now.getTime() - lastSignIn.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    // Require re-authentication if last sign-in was more than 5 minutes ago for sensitive operations
    return hoursDiff > 0.083; // 5 minutes = 0.083 hours
};