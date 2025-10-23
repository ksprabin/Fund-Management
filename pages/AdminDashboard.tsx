import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import { User, Role, Transaction } from '../types';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { UserPlusIcon, CurrencyRupeeIcon, UsersIcon, PencilIcon, TrashIcon, DocumentArrowDownIcon } from '../components/icons';

const AddUserForm: React.FC<{onClose: () => void}> = ({onClose}) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { addUser, users } = useData();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (users.some(u => u.username === username)) {
            alert('Username already exists.');
            return;
        }
        await addUser({ name, username, password });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="new-name" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input id="new-username" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <Input id="new-password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">Add User</Button>
            </div>
        </form>
    );
}

const EditUserForm: React.FC<{ user: User, onClose: () => void }> = ({ user, onClose }) => {
    const { updateUser, users } = useData();
    const [name, setName] = useState(user.name);
    const [username, setUsername] = useState(user.username);
    const [password, setPassword] = useState('');
    const [editedUserData, setEditedUserData] = useState<Partial<User>>({});
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const changes: Partial<User> = {};
        if (name !== user.name) changes.name = name;
        if (username !== user.username) changes.username = username;
        if (password) changes.password = password;

        if (Object.keys(changes).length === 0) {
            onClose();
            return;
        }
        
        if (changes.username && users.some(u => u.username === changes.username && u.id !== user.id)) {
            alert('Username already exists.');
            return;
        }

        setEditedUserData(changes);
        setConfirmModalOpen(true);
    };

    const handleConfirmEdit = async () => {
        await updateUser(user.id, editedUserData);
        setConfirmModalOpen(false);
        onClose();
    };
    
    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="edit-name" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input id="edit-username" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <Input id="edit-password" label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep unchanged" />
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>

            <Modal isOpen={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)} title="Confirm User Changes">
                 <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Please confirm the changes for user <span className="font-semibold">@{user.username}</span>.</p>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4 text-sm space-y-2">
                        {editedUserData.name && <p><span className="font-semibold">Name:</span> "{user.name}" → "{editedUserData.name}"</p>}
                        {editedUserData.username && <p><span className="font-semibold text-orange-500">Username:</span> "{user.username}" → "{editedUserData.username}"</p>}
                        {editedUserData.password && <p className="font-semibold text-red-500">Password will be reset.</p>}
                    </div>
                     {(editedUserData.username || editedUserData.password) && (
                        <p className="text-red-500 dark:text-red-400 font-semibold text-sm mb-4">Warning: Changing the username or password will affect how the user logs in.</p>
                     )}
                    <div className="flex justify-end space-x-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setConfirmModalOpen(false)}>Cancel</Button>
                        <Button type="button" variant="danger" onClick={handleConfirmEdit}>Confirm Changes</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};


const AddTransactionForm: React.FC<{user: User, onClose: () => void}> = ({user, onClose}) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('credit');
    const { addTransaction } = useData();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalAmount = type === 'credit' ? parseFloat(amount) : -parseFloat(amount);
        await addTransaction({ userId: user.id, description, amount: finalAmount });
        onClose();
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="txn-desc" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
             <div>
                <label htmlFor="txn-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select 
                    id="txn-type" 
                    value={type} 
                    onChange={(e) => setType(e.target.value)} 
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                >
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                </select>
            </div>
            <Input id="txn-amount" label="Amount" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />
             <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">Add Transaction</Button>
            </div>
        </form>
    );
}

const EditTransactionForm: React.FC<{transaction: Transaction, onClose: () => void}> = ({transaction, onClose}) => {
    const [description, setDescription] = useState(transaction.description);
    const [amount, setAmount] = useState(Math.abs(transaction.amount).toString());
    const [type, setType] = useState(transaction.amount >= 0 ? 'credit' : 'debit');
    const { updateTransaction } = useData();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalAmount = type === 'credit' ? parseFloat(amount) : -parseFloat(amount);
        await updateTransaction(transaction.id, { description, amount: finalAmount });
        onClose();
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="edit-txn-desc" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
             <div>
                <label htmlFor="edit-txn-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select 
                    id="edit-txn-type" 
                    value={type} 
                    onChange={(e) => setType(e.target.value)} 
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                >
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                </select>
            </div>
            <Input id="edit-txn-amount" label="Amount" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
    );
}


