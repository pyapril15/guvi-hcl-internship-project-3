import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, deleteUserAccount } from '../../services/firestore';
import { User, Building, Mail, Phone, Globe, Hash, AlertTriangle, Eye, EyeOff, Key } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import ChangePasswordForm from "../auth/ChangePasswordForm.tsx";

const Settings: React.FC = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false); // New state for password change form
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    businessName: userProfile?.businessName || '',
    address: userProfile?.address || '',
    phone: userProfile?.phone || '',
    website: userProfile?.website || '',
    gstin: (userProfile as any)?.gstin || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userProfile?.uid) return;

    setLoading(true);
    try {
      await updateUserProfile(userProfile.uid, formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    if (!userProfile?.uid) return;

    setDeleteLoading(true);
    try {
      await deleteUserAccount(userProfile.uid, password);
      toast.success('Account deleted successfully');
      // The auth context should handle redirecting after logout
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Please try again later');
      } else {
        toast.error('Failed to delete account. Please try again');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetDeleteFlow = () => {
    setShowDeleteConfirm(false);
    setShowPasswordConfirm(false);
    setPassword('');
    setShowPassword(false);
  };

  const handlePasswordChangeSuccess = () => {
    setShowChangePassword(false);
    toast.success('Password changed successfully!');
  };

  const handlePasswordChangeClose = () => {
    setShowChangePassword(false);
  };

  // If showing change password form, render it as modal/overlay
  if (showChangePassword) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="relative">
            <ChangePasswordForm
                onClose={handlePasswordChangeClose}
                onSuccess={handlePasswordChangeSuccess}
            />
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and business information</p>
        </div>

        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Business Information</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your business name"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your phone number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              {/* Tax Info */}
              <div>
                <label htmlFor="gstin" className="block text-sm font-medium text-gray-700 mb-2">
                  GSTIN
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                      type="text"
                      id="gstin"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your GST identification number"
                  />
                </div>
              </div>

              {/* Email (Read Only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                      type="email"
                      id="email"
                      value={userProfile?.email || ''}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      disabled
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Business Address
              </label>
              <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your complete business address"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && <LoadingSpinner size="sm" color="text-white" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Password</h3>
                  <p className="text-sm text-gray-600">
                    Change your account password to keep your account secure
                  </p>
                </div>
              </div>
              <button
                  onClick={() => setShowChangePassword(true)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div className="border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
              <p className="text-sm text-red-600 mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              {!showDeleteConfirm && !showPasswordConfirm && (
                  <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Delete My Account
                  </button>
              )}

              {/* Delete Confirmation Dialog */}
              {showDeleteConfirm && !showPasswordConfirm && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-red-900 mb-2">
                          Are you sure you want to delete your account?
                        </h4>
                        <p className="text-sm text-red-700 mb-4">
                          This will permanently delete:
                        </p>
                        <ul className="text-sm text-red-700 mb-4 ml-4 list-disc">
                          <li>Your profile and business information</li>
                          <li>All your clients</li>
                          <li>All your invoices</li>
                          <li>All associated data</li>
                        </ul>
                        <p className="text-sm text-red-700 font-medium mb-4">
                          This action cannot be undone.
                        </p>
                        <div className="flex space-x-3">
                          <button
                              onClick={() => setShowPasswordConfirm(true)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Yes, Delete My Account
                          </button>
                          <button
                              onClick={resetDeleteFlow}
                              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              )}

              {/* Password Confirmation Dialog */}
              {showPasswordConfirm && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-red-900 mb-2">
                          Enter your password to confirm
                        </h4>
                        <p className="text-sm text-red-700 mb-4">
                          Please enter your current password to permanently delete your account.
                        </p>
                        <div className="mb-4">
                          <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-3 py-2 pr-10 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && handleDeleteAccount()}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button
                              onClick={handleDeleteAccount}
                              disabled={deleteLoading || !password.trim()}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {deleteLoading && <LoadingSpinner size="sm" color="text-white" />}
                            <span>Delete Account</span>
                          </button>
                          <button
                              onClick={resetDeleteFlow}
                              disabled={deleteLoading}
                              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Settings;