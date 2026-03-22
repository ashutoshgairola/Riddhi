// src/components/onboarding/OnboardingWizard.tsx
import { FC, useEffect, useRef, useState } from 'react';

import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  BookOpen,
  Briefcase,
  Car,
  Check,
  FolderTree,
  Heart,
  Home,
  Loader2,
  PiggyBank,
  Plane,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
  Tv,
  Utensils,
  X,
  Zap,
} from 'lucide-react';

import { useBudgets } from '../../contexts/BudgetContext';
import { useCategories } from '../../contexts/CategoryContext';
import goalService from '../../services/api/goalService';
import investmentService from '../../services/api/investmentService';
import { GoalType } from '../../types/goal.types';
import { AssetClass, InvestmentType } from '../../types/investment.types';

interface OnboardingWizardProps {
  onComplete: () => void;
}

// ─── Preset categories ────────────────────────────────────────────────────────
const PRESET_CATEGORIES = [
  { name: 'Groceries', icon: ShoppingCart, color: '#4CAF50' },
  { name: 'Rent / Housing', icon: Home, color: '#2196F3' },
  { name: 'Transport', icon: Car, color: '#FF9800' },
  { name: 'Utilities', icon: Zap, color: '#9C27B0' },
  { name: 'Entertainment', icon: Tv, color: '#E91E63' },
  { name: 'Dining Out', icon: Utensils, color: '#FF5722' },
  { name: 'Shopping', icon: ShoppingBag, color: '#3F51B5' },
  { name: 'Healthcare', icon: Heart, color: '#F44336' },
  { name: 'Education', icon: BookOpen, color: '#009688' },
  { name: 'Salary', icon: Briefcase, color: '#795548' },
  { name: 'Travel', icon: Plane, color: '#00BCD4' },
  { name: 'Investments', icon: TrendingUp, color: '#8BC34A' },
];

const PRESET_NAMES = new Set(PRESET_CATEGORIES.map((p) => p.name));

// ─── Helpers ──────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split('T')[0];
const endOfMonthStr = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 0);
  return d.toISOString().split('T')[0];
};
const defaultBudgetName = () =>
  new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });
const oneYearLater = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
};

const TOTAL_STEPS = 4;
const STEP_META = [
  { label: 'Categories', icon: FolderTree },
  { label: 'Budget', icon: PiggyBank },
  { label: 'Goals', icon: Target },
  { label: 'Investments', icon: TrendingUp },
];

// ─── Shared input / label classes ────────────────────────────────────────────
const inputCls =
  'w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 text-sm transition-colors';
const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

