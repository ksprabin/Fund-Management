
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { User, Role } from '../types';
import { useData } from './DataContext';

interface AuthContextType {
    user: User | null;
    login: (username: string, password_raw: string, role: Role) => Promise<boolean>;
    logout: () => void;
    updateAuthUser: (updatedUserData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const { users } = useData();

    const login = async (username: string, password_raw: string, role: Role): Promise<boolean> => {
        const allUsers = users; 
        
        const foundUser = allUsers.find(
            u => u.username === username && u.role === role
        );
        
        // This is a mock authentication. In a real app, passwords would be hashed.
        if (foundUser && 'password' in foundUser && foundUser.password === password_raw) {
            const { password, ...userToStore } = foundUser;
            setUser(userToStore);
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    const updateAuthUser = (updatedUserData: Partial<User>) => {
        setUser(prevUser => prevUser ? { ...prevUser, ...updatedUserData } : null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateAuthUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};