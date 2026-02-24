// src/components/common/Navbar.tsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  BarChart2,
  Bell,
  ChevronDown,
  CreditCard,
  Landmark,
  Loader2,
  LogOut,
  Menu,
  PieChart,
  Search,
  Settings,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useSearch } from '../../hooks/useSearch';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import { useTransactionCategories } from '../../hooks/useTransactionCategories';
import notificationService, { NotificationLogDTO } from '../../services/api/notificationService';
import { SearchResult, SearchResultType } from '../../services/api/searchService';
import transactionService from '../../services/api/transactionService';
import { TransactionCreateDTO } from '../../types/transaction.types';
import AddTransactionForm from '../transactions/AddTransactionForm';
import Modal from './Modal';
import Spinner from './Spinner';

interface NavbarProps {
  toggleSidebar: () => void;
}

// Icon map for search result types
const TYPE_ICONS: Record<SearchResultType, React.ReactNode> = {
  transaction: <CreditCard size={14} className="text-blue-500" />,
  budget: <PieChart size={14} className="text-purple-500" />,
  goal: <Target size={14} className="text-green-500" />,
  account: <Landmark size={14} className="text-yellow-500" />,
  investment: <TrendingUp size={14} className="text-pink-500" />,
};

const TYPE_LABELS: Record<SearchResultType, string> = {
  transaction: 'Transaction',
  budget: 'Budget',
  goal: 'Goal',
  account: 'Account',
  investment: 'Investment',
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // UI state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  // Data state
  const [notifications, setNotifications] = useState<NotificationLogDTO[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Search
  const { query, setQuery, results, loading: searchLoading, clear: clearSearch } = useSearch();

  // Transaction hooks
  const { categories, loading: categoriesLoading } = useTransactionCategories();
  const { warning } = useToast();

  // Refs for click outside detection
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Toggle quick add transaction modal
  const toggleAddTransaction = () => {
    if (!showAddTransaction && !categoriesLoading && categories.length === 0) {
      warning('Please create a category first before adding a transaction.', 'No categories');
      return;
    }
    setShowAddTransaction(!showAddTransaction);
  };

  // Handle transaction submission
  const handleTransactionSubmit = async (data: TransactionCreateDTO) => {
    try {
      await transactionService.create(data);
      toggleAddTransaction();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setNotificationsLoading(true);
      const logs = await notificationService.getLogs(30);
      setNotifications(logs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isNotificationsOpen && isAuthenticated) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNotificationsOpen, isAuthenticated]);

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Navigate to a search result
  const handleResultClick = (result: SearchResult) => {
    clearSearch();
    setIsSearchOpen(false);
    navigate(result.url);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsLogoutModalOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Format user name for display
  const getUserDisplayName = () => {
    if (!user) return '';

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    return user.email.split('@')[0];
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';

    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }

    return user.email.charAt(0).toUpperCase();
  };

  // Quick action links for dropdown menu
  const quickActions = [
    {
      icon: <CreditCard size={16} />,
      label: 'Add Transaction',
      action: toggleAddTransaction,
    },
    {
      icon: <PieChart size={16} />,
      label: 'Create Budget',
      action: () => navigate('/budgets/new'),
    },
    {
      icon: <BarChart2 size={16} />,
      label: 'View Reports',
      action: () => navigate('/reports'),
    },
  ];

  return (
    <>
      <header
        className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b py-2 px-4`}
      >
        <div className="flex items-center justify-between">
          {/* Left section: Menu toggle and logo for mobile */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className={`mr-2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full ${isDark ? 'hover:bg-gray-700 active:bg-gray-600' : 'hover:bg-gray-100 active:bg-gray-200'} lg:hidden touch-manipulation`}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
            </button>
            <div className="lg:hidden flex items-center">
              <span className="text-2xl font-bold text-green-600">₹</span>
              <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                iddhi
              </span>
            </div>
          </div>

          {/* Center section: Search */}
          <div className="hidden sm:flex flex-1 max-w-md mx-4">
            <div ref={searchRef} className="relative w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search transactions, budgets, goals…"
                  className={`w-full pl-10 pr-9 py-2 rounded-full border ${isDark ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => query.length >= 2 && setIsSearchOpen(true)}
                  onKeyDown={(e) => e.key === 'Escape' && (clearSearch(), setIsSearchOpen(false))}
                  autoComplete="off"
                />
                <div
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                >
                  {searchLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Search size={18} />
                  )}
                </div>
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      clearSearch();
                      setIsSearchOpen(false);
                    }}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Search dropdown */}
              {isSearchOpen && query.length >= 2 && (
                <div
                  className={`absolute top-full mt-1 left-0 right-0 rounded-xl shadow-xl border z-30 overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                >
                  {searchLoading ? (
                    <div className="p-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Loader2 size={16} className="animate-spin" /> Searching…
                    </div>
                  ) : results.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No results for <span className="font-medium">"{query}"</span>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {results.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault(); // keep input focused, don't blur
                            handleResultClick(result);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b last:border-b-0 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
                        >
                          <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                            {TYPE_ICONS[result.type]}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span
                              className={`block text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
                            >
                              {result.title}
                            </span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                              {result.subtitle}
                            </span>
                          </span>
                          <span className="shrink-0 flex flex-col items-end gap-0.5">
                            {result.amount !== undefined && (
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {formatAmount(result.amount)}
                              </span>
                            )}
                            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                              {TYPE_LABELS[result.type]}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right section: User profile, notifications, etc. */}
          <div className="flex items-center space-x-3">
            {/* Notifications dropdown */}
            {isAuthenticated && (
              <div ref={notificationsRef} className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 relative touch-manipulation"
                  aria-label="Notifications"
                >
                  <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                  {notifications.filter((n) => !n.isRead).length > 0 && (
                    <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[min(320px,calc(100vw-1rem))] bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-600">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
                      <h3 className="font-medium text-gray-800 dark:text-white">Notifications</h3>
                      {notifications.some((n) => !n.isRead) && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-green-600 dark:text-green-400 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="p-4 flex justify-center">
                          <Spinner size="sm" />
                        </div>
                      ) : notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => !notification.isRead && handleMarkRead(notification.id)}
                            className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${!notification.isRead ? 'bg-green-50 dark:bg-green-900/20 cursor-pointer' : ''}`}
                          >
                            <div className="flex justify-between gap-2">
                              <p className="text-sm font-medium text-gray-800 dark:text-white leading-snug">
                                {notification.subject}
                              </p>
                              {!notification.isRead && (
                                <span className="shrink-0 w-2 h-2 bg-green-500 rounded-full mt-1" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 capitalize">
                                {notification.type.replace(/_/g, ' ')}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                          <Bell size={24} className="mx-auto mb-2 opacity-40" />
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User profile dropdown */}
            {loading ? (
              <div className="p-2">
                <Spinner size="sm" />
              </div>
            ) : isAuthenticated && user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 min-w-[44px] min-h-[44px] rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 touch-manipulation"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-700 dark:text-green-300 font-medium">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={getUserDisplayName()}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      getUserInitials()
                    )}
                  </div>
                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-600 py-1">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                      <p className="font-medium text-gray-800 dark:text-white">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Quick actions */}
                    <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 mb-1">
                        QUICK ACTIONS
                      </p>
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setIsProfileOpen(false);
                            action.action();
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <span className="text-gray-500 dark:text-gray-400 mr-2">
                            {action.icon}
                          </span>
                          {action.label}
                        </button>
                      ))}
                    </div>

                    {/* User links */}
                    <div className="py-1">
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                        Settings
                      </Link>

                      {/* Sign out button */}
                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsLogoutModalOpen(true);
                        }}
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center py-2 px-3 rounded bg-green-600 text-white hover:bg-green-700 text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile search bar - shown on small screens */}
      <div className="sm:hidden p-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div ref={searchRef} className="relative">
          <input
            type="text"
            placeholder="Search…"
            className="w-full pl-10 pr-9 py-2 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => query.length >= 2 && setIsSearchOpen(true)}
            onKeyDown={(e) => e.key === 'Escape' && (clearSearch(), setIsSearchOpen(false))}
            autoComplete="off"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {searchLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={18} />}
          </div>
          {query && (
            <button
              type="button"
              onClick={() => {
                clearSearch();
                setIsSearchOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={14} />
            </button>
          )}

          {/* Mobile search dropdown */}
          {isSearchOpen && query.length >= 2 && (
            <div className="absolute top-full mt-1 left-0 right-0 rounded-xl shadow-xl border z-30 overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {searchLoading ? (
                <div className="p-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" /> Searching…
                </div>
              ) : results.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No results for <span className="font-medium">"{query}"</span>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {results.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b last:border-b-0 border-gray-100 dark:border-gray-700"
                    >
                      <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                        {TYPE_ICONS[result.type]}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium truncate text-gray-900 dark:text-white">
                          {result.title}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                          {result.subtitle}
                        </span>
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shrink-0">
                        {TYPE_LABELS[result.type]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Logout confirmation modal */}
      <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} size="sm">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Sign Out</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to sign out of your account?
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="px-4 py-2.5 min-h-[44px] rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 min-h-[44px] rounded bg-red-600 text-white hover:bg-red-700 active:bg-red-800 font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Modal>

      {/* Quick Add Transaction Modal */}
      {showAddTransaction && (
        <Modal isOpen={showAddTransaction} onClose={toggleAddTransaction} size="md">
          <div className="bg-white dark:bg-gray-800 rounded-lg">
            {categoriesLoading ? (
              <div className="flex justify-center p-8">
                <Spinner />
                <span className="ml-2 dark:text-gray-300">Loading categories...</span>
              </div>
            ) : (
              <AddTransactionForm
                onClose={toggleAddTransaction}
                onSubmit={handleTransactionSubmit}
                categories={categories}
                categoriesLoading={false}
              />
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

export default Navbar;
