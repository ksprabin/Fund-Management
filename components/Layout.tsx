
import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import { LogoutIcon } from './icons';

interface LayoutProps {
    title: string;
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, children }) => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-md">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h1>
                    <div className="flex items-center space-x-4">
                         <span className="text-gray-600 dark:text-gray-300">
                            Welcome, <span className="font-semibold">{user?.name}</span>
                         </span>
                        <Button onClick={logout} variant="secondary" size="sm">
                            <LogoutIcon className="w-5 h-5 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;