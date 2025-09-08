import React, {useEffect, useState} from 'react';
import {changePassword, validatePasswordStrength} from '../../services/auth';
import {AlertCircle, CheckCircle, Eye, EyeOff, Lock, Shield} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

interface ChangePasswordFormProps {
    onClose?: () => void;
    onSuccess?: () => void;
}

/**
 * ChangePasswordForm Component
 *
 * Allows authenticated users to change their password by providing their current password
 * and setting a new one. Includes password strength validation and real-time feedback.
 *
 * @param onClose - Optional callback when form is closed
 * @param onSuccess - Optional callback when password is successfully changed
 */
const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({onClose, onSuccess}) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<{
        isValid: boolean;
        message: string;
        strength: 'weak' | 'medium' | 'strong';
    } | null>(null);

    /**
     * Handles input changes and updates form state
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /**
     * Validates new password strength in real-time
     */
    useEffect(() => {
        if (formData.newPassword) {
            setPasswordStrength(validatePasswordStrength(formData.newPassword));
        } else {
            setPasswordStrength(null);
        }
    }, [formData.newPassword]);

    /**
     * Handles form submission for password change
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields are filled
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        // Validate new password meets minimum requirements
        if (formData.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters long');
            return;
        }

        // Validate password confirmation matches
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        // Prevent using the same password
        if (formData.currentPassword === formData.newPassword) {
            toast.error('New password must be different from your current password');
            return;
        }

        setLoading(true);

        try {
            await changePassword(formData.currentPassword, formData.newPassword);
            toast.success('Password changed successfully!');

            // Reset form
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            // Call success callback if provided
            onSuccess?.();

        } catch (error: any) {
            toast.error(error.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Toggles password visibility for different fields
     */
    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    /**
     * Gets password strength indicator color and text
     */
    const getStrengthColor = (strength: 'weak' | 'medium' | 'strong') => {
        switch (strength) {
            case 'weak':
                return 'text-red-600 bg-red-50';
            case 'medium':
                return 'text-yellow-600 bg-yellow-50';
            case 'strong':
                return 'text-green-600 bg-green-50';
        }
    };

    /**
     * Gets password strength progress bar width
     */
    const getStrengthBarWidth = (strength: 'weak' | 'medium' | 'strong') => {
        switch (strength) {
            case 'weak':
                return '33%';
            case 'medium':
                return '66%';
            case 'strong':
                return '100%';
        }
    };

    /**
     * Gets password strength progress bar color
     */
    const getStrengthBarColor = (strength: 'weak' | 'medium' | 'strong') => {
        switch (strength) {
            case 'weak':
                return 'bg-red-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'strong':
                return 'bg-green-500';
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Shield className="w-8 h-8 text-blue-600"/>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Change Password</h2>
                    <p className="text-gray-600 mt-2">
                        Update your password to keep your account secure
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Current Password */}
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your current password"
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('current')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.current ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your new password"
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.new ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {passwordStrength && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-700">Password Strength</span>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${getStrengthColor(passwordStrength.strength)}`}>
                    {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthBarColor(passwordStrength.strength)}`}
                                        style={{width: getStrengthBarWidth(passwordStrength.strength)}}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                    formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-300'
                                }`}
                                placeholder="Confirm your new password"
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.confirm ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                            </button>
                        </div>

                        {/* Password Match Indicator */}
                        {formData.confirmPassword && (
                            <div className="mt-2 flex items-center">
                                {formData.newPassword === formData.confirmPassword ? (
                                    <div className="flex items-center text-green-600">
                                        <CheckCircle className="w-4 h-4 mr-1"/>
                                        <span className="text-sm">Passwords match</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center text-red-600">
                                        <AlertCircle className="w-4 h-4 mr-1"/>
                                        <span className="text-sm">Passwords do not match</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li>• At least 6 characters long</li>
                            <li>• Mix of uppercase and lowercase letters (recommended)</li>
                            <li>• Include numbers and special characters (recommended)</li>
                            <li>• Different from your current password</li>
                        </ul>
                    </div>

                    {/* Form Actions */}
                    <div className="flex space-x-3">
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? <LoadingSpinner size="sm" color="text-white"/> : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordForm;