import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { CurrencyRupeeIcon, PencilIcon } from '../components/icons';
import Modal from '../components/Modal';
import { User } from '../types';

const EditProfileForm: React.FC<{onClose: () => void}> = ({onClose}) => {
    const { user, updateAuthUser } = useAuth();
    const { updateUser } = useData();
    const [name, setName] = useState(user?.name || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(user && user.name !== name) {
            await updateUser(user.id, { name });
            updateAuthUser({ name });
            onClose();
        } else {
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="edit-name" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
    );
}


const UserDashboard: React.FC = () => {
    const { user } = useAuth();
    const { transactions } = useData();

    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterDescription, setFilterDescription] = useState('');
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);

    const userTransactions = useMemo(() => {
        if (!user) return [];
        return transactions.filter(txn => {
                if (txn.userId !== user.id) return false;

                if (filterStartDate) {
                    const startDate = new Date(filterStartDate);
                    startDate.setHours(0, 0, 0, 0);
                    if (new Date(txn.date) < startDate) return false;
                }
                
                if (filterEndDate) {
                    const endDate = new Date(filterEndDate);
                    endDate.setHours(23, 59, 59, 999);
                    if (new Date(txn.date) > endDate) return false;
                }

                if (filterType === 'credit' && txn.amount < 0) return false;
                if (filterType === 'debit' && txn.amount >= 0) return false;

                if (filterDescription && !txn.description.toLowerCase().includes(filterDescription.toLowerCase())) return false;
                
                return true;
            })
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [user, transactions, filterStartDate, filterEndDate, filterType, filterDescription]);

    const balance = useMemo(() => {
        if (!user) return 0;
        return transactions
            .filter(txn => txn.userId === user.id)
            .reduce((acc, txn) => acc + txn.amount, 0);
    }, [user, transactions]);

    const filteredBalance = useMemo(() => {
        return userTransactions.reduce((acc, txn) => acc + txn.amount, 0);
    }, [userTransactions]);

    const clearFilters = () => {
        setFilterStartDate('');
        setFilterEndDate('');
        setFilterType('all');
        setFilterDescription('');
    };

    return (
        <Layout title="Your Dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <Card 
                        title="My Profile" 
                        actions={
                            <Button size="sm" variant="secondary" onClick={() => setProfileModalOpen(true)}>
                                <PencilIcon className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        }
                    >
                        <div className="space-y-2">
                             <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{user?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">@{user?.username}</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Balance</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{balance.toFixed(2)}</p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
                                <CurrencyRupeeIcon className="w-8 h-8 text-green-600 dark:text-green-300"/>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Card title="Transaction History">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
                            <h4 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-200">Filter Transactions</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <Input id="user-start-date-filter" label="Start Date" type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                                <Input id="user-end-date-filter" label="End Date" type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                                <div>
                                    <label htmlFor="user-type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                    <select id="user-type-filter" value={filterType} onChange={(e) => setFilterType(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                                        <option value="all">All Types</option>
                                        <option value="credit">Credit</option>
                                        <option value="debit">Debit</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <Input id="user-desc-filter" label="Description" value={filterDescription} onChange={(e) => setFilterDescription(e.target.value)} placeholder="Search description..." />
                                </div>
                                <div className="flex items-end">
                                    <Button onClick={clearFilters} variant="secondary" className="w-full">Clear Filters</Button>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 px-1 text-sm text-gray-600 dark:text-gray-400">
                            Showing <span className="font-bold text-gray-800 dark:text-gray-200">{userTransactions.length}</span> transactions with a total of <span className={`font-bold ${filteredBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>₹{filteredBalance.toFixed(2)}</span>.
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Description</th>
                                        <th scope="col" className="px-6 py-3">Amount</th>
                                        <th scope="col" className="px-6 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userTransactions.length > 0 ? userTransactions.map(txn => (
                                        <tr key={txn.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{txn.description}</td>
                                            <td className={`px-6 py-4 font-semibold ${txn.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {txn.amount >= 0 ? '+' : '-'}₹{Math.abs(txn.amount).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">{new Date(txn.date).toLocaleString()}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="text-center py-6 text-gray-500 dark:text-gray-400">No transactions match your filters.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
            
            <Modal isOpen={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} title="Edit Profile">
                <EditProfileForm onClose={() => setProfileModalOpen(false)} />
            </Modal>
        </Layout>
    );
};

export default UserDashboard;