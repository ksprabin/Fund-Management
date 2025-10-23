import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { User, Transaction, Role } from '../types';

interface DataContextType {
    users: User[];
    transactions: Transaction[];
    addUser: (user: Omit<User, 'id' | 'role'>) => Promise<void>;
    updateUser: (id: string, changes: Partial<User>) => Promise<void>;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
    updateTransaction: (id: string, changes: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (transactionId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialAdmin: User = { 
    id: 'admin-0', 
    username: 'admin', 
    name: 'Administrator', 
    password: 'admin', 
    role: Role.ADMIN 
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Seed initial admin user if not present
    useEffect(() => {
        const seedAdmin = async () => {
            const adminCount = await db.users.where({ role: Role.ADMIN }).count();
            if (adminCount === 0) {
                await db.users.add(initialAdmin);
            }
        };
        seedAdmin();
    }, []);

    const users = useLiveQuery(() => db.users.toArray(), []);
    const transactions = useLiveQuery(() => db.transactions.toArray(), []);

    const addUser = async (user: Omit<User, 'id' | 'role'>) => {
        const newUser: User = {
            ...user,
            id: `user-${Date.now()}`,
            role: Role.USER,
        };
        await db.users.add(newUser);
    };

    const updateUser = async (id: string, changes: Partial<User>) => {
        await db.users.update(id, changes);
    };

    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>) => {
        const newTransaction: Transaction = {
            ...transaction,
            id: `txn-${Date.now()}`,
            date: new Date().toISOString(),
        };
        await db.transactions.add(newTransaction);
    };

    const updateTransaction = async (id: string, changes: Partial<Transaction>) => {
        await db.transactions.update(id, changes);
    };

    const deleteTransaction = async (transactionId: string) => {
        await db.transactions.delete(transactionId);
    };
    
    return (
        <DataContext.Provider value={{ 
            users: users || [], 
            transactions: transactions || [], 
            addUser, 
            updateUser, 
            addTransaction, 
            updateTransaction, 
            deleteTransaction 
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};