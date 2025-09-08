import React, {useState} from 'react';
import {signIn} from '../../services/auth';
import {Eye, EyeOff, Lock, Mail} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';
import ForgotPasswordForm from './ForgotPasswordForm';

interface LoginFormProps {
    onToggleMode: () => void;
}

/**
 * Enhanced LoginForm Component
 *
 * Handles user authentication with email and password.
 * Includes forgot password functionality and enhanced error handling.
 *
 * @param onToggleMode - Function to switch to signup mode
 */
const LoginForm: React.FC<LoginFormProps> = ({onToggleMode}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    /**
     * Handles form submission for user login
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!email || !password) {
            toast.error('Please fill in all fields');
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
            await signIn(email, password);
            toast.success('Welcome back!');
        } catch (error: any) {
            // Enhanced error handling with user-friendly messages
            let errorMessage = 'Failed to sign in';

            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email address';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection';
                    break;
                default:
                    errorMessage = error.message || 'Failed to sign in';
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles forgot password link click
     */
    const handleForgotPassword = () => {
        setShowForgotPassword(true);
    };

    /**
     * Handles return to login from forgot password
     */
    const handleBackToLogin = () => {
        setShowForgotPassword(false);
    };

    // Show forgot password form if requested
    if (showForgotPassword) {
        return <ForgotPasswordForm onBackToLogin={handleBackToLogin}/>;
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="text-gray-600 mt-2">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your email"
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your password"
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? <LoadingSpinner size="sm" color="text-white"/> : 'Sign In'}
                    </button>
                </form>

                {/* Toggle to Signup */}
                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <button
                            onClick={onToggleMode}
                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                        >
                            Sign up
                        </button>
                    </p>
                </div>

                {/* Security Notice */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                        Your data is protected with enterprise-grade security
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;