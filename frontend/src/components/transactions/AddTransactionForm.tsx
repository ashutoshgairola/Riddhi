// src/components/transactions/AddTransactionForm.tsx
import { FC, useEffect, useState } from 'react';

import { isEmpty } from 'lodash';
import { AlertCircle, Clock, Plus, X } from 'lucide-react';

import { useCategories } from '../../contexts/CategoryContext';
import {
  TransactionCategory,
  TransactionCreateDTO,
  TransactionStatus,
  TransactionType,
} from '../../types/transaction.types';
import SearchableSelect from '../common/SearchableSelect';
import Select from '../common/Select';
import { ModalFooter, ModalHeader } from '../common/Modal';
import Spinner from '../common/Spinner';

const QUICK_COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#FF5722', '#607D8B'];

const fieldCls = (hasError: boolean) =>
  `w-full px-3 py-2.5 border ${
    hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm`;

const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

const FieldError: FC<{ msg?: string }> = ({ msg }) =>
  msg ? (
    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
      <AlertCircle size={12} /> {msg}
    </p>
  ) : null;

interface AddTransactionFormProps {
  onClose: () => void;
  onSubmit?: (data: TransactionCreateDTO) => void;
  initialData?: Partial<TransactionCreateDTO>;
  categories: TransactionCategory[];
  categoriesLoading: boolean;
}

