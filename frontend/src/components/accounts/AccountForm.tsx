// src/components/accounts/AccountForm.tsx
import { FC, useEffect, useState } from 'react';

import { AlertCircle, ChevronDown, Search, X } from 'lucide-react';

import { Account, AccountCreateDTO, AccountType, AccountUpdateDTO } from '../../types/account.types';
import { ModalFooter, ModalHeader } from '../common/Modal';

// Build bank list from local assets via Vite's import.meta.glob
const bankLogoModules = import.meta.glob('../../assets/bank-logos/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const BANKS: { name: string; logoUrl: string }[] = Object.entries(bankLogoModules)
  .map(([path, url]) => {
    const filename = path.split('/').pop() ?? '';
    const name = filename.replace('Bank Name=', '').replace('.svg', '');
    return { name, logoUrl: url as string };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const ACCOUNT_TYPES: { value: AccountType; label: string; color: string }[] = [
  { value: 'checking', label: 'Checking', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'savings', label: 'Savings', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'credit', label: 'Credit Card', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  { value: 'investment', label: 'Investment', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  { value: 'cash', label: 'Cash', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { value: 'loan', label: 'Loan', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
];

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'SGD', 'AED'];

const isLiability = (type: AccountType) => type === 'credit' || type === 'loan';

interface AccountFormProps {
  onClose: () => void;
  onSubmit: (data: AccountCreateDTO | AccountUpdateDTO) => Promise<void>;
  initialData?: Account | null;
}

const fieldCls = (hasError: boolean) =>
  `w-full px-3 py-2.5 border ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm`;

const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

const FieldError: FC<{ msg?: string }> = ({ msg }) =>
  msg ? (
    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
      <AlertCircle size={12} /> {msg}
    </p>
  ) : null;

const AccountForm: FC<AccountFormProps> = ({ onClose, onSubmit, initialData }) => {
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name ?? '');
  const [type, setType] = useState<AccountType>(initialData?.type ?? 'checking');
  const [balance, setBalance] = useState(
    initialData ? Math.abs(initialData.balance).toString() : '',
  );
  const [currency, setCurrency] = useState(initialData?.currency ?? 'INR');
  const [includeInNetWorth, setIncludeInNetWorth] = useState(
    initialData?.includeInNetWorth ?? true,
  );
  const [institutionName, setInstitutionName] = useState(initialData?.institutionName ?? '');

  // Bank picker state
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [bankSearch, setBankSearch] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // When type changes to/from liability, clear balance if needed
  useEffect(() => {
    setErrors({});
  }, [type]);

  const filteredBanks = bankSearch
    ? BANKS.filter((b) => b.name.toLowerCase().includes(bankSearch.toLowerCase()))
    : BANKS;

  const selectedBank = BANKS.find((b) => b.name === institutionName);

  const handleBankSelect = (bank: { name: string; logoUrl: string }) => {
    setInstitutionName(bank.name);
    setShowBankPicker(false);
    setBankSearch('');
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Account name is required';
    const bal = parseFloat(balance);
    if (balance === '' || isNaN(bal) || bal < 0) errs.balance = 'Enter a valid balance (≥ 0)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const data: AccountCreateDTO = {
        name: name.trim(),
        type,
        balance: parseFloat(balance),
        currency,
        includeInNetWorth,
        institutionName: institutionName || undefined,
        institutionLogo: selectedBank?.logoUrl || undefined,
      };
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
      <ModalHeader title={isEditing ? 'Edit Account' : 'Add Account'} onClose={onClose} />

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4">
        {/* Account Name */}
        <div>
          <label className={labelCls}>Account Name*</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: '' })); }}
            className={fieldCls(!!errors.name)}
            placeholder="e.g. HDFC Savings, SBI Checking"
          />
          <FieldError msg={errors.name} />
        </div>

        {/* Account Type */}
        <div>
          <label className={labelCls}>Account Type*</label>
          <div className="grid grid-cols-2 gap-2">
            {ACCOUNT_TYPES.map(({ value, label, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-all border-2 ${
                  type === value
                    ? `${color} border-current`
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {isLiability(type) && (
            <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle size={12} /> Balance will be stored as negative (liability)
            </p>
          )}
        </div>

        {/* Balance + Currency */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>
              {isLiability(type) ? 'Outstanding Balance*' : 'Current Balance*'}
            </label>
            <input
              type="number"
              value={balance}
              onChange={(e) => { setBalance(e.target.value); if (errors.balance) setErrors((p) => ({ ...p, balance: '' })); }}
              min="0"
              step="0.01"
              className={fieldCls(!!errors.balance)}
              placeholder="0.00"
            />
            <FieldError msg={errors.balance} />
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={fieldCls(false)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bank / Institution picker */}
        <div>
          <label className={labelCls}>Bank / Institution</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBankPicker((v) => !v)}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <div className="flex items-center gap-2 min-w-0">
                {selectedBank ? (
                  <>
                    <img src={selectedBank.logoUrl} alt={selectedBank.name} className="w-6 h-6 object-contain shrink-0" />
                    <span className="truncate">{selectedBank.name}</span>
                  </>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">
                    {institutionName || 'Select a bank (optional)'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {institutionName && (
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); setInstitutionName(''); }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
                  >
                    <X size={14} />
                  </span>
                )}
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showBankPicker ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {showBankPicker && (
              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      placeholder="Search banks…"
                      autoFocus
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="max-h-52 overflow-y-auto py-1">
                  {filteredBanks.length > 0 ? (
                    filteredBanks.map((bank) => (
                      <button
                        key={bank.name}
                        type="button"
                        onClick={() => handleBankSelect(bank)}
                        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-600 text-left"
                      >
                        <img src={bank.logoUrl} alt={bank.name} className="w-7 h-7 object-contain shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{bank.name}</span>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">No banks found</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Choose from 80+ bank logos</p>
        </div>

        {/* Include in Net Worth */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <input
            type="checkbox"
            id="includeInNetWorth"
            checked={includeInNetWorth}
            onChange={(e) => setIncludeInNetWorth(e.target.checked)}
            className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
          />
          <div>
            <label htmlFor="includeInNetWorth" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Include in net worth
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">Count this account's balance in your total net worth</p>
          </div>
        </div>
      </div>

      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Account'}
        </button>
      </ModalFooter>
    </form>
  );
};

export default AccountForm;
