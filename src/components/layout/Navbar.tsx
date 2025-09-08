import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const { userProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg">
              <img
                  src="/favicon.ico"
                  alt="Logo"
                  className="w-6 h-6"
              />
            </div>

            <h1 className="ml-3 text-xl font-bold text-gray-900">
              Invoice Generator
            </h1>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 p-2 rounded-full">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {userProfile?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;