import React, {useState} from 'react';
import {sendPasswordReset} from '../../services/auth';
import {ArrowLeft, CheckCircle, Mail} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

interface ForgotPasswordFormProps {
    onBackToLogin: () => void;
}

/**
 * ForgotPasswordForm Component
 *
 * Handles the forgot password functionality by allowing users to enter their email
 * and receive a password reset link. Provides clear feedback and error handling.
 *
 * @param onBackToLogin - Callback function to return to login form
 */
const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({onBackToLogin}) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    /**
     * Handles form submission for password reset
     * Validates email and sends reset link
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic email validation
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            await sendPasswordReset(email);
            setEmailSent(true);
            toast.success('Password reset email sent successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to send password reset email');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles sending another reset email
     */
    const handleResendEmail = async () => {
        setLoading(true);
        try {
            await sendPasswordReset(email);
            toast.success('Password reset email sent again!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to resend email');
        } finally {
            setLoading(false);
        }
    };

    // Show success state after email is sent
    if (emailSent) {
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="mb-6">
                        <div
                            className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600"/>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                        <p className="text-gray-600">
                            We've sent a password reset link to
                        </p>
                        <p className="text-blue-600 font-medium mt-1">{email}</p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            <strong>Next steps:</strong>
                        </p>
                        <ol className="text-sm text-blue-700 mt-2 text-left space-y-1">
                            <li>1. Check your email inbox (and spam folder)</li>
                            <li>2. Click the password reset link</li>
                            <li>3. Enter your new password</li>
                            <li>4. Sign in with your new password</li>
                        </ol>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleResendEmail}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? <LoadingSpinner size="sm" color="text-white"/> : 'Resend Email'}
                        </button>

                        <button
                            onClick={onBackToLogin}
                            className="w-full text-gray-600 hover:text-gray-800 py-2 font-medium transition-colors duration-200"
                        >
                            Back to Sign In
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
                    <p className="text-gray-600 mt-2">
                        Don't worry! Enter your email and we'll send you a reset link.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                            <input
                                type="email"
                                id="reset-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your email address"
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? <LoadingSpinner size="sm" color="text-white"/> : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-6">
                    <button
                        onClick={onBackToLogin}
                        className="w-full flex items-center justify-center text-gray-600 hover:text-gray-800 py-2 font-medium transition-colors duration-200"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2"/>
                        Back to Sign In
                    </button>
                </div>

                {/* Help text */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Remember your password?{' '}
                        <button
                            onClick={onBackToLogin}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Sign in instead
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;