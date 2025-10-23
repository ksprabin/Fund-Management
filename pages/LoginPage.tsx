
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const LoginPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Role>(Role.USER);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        const success = await login(username, password, activeTab);
        if (!success) {
            setError('Invalid username or password. Please try again.');
        }
        setIsLoading(false);
    };

    const tabButtonClasses = (tab: Role) => 
        `w-full py-2.5 text-sm font-medium leading-5 rounded-lg focus:outline-none transition-colors duration-200 ${
            activeTab === tab 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-blue-700 hover:bg-white/[0.12] hover:text-white dark:text-blue-100 dark:hover:bg-gray-700'
        }`;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <div className="w-full max-w-md px-4">
                <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">Transaction Portal</h1>
                <Card>
                    <div className="w-full">
                        <div className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
                            <button onClick={() => setActiveTab(Role.USER)} className={tabButtonClasses(Role.USER)}>User</button>
                            <button onClick={() => setActiveTab(Role.ADMIN)} className={tabButtonClasses(Role.ADMIN)}>Admin</button>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-6">
                            <h2 className="text-xl font-semibold text-center text-gray-700 dark:text-gray-200">{activeTab === Role.ADMIN ? 'Admin' : 'User'} Login</h2>
                            {error && <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">{error}</div>}
                            <Input id="username" label="Username" type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Enter your username" />
                            <Input id="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