// ─── Main Component ───────────────────────────────────────────────────────────
const OnboardingWizard: FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { categories: existingCategories, createCategory } = useCategories();
  const { createBudget, currentBudget } = useBudgets();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [stepError, setStepError] = useState('');

  // ── Category state — pre-populate from existing context data ─────────────
  const [selectedPresets, setSelectedPresets] = useState<string[]>(() =>
    existingCategories.filter((c) => PRESET_NAMES.has(c.name)).map((c) => c.name),
  );
  // Non-preset categories that already exist (shown as read-only chips)
  const existingCustomCats = existingCategories
    .filter((c) => !PRESET_NAMES.has(c.name))
    .map((c) => c.name);

  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // ── Budget state — pre-populate from context ──────────────────────────────
  const [budgetIncome, setBudgetIncome] = useState(() =>
    currentBudget?.income ? String(currentBudget.income) : '',
  );
  const [budgetName] = useState(defaultBudgetName());

  // ── Sync state if context data arrives after wizard mounts ───────────────
  const syncedCatsRef = useRef(false);
  useEffect(() => {
    if (!syncedCatsRef.current && existingCategories.length > 0) {
      syncedCatsRef.current = true;
      setSelectedPresets(
        existingCategories.filter((c) => PRESET_NAMES.has(c.name)).map((c) => c.name),
      );
    }
  }, [existingCategories]);

  const syncedBudgetRef = useRef(false);
  useEffect(() => {
    if (!syncedBudgetRef.current && currentBudget?.income) {
      syncedBudgetRef.current = true;
      setBudgetIncome(String(currentBudget.income));
    }
  }, [currentBudget]);

  // ── Goals / investments existing count (fetched on demand) ───────────────
  const [goalsCount, setGoalsCount] = useState<number | null>(null);
  const [investCount, setInvestCount] = useState<number | null>(null);

  useEffect(() => {
    if (step === 3 && goalsCount === null) {
      goalService
        .getAll({ limit: 1 })
        .then((res) => setGoalsCount(res.pagination.total))
        .catch(() => setGoalsCount(0));
    }
    if (step === 4 && investCount === null) {
      investmentService
        .getAll({ limit: 1 })
        .then((res) => setInvestCount(res.data.total))
        .catch(() => setInvestCount(0));
    }
  }, [step, goalsCount, investCount]);

  // ── Goal form state ───────────────────────────────────────────────────────
  const [goalName, setGoalName] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('savings');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDate, setGoalDate] = useState(oneYearLater());

  // ── Investment form state ─────────────────────────────────────────────────
  const [investName, setInvestName] = useState('');
  const [investType, setInvestType] = useState<InvestmentType>('etf');
  const [investAsset, setInvestAsset] = useState<AssetClass>('stocks');
  const [investShares, setInvestShares] = useState('1');
  const [investPrice, setInvestPrice] = useState('');
  const [investDate, setInvestDate] = useState(todayStr());

  useEffect(() => setStepError(''), [step]);

  const advance = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  // ── Submit handlers ───────────────────────────────────────────────────────
  const handleCategoriesSubmit = async (skip: boolean) => {
    if (skip) {
      advance();
      return;
    }

    // Which names are new (not already in context)
    const existingNames = new Set(existingCategories.map((c) => c.name));
    const toCreate = [...selectedPresets, ...(customName.trim() ? [customName.trim()] : [])].filter(
      (n) => !existingNames.has(n),
    );

    if (toCreate.length === 0 && existingCategories.length === 0) {
      setStepError('Select at least one category, or click Skip to continue.');
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        toCreate.map((name) => {
          const preset = PRESET_CATEGORIES.find((p) => p.name === name);
          return createCategory({
            name,
            color: preset?.color ?? '#4CAF50',
            icon: 'more-horizontal',
          });
        }),
      );
      advance();
    } catch {
      setStepError('Some categories could not be saved. Try again or skip.');
    } finally {
      setSaving(false);
    }
  };

  const handleBudgetSubmit = async (skip: boolean) => {
    if (skip) {
      advance();
      return;
    }

    const income = Number(budgetIncome.trim());
    if (!budgetIncome.trim()) {
      setStepError('Please enter your monthly income.');
      return;
    }
    if (isNaN(income) || income <= 0) {
      setStepError('Income must be a positive number.');
      return;
    }

    // If a budget already exists for this month, just advance
    if (currentBudget) {
      advance();
      return;
    }

    setSaving(true);
    try {
      const result = await createBudget({
        name: budgetName,
        startDate: todayStr(),
        endDate: endOfMonthStr(),
        income,
        categories: [],
      });
      if (!result) {
        setStepError('Budget could not be created. Try again or skip.');
        return;
      }
      advance();
    } catch {
      setStepError('Budget could not be created. Try again or skip.');
    } finally {
      setSaving(false);
    }
  };

  const handleGoalSubmit = async (skip: boolean) => {
    if (skip) {
      advance();
      return;
    }
    if (!goalName.trim()) {
      setStepError('Please enter a name for your goal.');
      return;
    }
    const target = Number(goalTarget);
    if (!goalTarget || isNaN(target) || target <= 0) {
      setStepError('Please enter a valid target amount.');
      return;
    }
    if (!goalDate) {
      setStepError('Please choose a target date.');
      return;
    }

    setSaving(true);
    try {
      await goalService.create({
        name: goalName.trim(),
        type: goalType,
        targetAmount: target,
        currentAmount: 0,
        startDate: todayStr(),
        targetDate: goalDate,
        priority: 1,
      });
      advance();
    } catch {
      setStepError('Goal could not be saved. Try again or skip.');
    } finally {
      setSaving(false);
    }
  };

  const handleInvestmentSubmit = async (skip: boolean) => {
    if (skip) {
      advance();
      return;
    }
    if (!investName.trim()) {
      setStepError('Please enter an investment name.');
      return;
    }
    const price = Number(investPrice);
    if (!investPrice || isNaN(price) || price <= 0) {
      setStepError('Please enter a valid current value.');
      return;
    }

    setSaving(true);
    try {
      await investmentService.create({
        name: investName.trim(),
        type: investType,
        assetClass: investAsset,
        shares: Math.max(Number(investShares) || 1, 0.001),
        purchasePrice: price,
        currentPrice: price,
        purchaseDate: investDate,
        accountId: '1',
        currency: 'INR',
      });
      advance();
    } catch {
      setStepError('Investment could not be saved. Try again or skip.');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    if (step === 1) handleCategoriesSubmit(false);
    else if (step === 2) handleBudgetSubmit(false);
    else if (step === 3) handleGoalSubmit(false);
    else if (step === 4) handleInvestmentSubmit(false);
  };
  const handleSkip = () => {
    if (step === 1) handleCategoriesSubmit(true);
    else if (step === 2) handleBudgetSubmit(true);
    else if (step === 3) handleGoalSubmit(true);
    else if (step === 4) handleInvestmentSubmit(true);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm" />

      {/* Card: larger, explicit height so header/footer never overlap */}
      <div
        className="relative z-10 w-full max-w-2xl flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        style={{ height: 'min(92vh, 780px)' }}
      >
        {/* ── WELCOME ────────────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="flex flex-col h-full">
            {/* Green hero header */}
            <div className="relative bg-gradient-to-br from-green-500 to-emerald-700 px-8 pt-8 pb-8 text-white shrink-0 overflow-hidden">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles size={16} className="text-white/70" />
                <span className="text-xs font-bold tracking-widest uppercase text-white/70">
                  Quick Setup
                </span>
              </div>
              <h1 className="text-2xl font-bold mb-1.5 leading-snug">Welcome to Riddhi</h1>
              <p className="text-white/80 text-sm leading-relaxed max-w-sm">
                Set up your financial workspace in 4 quick steps. Skip anything and come back later.
              </p>
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -right-2 w-20 h-20 rounded-full bg-white/10" />
            </div>

            {/* Step cards */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                What we'll set up
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: FolderTree,
                    label: 'Spending categories',
                    desc: 'Organise income & expenses',
                    step: 1,
                    iconCls:
                      'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/40',
                  },
                  {
                    icon: PiggyBank,
                    label: 'Monthly budget',
                    desc: 'Plan your spending limits',
                    step: 2,
                    iconCls: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40',
                  },
                  {
                    icon: Target,
                    label: 'Financial goals',
                    desc: 'Save for what matters',
                    step: 3,
                    iconCls: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40',
                  },
                  {
                    icon: TrendingUp,
                    label: 'Investments',
                    desc: 'Track your portfolio',
                    step: 4,
                    iconCls:
                      'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40',
                  },
                ].map(({ icon: Icon, label, desc, step: s, iconCls }) => (
                  <div
                    key={s}
                    className="flex flex-col gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconCls}`}
                      >
                        <Icon size={17} />
                      </div>
                      <span className="text-xs font-semibold text-gray-300 dark:text-gray-600">
                        {s}/4
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                        {label}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-snug">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer CTA */}
            <div className="shrink-0 px-6 pb-6 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={advance}
                className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
              >
                Get Started <ArrowRight size={17} />
              </button>
              <button
                onClick={onComplete}
                className="w-full mt-2 py-2 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Skip for now, I'll set up later
              </button>
            </div>
          </div>
        )}

        {/* ── STEPS 1–4 ──────────────────────────────────────────────────── */}
        {step >= 1 && step <= 4 && (
          <>
            {/* Fixed header */}
            <div className="shrink-0 px-7 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex gap-1.5 mb-4">
                {STEP_META.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                      i < step - 1
                        ? 'bg-green-400 dark:bg-green-600'
                        : i === step - 1
                          ? 'bg-green-500 dark:bg-green-400'
                          : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Step {step} of {TOTAL_STEPS}
                  </p>
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-100 mt-0.5">
                    {STEP_META[step - 1].label}
                  </p>
                </div>
                <button
                  onClick={onComplete}
                  className="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable body — min-h-0 required for flex overflow */}
            <div className="flex-1 min-h-0 overflow-y-auto px-7 py-6">
              {step === 1 && (
                <StepCategories
                  selectedPresets={selectedPresets}
                  existingCustomCats={existingCustomCats}
                  onTogglePreset={(name) =>
                    setSelectedPresets((prev) =>
                      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
                    )
                  }
                  customName={customName}
                  onCustomNameChange={setCustomName}
                  showCustomInput={showCustomInput}
                  onToggleCustomInput={() => setShowCustomInput((v) => !v)}
                />
              )}
              {step === 2 && (
                <StepBudget
                  budgetName={budgetName}
                  income={budgetIncome}
                  onIncomeChange={setBudgetIncome}
                  existingBudget={currentBudget}
                />
              )}
              {step === 3 && (
                <StepGoal
                  name={goalName}
                  onNameChange={setGoalName}
                  type={goalType}
                  onTypeChange={setGoalType}
                  target={goalTarget}
                  onTargetChange={setGoalTarget}
                  date={goalDate}
                  onDateChange={setGoalDate}
                  existingCount={goalsCount}
                />
              )}
              {step === 4 && (
                <StepInvestment
                  name={investName}
                  onNameChange={setInvestName}
                  type={investType}
                  onTypeChange={setInvestType}
                  assetClass={investAsset}
                  onAssetClassChange={setInvestAsset}
                  price={investPrice}
                  onPriceChange={setInvestPrice}
                  shares={investShares}
                  onSharesChange={setInvestShares}
                  date={investDate}
                  onDateChange={setInvestDate}
                  existingCount={investCount}
                />
              )}

              {stepError && (
                <div className="mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/25 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                  {stepError}
                </div>
              )}
            </div>

            {/* Fixed footer */}
            <div className="shrink-0 px-7 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 bg-white dark:bg-gray-900">
              <button
                onClick={back}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft size={15} /> Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSkip}
                  disabled={saving}
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-40"
                >
                  Skip
                </button>
                <button
                  onClick={handleContinue}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white text-sm font-semibold rounded-xl disabled:opacity-60 active:scale-[0.98] transition-all shadow-sm"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {step === TOTAL_STEPS ? 'Finish' : 'Continue'}
                  {!saving && <ArrowRight size={14} />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── COMPLETE ───────────────────────────────────────────────────── */}
        {step === 5 && (
          <div className="flex flex-col items-center justify-center text-center px-10 py-12 h-full">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
              <Check size={36} className="text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              You're all set!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed max-w-sm">
              Your financial workspace is ready. Start tracking, budgeting, and growing your wealth.
            </p>
            <div className="grid grid-cols-4 gap-3 w-full mb-8">
              {[
                {
                  icon: FolderTree,
                  label: 'Categories',
                  cls: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400',
                },
                {
                  icon: PiggyBank,
                  label: 'Budget',
                  cls: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
                },
                {
                  icon: Target,
                  label: 'Goals',
                  cls: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
                },
                {
                  icon: TrendingUp,
                  label: 'Investments',
                  cls: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
                },
              ].map(({ icon: Icon, label, cls }, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cls}`}>
                    <Icon size={17} />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {label}
                  </span>
                  <Check size={12} className="text-green-500 dark:text-green-400" />
                </div>
              ))}
            </div>
            <button
              onClick={onComplete}
              className="w-full max-w-xs py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-green-500/25 flex items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Step sub-components ──────────────────────────────────────────────────────

const StepHeader: FC<{ icon: React.ReactNode; title: string; subtitle: string }> = ({
  icon,
  title,
  subtitle,
}) => (
  <div className="mb-5">
    <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
      {icon}
    </div>
    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{title}</h2>
    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{subtitle}</p>
  </div>
);

const ExistingBadge: FC<{ text: string }> = ({ text }) => (
  <div className="mb-4 px-3 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
    <Check size={14} className="shrink-0" />
    {text}
  </div>
);

// ── Step 1: Categories ────────────────────────────────────────────────────────
const StepCategories: FC<{
  selectedPresets: string[];
  existingCustomCats: string[];
  onTogglePreset: (name: string) => void;
  customName: string;
  onCustomNameChange: (v: string) => void;
  showCustomInput: boolean;
  onToggleCustomInput: () => void;
}> = ({
  selectedPresets,
  existingCustomCats,
  onTogglePreset,
  customName,
  onCustomNameChange,
  showCustomInput,
  onToggleCustomInput,
}) => (
  <div>
    <StepHeader
      icon={<FolderTree size={20} className="text-violet-600 dark:text-violet-400" />}
      title="What do you spend money on?"
      subtitle="Tap the categories that match your lifestyle. Already-selected ones are from your account."
    />

    {existingCustomCats.length > 0 && (
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Your custom categories
        </p>
        <div className="flex flex-wrap gap-2">
          {existingCustomCats.map((name) => (
            <span
              key={name}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium"
            >
              <Check size={12} /> {name}
            </span>
          ))}
        </div>
      </div>
    )}

    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
      Suggested categories
    </p>
    <div className="flex flex-wrap gap-2 mb-4">
      {PRESET_CATEGORIES.map(({ name, icon: Icon, color }) => {
        const selected = selectedPresets.includes(name);
        return (
          <button
            key={name}
            type="button"
            onClick={() => onTogglePreset(name)}
            style={selected ? { backgroundColor: color, borderColor: color } : {}}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
              selected
                ? 'text-white shadow-sm'
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750'
            }`}
          >
            <Icon size={13} />
            {name}
            {selected && <Check size={12} className="ml-0.5" />}
          </button>
        );
      })}
    </div>

    {showCustomInput ? (
      <div className="flex gap-2">
        <input
          type="text"
          value={customName}
          onChange={(e) => onCustomNameChange(e.target.value)}
          placeholder="e.g. Pet care, Gym"
          autoFocus
          className={inputCls}
        />
        <button
          type="button"
          onClick={onToggleCustomInput}
          className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={onToggleCustomInput}
        className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium hover:text-green-700 dark:hover:text-green-300 transition-colors"
      >
        <Plus size={14} /> Add custom category
      </button>
    )}

    {selectedPresets.length > 0 && (
      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        {selectedPresets.length} preset{selectedPresets.length !== 1 ? 's' : ''} selected
        {existingCustomCats.length > 0
          ? ` · ${existingCustomCats.length} custom already saved`
          : ''}
      </p>
    )}
  </div>
);

// ── Step 2: Budget ────────────────────────────────────────────────────────────
const StepBudget: FC<{
  budgetName: string;
  income: string;
  onIncomeChange: (v: string) => void;
  existingBudget: { name: string; income: number } | null;
}> = ({ budgetName, income, onIncomeChange, existingBudget }) => (
  <div>
    <StepHeader
      icon={<PiggyBank size={20} className="text-blue-600 dark:text-blue-400" />}
      title="Set your monthly budget"
      subtitle="Enter your monthly income so we can help you plan your spending."
    />

    {existingBudget && (
      <ExistingBadge
        text={`You already have a budget: "${existingBudget.name}" (₹${existingBudget.income.toLocaleString('en-IN')}). You can update the income below.`}
      />
    )}

    <div className="mb-4">
      <label className={labelCls}>Budget name</label>
      <div className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
        {existingBudget ? existingBudget.name : budgetName}
      </div>
    </div>

    <div className="mb-5">
      <label className={labelCls}>
        Monthly income <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium select-none">
          ₹
        </span>
        <input
          type="number"
          value={income}
          onChange={(e) => onIncomeChange(e.target.value)}
          placeholder="e.g. 80000"
          min="1"
          autoFocus={!existingBudget}
          className={inputCls.replace('px-3', 'pl-8 pr-3')}
        />
      </div>
    </div>

    <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-start gap-2.5">
      <Banknote size={15} className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
      <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
        {existingBudget
          ? 'Your existing budget income will not be changed. Add spending categories from the Budgets page.'
          : `Your budget will cover ${budgetName}. You can add spending limits per category from the Budgets page.`}
      </p>
    </div>
  </div>
);

// ── Step 3: Goals ─────────────────────────────────────────────────────────────
const GOAL_TYPES: { value: GoalType; label: string; emoji: string }[] = [
  { value: 'savings', label: 'Savings', emoji: '🐖' },
  { value: 'major_purchase', label: 'Major Purchase', emoji: '🏠' },
  { value: 'retirement', label: 'Retirement', emoji: '🏖️' },
  { value: 'debt', label: 'Debt Payoff', emoji: '📉' },
  { value: 'other', label: 'Other', emoji: '🎯' },
];

const StepGoal: FC<{
  name: string;
  onNameChange: (v: string) => void;
  type: GoalType;
  onTypeChange: (v: GoalType) => void;
  target: string;
  onTargetChange: (v: string) => void;
  date: string;
  onDateChange: (v: string) => void;
  existingCount: number | null;
}> = ({
  name,
  onNameChange,
  type,
  onTypeChange,
  target,
  onTargetChange,
  date,
  onDateChange,
  existingCount,
}) => (
  <div>
    <StepHeader
      icon={<Target size={20} className="text-amber-600 dark:text-amber-400" />}
      title="What are you saving for?"
      subtitle="Set a financial goal and track your progress towards it."
    />

    {existingCount !== null && existingCount > 0 && (
      <ExistingBadge
        text={`You already have ${existingCount} goal${existingCount !== 1 ? 's' : ''}. Add another one below, or skip this step.`}
      />
    )}

    <div className="mb-4">
      <label className={labelCls}>
        Goal name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="e.g. Emergency fund, New car, Vacation"
        autoFocus
        className={inputCls}
      />
    </div>

    <div className="mb-4">
      <label className={labelCls}>Goal type</label>
      <div className="flex flex-wrap gap-2">
        {GOAL_TYPES.map((g) => (
          <button
            key={g.value}
            type="button"
            onClick={() => onTypeChange(g.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
              type === g.value
                ? 'bg-amber-500 dark:bg-amber-600 border-amber-500 dark:border-amber-600 text-white'
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {g.emoji} {g.label}
          </button>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className={labelCls}>
          Target amount <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 select-none">
            ₹
          </span>
          <input
            type="number"
            value={target}
            onChange={(e) => onTargetChange(e.target.value)}
            placeholder="100000"
            min="1"
            className={inputCls.replace('px-3', 'pl-8 pr-3')}
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>
          Target date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          min={todayStr()}
          className={inputCls}
        />
      </div>
    </div>
  </div>
);

// ── Step 4: Investments ───────────────────────────────────────────────────────
const INVEST_TYPES: { value: InvestmentType; label: string }[] = [
  { value: 'etf', label: 'ETF' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'individual_stock', label: 'Stock' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'bond', label: 'Bond' },
  { value: 'reit', label: 'REIT' },
  { value: 'other', label: 'Other' },
];

const ASSET_CLASSES: { value: AssetClass; label: string }[] = [
  { value: 'stocks', label: 'Stocks' },
  { value: 'bonds', label: 'Bonds' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'alternatives', label: 'Alternatives' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
];

const selectCls =
  'w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 text-sm transition-colors appearance-none';

const StepInvestment: FC<{
  name: string;
  onNameChange: (v: string) => void;
  type: InvestmentType;
  onTypeChange: (v: InvestmentType) => void;
  assetClass: AssetClass;
  onAssetClassChange: (v: AssetClass) => void;
  price: string;
  onPriceChange: (v: string) => void;
  shares: string;
  onSharesChange: (v: string) => void;
  date: string;
  onDateChange: (v: string) => void;
  existingCount: number | null;
}> = ({
  name,
  onNameChange,
  type,
  onTypeChange,
  assetClass,
  onAssetClassChange,
  price,
  onPriceChange,
  shares,
  onSharesChange,
  date,
  onDateChange,
  existingCount,
}) => (
  <div>
    <StepHeader
      icon={<TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400" />}
      title="Track your investments"
      subtitle="Add your first investment to start monitoring your portfolio."
    />

    {existingCount !== null && existingCount > 0 && (
      <ExistingBadge
        text={`You already have ${existingCount} investment${existingCount !== 1 ? 's' : ''}. Add another one below, or skip.`}
      />
    )}

    <div className="mb-4">
      <label className={labelCls}>
        Investment name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="e.g. Nifty 50 ETF, Reliance, Bitcoin"
        autoFocus
        className={inputCls}
      />
    </div>

    <div className="grid grid-cols-2 gap-3 mb-4">
      <div>
        <label className={labelCls}>Type</label>
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as InvestmentType)}
          className={selectCls}
        >
          {INVEST_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>Asset class</label>
        <select
          value={assetClass}
          onChange={(e) => onAssetClassChange(e.target.value as AssetClass)}
          className={selectCls}
        >
          {ASSET_CLASSES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 mb-4">
      <div>
        <label className={labelCls}>
          Current value <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 select-none">
            ₹
          </span>
          <input
            type="number"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            className={inputCls.replace('px-3', 'pl-8 pr-3')}
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Units / Shares</label>
        <input
          type="number"
          value={shares}
          onChange={(e) => onSharesChange(e.target.value)}
          placeholder="1"
          min="0.001"
          step="0.001"
          className={inputCls}
        />
      </div>
    </div>

    <div>
      <label className={labelCls}>Purchase date</label>
      <input
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        max={todayStr()}
        className={inputCls}
      />
    </div>
  </div>
);

export default OnboardingWizard;
