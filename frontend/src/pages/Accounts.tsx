// src/pages/Accounts.tsx
import { FC, useState } from 'react';

import {
  Banknote,
  Building2,
  CreditCard,
  Landmark,
  PiggyBank,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import wallet04 from '../assets/empty-states/Wallet 04.svg';
import AccountForm from '../components/accounts/AccountForm';
import ConfirmModal from '../components/common/ConfirmModal';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import PageHeader from '../components/common/PageHeader';
import Spinner from '../components/common/Spinner';
import { useAccounts } from '../hooks/useAccounts';
import { useHighlight } from '../hooks/useHighlight';
import { useToast } from '../hooks/useToast';
import { Account, AccountCreateDTO, AccountType, AccountUpdateDTO } from '../types/account.types';

// ─── helpers ────────────────────────────────────────────────────────────────

const TYPE_META: Record<AccountType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  checking: { label: 'Checking', icon: <Building2 size={16} />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  savings:  { label: 'Savings',  icon: <PiggyBank size={16} />, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
  credit:   { label: 'Credit',   icon: <CreditCard size={16} />, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  investment: { label: 'Investment', icon: <TrendingUp size={16} />, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  cash:     { label: 'Cash',     icon: <Banknote size={16} />, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  loan:     { label: 'Loan',     icon: <Wallet size={16} />, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  other:    { label: 'Other',    icon: <Landmark size={16} />, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700' },
};

const LIABILITY_TYPES: AccountType[] = ['credit', 'loan'];

const fmt = (amount: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    Math.abs(amount),
  );

const FILTER_TABS: { label: string; value: AccountType | null }[] = [
  { label: 'All', value: null },
  { label: 'Checking', value: 'checking' },
  { label: 'Savings', value: 'savings' },
  { label: 'Credit', value: 'credit' },
  { label: 'Investment', value: 'investment' },
  { label: 'Cash', value: 'cash' },
  { label: 'Loan', value: 'loan' },
  { label: 'Other', value: 'other' },
];

// ─── AccountCard ─────────────────────────────────────────────────────────────

const AccountCard: FC<{
  account: Account;
  onEdit: (a: Account) => void;
  onDelete: (id: string) => void;
}> = ({ account, onEdit, onDelete }) => {
  const meta = TYPE_META[account.type];
  const isLiability = LIABILITY_TYPES.includes(account.type);
  const balanceColor = isLiability
    ? 'text-red-600 dark:text-red-400'
    : 'text-green-600 dark:text-green-400';

  return (
    <div
      id={`highlight-${account.id}`}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo or placeholder */}
          <div className={`w-10 h-10 rounded-lg ${meta.bg} flex items-center justify-center shrink-0 overflow-hidden`}>
            {account.institutionLogo ? (
              <img
                src={account.institutionLogo}
                alt={account.institutionName}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className={meta.color}>{meta.icon}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{account.name}</p>
            {account.institutionName && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{account.institutionName}</p>
            )}
          </div>
        </div>

        {/* Type badge */}
        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${meta.bg} ${meta.color}`}>
          {meta.icon}
          {meta.label}
        </span>
      </div>

      {/* Balance */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
          {isLiability ? 'Outstanding' : 'Balance'}
        </p>
        <p className={`text-xl font-bold ${balanceColor}`}>
          {isLiability ? '− ' : ''}{fmt(account.balance, account.currency)}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {account.includeInNetWorth ? 'In net worth' : 'Excluded'}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(account)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="text-xs text-red-500 dark:text-red-400 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const Accounts: FC = () => {
  const { accounts, loading, createAccount, updateAccount, deleteAccount } = useAccounts();
  const { success, error: toastError } = useToast();
  const [activeFilter, setActiveFilter] = useState<AccountType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useHighlight(loading);

  const filtered = activeFilter ? accounts.filter((a) => a.type === activeFilter) : accounts;

  // Net worth summary
  const assets = accounts
    .filter((a) => a.includeInNetWorth && !LIABILITY_TYPES.includes(a.type))
    .reduce((s, a) => s + a.balance, 0);
  const liabilities = accounts
    .filter((a) => a.includeInNetWorth && LIABILITY_TYPES.includes(a.type))
    .reduce((s, a) => s + Math.abs(a.balance), 0);
  const netWorth = assets - liabilities;

  const handleAdd = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleSubmit = async (data: AccountCreateDTO | AccountUpdateDTO) => {
    if (editingAccount) {
      const updated = await updateAccount(editingAccount.id, data as AccountUpdateDTO);
      if (updated) {
        success('Account updated.');
        setShowForm(false);
        setEditingAccount(null);
      } else {
        toastError('Failed to update account.');
      }
    } else {
      const created = await createAccount(data as AccountCreateDTO);
      if (created) {
        success('Account added.');
        setShowForm(false);
      } else {
        toastError('Failed to add account.');
      }
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const ok = await deleteAccount(deletingId);
    if (ok) {
      success('Account deleted.');
    } else {
      toastError('Cannot delete account with existing transactions.');
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Accounts"
        subtitle="Manage your bank accounts and track balances"
        actions={
          <button
            onClick={handleAdd}
            className="px-5 py-2 text-sm font-medium bg-green-600 text-white rounded-full hover:bg-green-700 active:scale-95 transition-all select-none"
          >
            Add Account
          </button>
        }
      />

      {/* Net worth summary */}
      {accounts.length > 0 && (
        <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Assets</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">{fmt(assets)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Liabilities</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{fmt(liabilities)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Worth</p>
            <p className={`text-lg font-bold ${netWorth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {netWorth < 0 ? '− ' : ''}{fmt(netWorth)}
            </p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mt-4 sm:mt-6 flex space-x-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {FILTER_TABS.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => setActiveFilter(value)}
            className={`px-4 py-2 rounded-full whitespace-nowrap min-h-[36px] text-sm font-medium select-none shrink-0 transition-colors ${
              activeFilter === value
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {label}
            {value === null && accounts.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({accounts.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Account grid */}
      <div className="mt-4 sm:mt-6">
        {accounts.length === 0 ? (
          <EmptyState
            image={wallet04}
            title="No accounts yet"
            description="Add your bank accounts, credit cards, and cash to track your balances in one place."
            action={
              <button
                onClick={handleAdd}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                Add First Account
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No accounts for this type.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={handleEdit}
                onDelete={setDeletingId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingAccount(null); }} size="md">
        <AccountForm
          onClose={() => { setShowForm(false); setEditingAccount(null); }}
          onSubmit={handleSubmit}
          initialData={editingAccount}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Delete Account"
        message="Are you sure you want to delete this account? This cannot be undone. Accounts with existing transactions cannot be deleted."
        confirmText="Delete"
      />
    </div>
  );
};

export default Accounts;