const AddTransactionForm: FC<AddTransactionFormProps> = ({
  onClose,
  onSubmit,
  initialData,
  categories,
  categoriesLoading,
}) => {
  const { createCategory } = useCategories();
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);
  const [showInlineCategory, setShowInlineCategory] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');
  const [inlineCatColor, setInlineCatColor] = useState(QUICK_COLORS[0]);
  const [inlineCatCreating, setInlineCatCreating] = useState(false);

  const [formData, setFormData] = useState<TransactionCreateDTO>({
    description: initialData?.description || '',
    amount: initialData?.amount || 0,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    type: initialData?.type || 'expense',
    categoryId: initialData?.categoryId || '',
    accountId: initialData?.accountId || '',
    toAccountId: initialData?.toAccountId || '',
    status: initialData?.status || 'cleared',
    notes: initialData?.notes || '',
    tags: initialData?.tags || [],
    isRecurring: initialData?.isRecurring || false,
    recurringDetails: initialData?.recurringDetails || {
      frequency: 'monthly',
      interval: 1,
      endDate: undefined,
    },
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        description: initialData.description || '',
        amount: initialData.amount || 0,
        date: initialData.date || new Date().toISOString().split('T')[0],
        type: initialData.type || 'expense',
        categoryId: initialData.categoryId || '',
        accountId: initialData.accountId || '',
        toAccountId: initialData.toAccountId || '',
        status: initialData.status || 'cleared',
        notes: initialData.notes || '',
        tags: initialData.tags || [],
        isRecurring: initialData.isRecurring || false,
        recurringDetails: initialData.recurringDetails || {
          frequency: 'monthly',
          interval: 1,
          endDate: undefined,
        },
      });
      setShowRecurringOptions(!!initialData.isRecurring);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: '' });
  };

  const handleTypeChange = (type: TransactionType) => {
    setFormData({
      ...formData,
      type,
      categoryId: '',
      toAccountId: '',
      ...(type === 'transfer' && { isRecurring: false }),
    });
    if (type === 'transfer') setShowRecurringOptions(false);
    setFormErrors({});
  };

  const handleStatusChange = (status: TransactionStatus) => {
    setFormData({ ...formData, status });
  };

  const handleRecurringToggle = () => {
    setShowRecurringOptions(!showRecurringOptions);
    setFormData({ ...formData, isRecurring: !showRecurringOptions });
  };

  const handleRecurringChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      recurringDetails: {
        ...formData.recurringDetails!,
        [name]: name === 'interval' ? parseInt(value, 10) : value,
      },
    });
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value
      ? e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
    setFormData({ ...formData, tags: tagsArray });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0)
      errors.amount = 'Amount must be a positive number';
    if (!formData.date) errors.date = 'Date is required';
    if (formData.type !== 'transfer') {
      if (!formData.categoryId) errors.categoryId = 'Category is required';
      if (!formData.accountId) errors.accountId = 'Account is required';
    } else {
      if (!formData.accountId) errors.accountId = 'From account is required';
      if (!formData.toAccountId) errors.toAccountId = 'To account is required';
      if (formData.accountId && formData.accountId === formData.toAccountId)
        errors.toAccountId = 'From and To accounts must be different';
    }
    if (formData.isRecurring) {
      if (!formData.recurringDetails?.frequency) errors.frequency = 'Frequency is required';
      if (!formData.recurringDetails?.interval || formData.recurringDetails.interval < 1)
        errors.interval = 'Interval must be at least 1';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInlineCategoryCreate = async () => {
    if (!inlineCatName.trim()) return;
    setInlineCatCreating(true);
    const newCat = await createCategory({
      name: inlineCatName.trim(),
      color: inlineCatColor,
      icon: 'more-horizontal',
    });
    if (newCat) {
      setFormData((prev) => ({ ...prev, categoryId: newCat.id }));
      setFormErrors((prev) => ({ ...prev, categoryId: '' }));
    }
    setShowInlineCategory(false);
    setInlineCatName('');
    setInlineCatCreating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const submitData: TransactionCreateDTO = {
      ...formData,
      amount: Number(formData.amount),
      ...(!formData.isRecurring && { recurringDetails: undefined }),
      ...(formData.type === 'transfer'
        ? { categoryId: '', isRecurring: false, recurringDetails: undefined }
        : { toAccountId: undefined }),
    };
    if (onSubmit) onSubmit(submitData);
    onClose();
  };

  const typeColor =
    formData.type === 'expense' ? 'red' : formData.type === 'income' ? 'green' : 'blue';

  return (
    <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
      <ModalHeader title={initialData ? 'Edit Transaction' : 'Add Transaction'} onClose={onClose} />

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4">

        {/* ── Type selector ── */}
        <div>
          <div className="flex gap-2">
            {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  formData.type === t
                    ? t === 'expense'
                      ? 'bg-red-600 text-white'
                      : t === 'income'
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p
            className={`mt-2 text-xs text-center py-1.5 px-3 rounded-lg ${
              formData.type === 'expense'
                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                : formData.type === 'income'
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                  : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
            }`}
          >
            {formData.type === 'expense' && '💸 Money going out — track what you spend'}
            {formData.type === 'income' && '💰 Money coming in — record your earnings'}
            {formData.type === 'transfer' && '🔄 Move money between accounts — no category needed'}
          </p>
        </div>

        {/* ── Description ── */}
        <div>
          <label className={labelCls}>Description*</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className={fieldCls(!!formErrors.description)}
            placeholder="e.g. Grocery shopping, Rent payment"
          />
          <FieldError msg={formErrors.description} />
        </div>

        {/* ── Amount + Date ── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Amount*</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm select-none">
                ₹
              </span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className={`${fieldCls(!!formErrors.amount)} pl-7`}
                placeholder="0.00"
              />
            </div>
            <FieldError msg={formErrors.amount} />
          </div>
          <div>
            <label className={labelCls}>Date*</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className={fieldCls(!!formErrors.date)}
            />
            <FieldError msg={formErrors.date} />
          </div>
        </div>

        {/* ── Category (full width so inline panel has room) ── */}
        {formData.type !== 'transfer' && (
          <div>
            <label className={labelCls}>Category*</label>
            {categoriesLoading ? (
              <div className="flex items-center gap-2 h-10">
                <Spinner size="sm" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Loading…</span>
              </div>
            ) : (
              <>
                <SearchableSelect
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  value={formData.categoryId}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, categoryId: value }));
                    if (formErrors.categoryId) setFormErrors((prev) => ({ ...prev, categoryId: '' }));
                  }}
                  placeholder="Select a category"
                  error={!!formErrors.categoryId}
                />
                <FieldError msg={formErrors.categoryId} />

                {/* Inline create */}
                {!showInlineCategory ? (
                  <button
                    type="button"
                    onClick={() => setShowInlineCategory(true)}
                    className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                  >
                    <Plus size={13} /> New Category
                  </button>
                ) : (
                  <div className="mt-2 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Create category
                      </p>
                      <button
                        type="button"
                        onClick={() => { setShowInlineCategory(false); setInlineCatName(''); }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={inlineCatName}
                      onChange={(e) => setInlineCatName(e.target.value)}
                      placeholder="Category name"
                      autoFocus
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {QUICK_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setInlineCatColor(c)}
                            style={{ backgroundColor: c }}
                            className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                              inlineCatColor === c
                                ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900 scale-110'
                                : ''
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleInlineCategoryCreate}
                        disabled={inlineCatCreating || !inlineCatName.trim()}
                        className="px-4 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {inlineCatCreating ? 'Creating…' : 'Create & Select'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Account(s) ── */}
        {formData.type !== 'transfer' ? (
          <div>
            <label className={labelCls}>Account*</label>
            <Select
              name="accountId"
              value={formData.accountId}
              onChange={handleChange}
              required
              error={!!formErrors.accountId}
            >
              <option value="">Select an account</option>
              <option value="1">Main Checking Account</option>
              <option value="2">Savings Account</option>
              <option value="3">Credit Card</option>
            </Select>
            <FieldError msg={formErrors.accountId} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>From Account*</label>
              <Select
                name="accountId"
                value={formData.accountId}
                onChange={handleChange}
                required
                error={!!formErrors.accountId}
              >
                <option value="">Select account</option>
                <option value="1">Main Checking Account</option>
                <option value="2">Savings Account</option>
                <option value="3">Credit Card</option>
              </Select>
              <FieldError msg={formErrors.accountId} />
            </div>
            <div>
              <label className={labelCls}>To Account*</label>
              <Select
                name="toAccountId"
                value={formData.toAccountId}
                onChange={handleChange}
                required
                error={!!formErrors.toAccountId}
              >
                <option value="">Select account</option>
                <option value="1">Main Checking Account</option>
                <option value="2">Savings Account</option>
                <option value="3">Credit Card</option>
              </Select>
              <FieldError msg={formErrors.toAccountId} />
            </div>
          </div>
        )}

        {/* ── Status ── */}
        <div>
          <label className={labelCls}>Status</label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: 'cleared', label: 'Cleared', active: 'bg-green-600 text-white' },
                { value: 'pending', label: 'Pending', active: 'bg-yellow-600 text-white' },
                { value: 'reconciled', label: 'Reconciled', active: 'bg-blue-600 text-white' },
                { value: 'void', label: 'Void', active: 'bg-red-600 text-white' },
              ] as { value: TransactionStatus; label: string; active: string }[]
            ).map(({ value, label, active }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleStatusChange(value)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  formData.status === value || (isEmpty(formData.status) && value === 'void')
                    ? active
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Notes ── */}
        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            placeholder="Add any additional details…"
            className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {/* ── Tags ── */}
        {formData.type !== 'transfer' && (
          <div>
            <label className={labelCls}>Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags?.join(', ')}
              onChange={handleTagsChange}
              className={fieldCls(false)}
              placeholder="food, bills, subscriptions"
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Separate with commas</p>
          </div>
        )}

        {/* ── Recurring ── */}
        {formData.type !== 'transfer' && (
          <div>
            <button
              type="button"
              onClick={handleRecurringToggle}
              className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
            >
              <Clock size={15} />
              {showRecurringOptions ? 'Remove Recurring' : 'Make Recurring'}
            </button>

            {showRecurringOptions && (
              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className={labelCls}>Frequency*</label>
                    <Select
                      name="frequency"
                      value={formData.recurringDetails?.frequency}
                      onChange={handleRecurringChange}
                      error={!!formErrors.frequency}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </Select>
                    <FieldError msg={formErrors.frequency} />
                  </div>
                  <div>
                    <label className={labelCls}>Interval*</label>
                    <input
                      type="number"
                      name="interval"
                      value={formData.recurringDetails?.interval}
                      onChange={handleRecurringChange}
                      min="1"
                      className={fieldCls(!!formErrors.interval)}
                      placeholder="1"
                    />
                    <FieldError msg={formErrors.interval} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>End Date (optional)</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.recurringDetails?.endDate || ''}
                    onChange={handleRecurringChange}
                    className={fieldCls(false)}
                  />
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    Leave blank for indefinite
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* end scrollable body */}

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
          className={`px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${
            typeColor === 'red'
              ? 'bg-red-600 hover:bg-red-700'
              : typeColor === 'green'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {initialData ? 'Update' : 'Add'} Transaction
        </button>
      </ModalFooter>
    </form>
  );
};

export default AddTransactionForm;
