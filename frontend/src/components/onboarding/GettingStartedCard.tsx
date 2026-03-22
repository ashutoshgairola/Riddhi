// src/components/onboarding/GettingStartedCard.tsx
import { FC, useState } from 'react';

import { ArrowRight, CheckCircle, FolderTree, PiggyBank, Receipt, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useBudgets } from '../../contexts/BudgetContext';
import { useCategories } from '../../contexts/CategoryContext';

interface GettingStartedCardProps {
  hasTransactions: boolean;
  onStartWizard: () => void;
}

const DISMISSED_KEY = 'riddhi_onboarding_dismissed_v1';

const GettingStartedCard: FC<GettingStartedCardProps> = ({ hasTransactions, onStartWizard }) => {
  const { categories } = useCategories();
  const { currentBudget } = useBudgets();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === 'true',
  );

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
  };

  const hasCategories = categories.length > 0;
  const hasBudget = currentBudget !== null;
  const allDone = hasCategories && hasBudget && hasTransactions;

  if (dismissed || allDone) return null;

  const steps = [
    {
      id: 'categories',
      step: 1,
      icon: FolderTree,
      label: 'Set up categories',
      description: 'Organise your income and expenses into meaningful groups.',
      cta: 'Create categories',
      href: '/transactions/categories',
      complete: hasCategories,
      accent: 'from-violet-500 to-purple-600',
      iconBg: 'bg-violet-100 dark:bg-violet-900/40',
      iconColor: 'text-violet-600 dark:text-violet-400',
      completeBg: 'bg-green-50 dark:bg-green-900/20',
      completeBorder: 'border-green-200 dark:border-green-800',
    },
    {
      id: 'budget',
      step: 2,
      icon: PiggyBank,
      label: 'Create a budget',
      description: 'Plan your monthly spending and stay on track.',
      cta: 'Set up budget',
      href: '/budgets',
      complete: hasBudget,
      accent: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      completeBg: 'bg-green-50 dark:bg-green-900/20',
      completeBorder: 'border-green-200 dark:border-green-800',
    },
    {
      id: 'transaction',
      step: 3,
      icon: Receipt,
      label: 'Add a transaction',
      description: 'Record your first expense or income to get started.',
      cta: 'Add transaction',
      href: '/transactions',
      complete: hasTransactions,
      accent: 'from-emerald-500 to-green-600',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      completeBg: 'bg-green-50 dark:bg-green-900/20',
      completeBorder: 'border-green-200 dark:border-green-800',
    },
  ];

  const completedCount = steps.filter((s) => s.complete).length;

  return (
    <div className="mb-6 relative">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Get started with Riddhi
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {completedCount} of {steps.length} steps complete
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onStartWizard}
            className="text-xs font-semibold px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Start guided setup
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {steps.map((step) => {
          const Icon = step.icon;

          if (step.complete) {
            return (
              <div
                key={step.id}
                className={`rounded-xl border p-4 flex items-center gap-3 ${step.completeBg} ${step.completeBorder}`}
              >
                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  {step.label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={step.id}
              to={step.href}
              className="group relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200 flex flex-col gap-3"
            >
              {/* Step number badge */}
              <span className="absolute top-3 right-3 text-xs font-semibold text-gray-400 dark:text-gray-500">
                {step.step}/{steps.length}
              </span>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl ${step.iconBg} flex items-center justify-center`}>
                <Icon size={20} className={step.iconColor} />
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                  {step.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 group-hover:gap-2 transition-all">
                {step.cta}
                <ArrowRight size={13} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default GettingStartedCard;
