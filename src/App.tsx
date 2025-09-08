import React from 'react';
import {Toaster} from 'react-hot-toast';
import {AuthProvider, useAuth} from './contexts/AuthContext';
import AuthPage from './components/auth/AuthPage';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

const AppContent: React.FC = () => {
    const {currentUser, loading} = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg"/>
            </div>
        );
    }

    return currentUser ? <Layout/> : <AuthPage/>;
};

function App() {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-gray-50">
                <AppContent/>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: '#4ade80',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            duration: 4000,
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </div>
        </AuthProvider>
    );
}

export default App;