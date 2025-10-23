
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import LoginPage from './pages/LoginPage';
import { Role } from './types';

const AppContent: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return <LoginPage />;
    }

    if (user.role === Role.ADMIN) {
        return <AdminDashboard />;
    }

    if (user.role === Role.USER) {
        return <UserDashboard />;
    }

    return <LoginPage />;
};

const App: React.FC = () => {
    return (
        <DataProvider>
            <AuthProvider>
                <div className="min-h-screen text-gray-800 dark:text-gray-200">
                    <AppContent />
                </div>
            </AuthProvider>
        </DataProvider>
    );
};

export default App;
