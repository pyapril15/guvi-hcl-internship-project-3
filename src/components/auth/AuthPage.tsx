import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import {Shield, Zap, TrendingUp, Users } from 'lucide-react';

/**
 * AuthPage Component
 *
 * Main authentication page that handles switching between login and signup modes.
 * Features a responsive layout with branding on the left and auth forms on the right.
 * Includes enhanced security messaging and feature highlights.
 */
const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Enhanced Branding */}
          <div className="hidden lg:block">
            <div className="text-center lg:text-left">
              {/* Logo and Brand Name */}
              <div className="flex items-center justify-center lg:justify-start mb-8">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <img
                      src="/favicon.ico"
                      alt="Logo"
                      className="w-6 h-6"
                  />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 ml-3">
                  Invoice Generator
                </h1>
              </div>

              {/* Main Heading */}
              <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Professional Invoice Generation Made Simple
              </h2>

              {/* Subheading */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create, manage, and send professional invoices in minutes.
                Perfect for freelancers and small businesses who want to get paid faster.
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Quick Setup Feature */}
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Quick Setup</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Get started in under 2 minutes with our streamlined onboarding process</p>
                </div>

                {/* Get Paid Faster Feature */}
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
                  <div className="flex items-center mb-3">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Get Paid Faster</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Professional invoices lead to 40% faster payments on average</p>
                </div>

                {/* Track Everything Feature */}
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
                  <div className="flex items-center mb-3">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Client Management</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Keep track of all your clients and their payment history in one place</p>
                </div>

                {/* Secure & Private Feature */}
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
                  <div className="flex items-center mb-3">
                    <div className="bg-orange-100 p-2 rounded-lg mr-3">
                      <Shield className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Secure & Private</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Bank-level security with end-to-end encryption for all your data</p>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-center lg:justify-start space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">10K+</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">$2M+</div>
                    <div className="text-sm text-gray-600">Invoiced</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">99.9%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Forms */}
          <div className="flex justify-center">
            {isLogin ? (
                <LoginForm onToggleMode={() => setIsLogin(false)} />
            ) : (
                <SignupForm onToggleMode={() => setIsLogin(true)} />
            )}
          </div>
        </div>

        {/* Mobile Branding - Shown only on small screens */}
        <div className="lg:hidden absolute top-4 left-4">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg">
              <img
                  src="/favicon.ico"
                  alt="Logo"
                  className="w-6 h-6"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900 ml-2">
              Invoice Generator
            </h1>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <p className="text-xs text-gray-500 text-center">
            © 2025 Invoice Generator. All rights reserved. |
            <span className="ml-1">Trusted by professionals worldwide</span>
          </p>
        </div>
      </div>
  );
};

export default AuthPage;