const AdminDashboard: React.FC = () => {
    const { users, transactions, deleteTransaction, deleteUser } = useData();
    const [isUserModalOpen, setUserModalOpen] = useState(false);
    const [isTxnModalOpen, setTxnModalOpen] = useState(false);
    const [selectedUserForTxn, setSelectedUserForTxn] = useState<User | null>(null);
    
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditUserModalOpen, setEditUserModalOpen] = useState(false);
    
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isEditTxnModalOpen, setEditTxnModalOpen] = useState(false);
    
    const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [isDeleteUserModalOpen, setDeleteUserModalOpen] = useState(false);

    const [filterUser, setFilterUser] = useState('all');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterDescription, setFilterDescription] = useState('');
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const normalUsers = useMemo(() => users.filter(u => 
        u.role === Role.USER && 
        u.username.toLowerCase().includes(userSearchQuery.toLowerCase())
    ), [users, userSearchQuery]);

    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(txn => {
                if (filterUser !== 'all' && txn.userId !== filterUser) return false;
                
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
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, filterUser, filterStartDate, filterEndDate, filterType, filterDescription]);
    
    const openTransactionModal = (user: User) => {
        setSelectedUserForTxn(user);
        setTxnModalOpen(true);
    };

    const closeTransactionModal = () => {
        setTxnModalOpen(false);
        setSelectedUserForTxn(null);
    };

    const openEditUserModal = (user: User) => {
        setEditingUser(user);
        setEditUserModalOpen(true);
    };
    
    const closeEditUserModal = () => {
        setEditingUser(null);
        setEditUserModalOpen(false);
    };

    const openEditTxnModal = (txn: Transaction) => {
        setEditingTransaction(txn);
        setEditTxnModalOpen(true);
    };

    const closeEditTxnModal = () => {
        setEditTxnModalOpen(false);
        setEditingTransaction(null);
    };

    const openDeleteModal = (txn: Transaction) => {
        setDeletingTransaction(txn);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setDeletingTransaction(null);
    };

    const handleDeleteConfirm = async () => {
        if (deletingTransaction) {
            await deleteTransaction(deletingTransaction.id);
            closeDeleteModal();
        }
    };
    
    const openDeleteUserModal = (user: User) => {
        setDeletingUser(user);
        setDeleteUserModalOpen(true);
    };

    const closeDeleteUserModal = () => {
        setDeletingUser(null);
        setDeleteUserModalOpen(false);
    };

    const handleDeleteUserConfirm = async () => {
        if (deletingUser) {
            await deleteUser(deletingUser.id);
            closeDeleteUserModal();
        }
    };

    const clearFilters = () => {
        setFilterUser('all');
        setFilterStartDate('');
        setFilterEndDate('');
        setFilterType('all');
        setFilterDescription('');
    };

    const handleExport = () => {
        if (isExporting) return;
        setIsExporting(true);

        try {
            // Sort by date ascending for a chronological backup
            const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            const dataToExport = sortedTransactions.map(txn => {
                const user = users.find(u => u.id === txn.userId);
                return {
                    'Transaction ID': txn.id,
                    'User Name': user?.name || 'N/A',
                    'Username': user ? `@${user.username}` : 'Unknown',
                    'Date': new Date(txn.date).toLocaleString(),
                    'Description': txn.description,
                    'Amount (₹)': txn.amount,
                    'Type': txn.amount >= 0 ? 'Credit' : 'Debit'
                };
            });
            
            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
            
            const today = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(wb, `transactions-backup-${today}.xlsx`);
        } catch (error) {
            console.error("Failed to export Excel file:", error);
            alert("An error occurred while exporting the data.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Layout title="Admin Dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <Card 
                    title="Manage Users" 
                    actions={<Button size="sm" onClick={() => setUserModalOpen(true)}><UserPlusIcon className="w-5 h-5 mr-2" />Add User</Button>}
                >
                    <div className="mb-4">
                        <Input
                            id="user-search"
                            placeholder="Search by username..."
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="space-y-4">
                        {normalUsers.length > 0 ? normalUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mr-4">
                                        <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-300"/>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">{user.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button size="sm" variant="secondary" onClick={() => openTransactionModal(user)}>
                                        <CurrencyRupeeIcon className="w-5 h-5 mr-1" />
                                        Add Txn
                                    </Button>
                                    <Button size="sm" variant="secondary" onClick={() => openEditUserModal(user)} aria-label={`Edit user ${user.username}`}>
                                        <PencilIcon className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => openDeleteUserModal(user)} aria-label={`Delete user ${user.username}`}>
                                        <TrashIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )) : <p className="text-gray-500 dark:text-gray-400">{userSearchQuery ? 'No users match your search.' : 'No users found. Add one to get started.'}</p>}
                    </div>
                </Card>

                <Card 
                    title="All Transactions"
                    actions={
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                            {isExporting ? 'Exporting...' : 'Export Excel'}
                        </Button>
                    }
                >
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
                        <h4 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-200">Filter Transactions</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="user-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User</label>
                                <select id="user-filter" value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                                    <option value="all">All Users</option>
                                    {users.filter(u => u.role === Role.USER).map(user => <option key={user.id} value={user.id}>{user.username}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                <select id="type-filter" value={filterType} onChange={(e) => setFilterType(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                                    <option value="all">All Types</option>
                                    <option value="credit">Credit</option>
                                    <option value="debit">Debit</option>
                                </select>
                            </div>
                            <Input id="desc-filter" label="Description" value={filterDescription} onChange={(e) => setFilterDescription(e.target.value)} placeholder="Search description..." />
                            <Input id="start-date-filter" label="Start Date" type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                            <Input id="end-date-filter" label="End Date" type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                            <div className="flex items-end">
                                <Button onClick={clearFilters} variant="secondary" className="w-full">Clear Filters</Button>
                            </div>
                        </div>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">User</th>
                                    <th scope="col" className="px-6 py-3">Description</th>
                                    <th scope="col" className="px-6 py-3">Amount</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.length > 0 ? filteredTransactions.map(txn => {
                                    const user = users.find(u => u.id === txn.userId);
                                    return (
                                        <tr key={txn.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{user?.username || 'Unknown'}</td>
                                            <td className="px-6 py-4">{txn.description}</td>
                                            <td className={`px-6 py-4 font-semibold ${txn.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                ₹{txn.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">{new Date(txn.date).toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <Button size="sm" variant="secondary" onClick={() => openEditTxnModal(txn)} aria-label="Edit transaction">
                                                        <PencilIcon className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="danger" onClick={() => openDeleteModal(txn)} aria-label="Delete transaction">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-6 text-gray-500 dark:text-gray-400">No transactions match the current filters.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            
            <Modal isOpen={isUserModalOpen} onClose={() => setUserModalOpen(false)} title="Add New User">
                <AddUserForm onClose={() => setUserModalOpen(false)} />
            </Modal>

            {editingUser && (
                <Modal isOpen={isEditUserModalOpen} onClose={closeEditUserModal} title={`Edit User: @${editingUser.username}`}>
                    <EditUserForm user={editingUser} onClose={closeEditUserModal} />
                </Modal>
            )}

            {selectedUserForTxn && (
                <Modal isOpen={isTxnModalOpen} onClose={closeTransactionModal} title={`Add Transaction for ${selectedUserForTxn.username}`}>
                    <AddTransactionForm user={selectedUserForTxn} onClose={closeTransactionModal} />
                </Modal>
            )}

            {editingTransaction && (
                <Modal isOpen={isEditTxnModalOpen} onClose={closeEditTxnModal} title="Edit Transaction">
                    <EditTransactionForm transaction={editingTransaction} onClose={closeEditTxnModal} />
                </Modal>
            )}

            {deletingTransaction && (
                <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Confirm Transaction Deletion">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Are you sure you want to delete this transaction?
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4 text-sm">
                            <p><span className="font-semibold">Description:</span> {deletingTransaction.description}</p>
                            <p><span className="font-semibold">Amount:</span> <span className={deletingTransaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>₹{deletingTransaction.amount.toFixed(2)}</span></p>
                            <p><span className="font-semibold">Date:</span> {new Date(deletingTransaction.date).toLocaleString()}</p>
                        </div>
                        <p className="text-red-500 dark:text-red-400 font-semibold">This action cannot be undone.</p>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
                            <Button type="button" variant="danger" onClick={handleDeleteConfirm}>Delete</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {deletingUser && (
                <Modal isOpen={isDeleteUserModalOpen} onClose={closeDeleteUserModal} title="Confirm User Deletion">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Are you sure you want to delete user <span className="font-semibold">@{deletingUser.username}</span>?
                        </p>
                        <div className="bg-red-50 dark:bg-red-900/40 p-3 rounded-md mb-4 text-sm border-l-4 border-red-500 text-red-800 dark:text-red-300">
                            <p className="font-bold">This will permanently delete the user and all of their associated transactions. This action cannot be undone.</p>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="secondary" onClick={closeDeleteUserModal}>Cancel</Button>
                            <Button type="button" variant="danger" onClick={handleDeleteUserConfirm}>Delete User</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </Layout>
    );
};

export default AdminDashboard;