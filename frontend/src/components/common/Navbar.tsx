// src/components/common/Navbar.tsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  BarChart2,
  Bell,
  ChevronDown,
  CreditCard,
  LogOut,
  Menu,
  Moon,
  PieChart,
  Plus,
  Search,
  Settings,
  Sun,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useTransactionCategories } from '../../hooks/useTransactionCategories';
import { useTransactions } from '../../hooks/useTransactions';
import { TransactionCreateDTO } from '../../types/transaction.types';
import AddTransactionForm from '../transactions/AddTransactionForm';
import Modal from './Modal';
import Spinner from './Spinner';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // UI state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  // Data state
  interface Notification {
    id: string;
    type: 'alert' | 'success' | 'info';
    message: string;
    date: string;
    isRead: boolean;
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Transaction hooks
  const { createTransaction } = useTransactions();
  const { categories, loading: categoriesLoading } = useTransactionCategories();

  // Refs for click outside detection
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Toggle quick add transaction modal
  const toggleAddTransaction = () => {
    setShowAddTransaction(!showAddTransaction);
  };

  // Handle transaction submission
  const handleTransactionSubmit = async (data: TransactionCreateDTO) => {
    try {
      await createTransaction(data);
      toggleAddTransaction();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  // Mock fetch notifications - replace with actual API call in production
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    try {
      setNotificationsLoading(true);

      // Mock API call - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Sample notification data - replace with API response
      setNotifications([
        {
          id: '1',
          type: 'alert',
          message: 'You have exceeded your Shopping budget by ₹2,500',
          date: new Date().toISOString(),
          isRead: false,
        },
        {
          id: '2',
          type: 'success',
          message: 'May 2025 budget has been created successfully',
          date: new Date(Date.now() - 86400000).toISOString(),
          isRead: true,
        },
        {
          id: '3',
          type: 'info',
          message: 'New feature: Transaction labels are now available',
          date: new Date(Date.now() - 172800000).toISOString(),
          isRead: false,
        },
      ]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isNotificationsOpen && isAuthenticated) {
      fetchNotifications();
    }
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dark mode
  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // You would typically update a class on the html/body or use a context
    // document.documentElement.classList.toggle('dark');
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // Navigate to search results page
      navigate(`/transactions?search=${encodeURIComponent(searchValue)}`);
      setSearchValue('');
    }
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
      <header className="bg-white shadow-sm border-b border-gray-200 py-2 px-4">
        <div className="flex items-center justify-between">
          {/* Left section: Menu toggle and logo for mobile */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="mr-2 p-2 rounded-full hover:bg-gray-100 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="lg:hidden flex items-center">
              <span className="text-2xl font-bold text-green-600">₹</span>
              <span className="text-lg font-bold text-gray-900">iddhi</span>
            </div>
          </div>

          {/* Center section: Search */}
          <div className="hidden sm:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search transactions, budgets, etc."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </div>
              </div>
            </form>
          </div>

          {/* Right section: User profile, notifications, etc. */}
          <div className="flex items-center space-x-3">
            {/* Quick Add button */}
            {isAuthenticated && (
              <button
                onClick={toggleAddTransaction}
                className="hidden md:flex items-center rounded-full bg-green-600 text-white p-2 hover:bg-green-700"
                aria-label="Quick add"
                title="Quick add transaction"
              >
                <Plus size={20} />
              </button>
            )}

            {/* Dark/light mode toggle */}
            <button
              onClick={handleToggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications dropdown */}
            {isAuthenticated && (
              <div ref={notificationsRef} className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 rounded-full hover:bg-gray-100 relative"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {notifications.filter((n) => !n.isRead).length > 0 && (
                    <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                    <div className="p-3 border-b border-gray-200">
                      <h3 className="font-medium text-gray-800">Notifications</h3>
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
                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.isRead ? 'bg-green-50' : ''}`}
                          >
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-gray-800">
                                {notification.message}
                              </p>
                              {!notification.isRead && (
                                <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-1"></span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.date).toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">No notifications yet</div>
                      )}
                    </div>

                    <div className="p-2 border-t border-gray-200">
                      <button
                        className="w-full text-center text-sm text-green-600 hover:text-green-700 p-1"
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          // Navigate to notifications page if you have one
                          // navigate('/notifications');
                        }}
                      >
                        View all notifications
                      </button>
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
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-medium">
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
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 border border-gray-200 py-1">
                    <div className="p-3 border-b border-gray-200">
                      <p className="font-medium text-gray-800">{getUserDisplayName()}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>

                    {/* Quick actions */}
                    <div className="p-2 border-b border-gray-200">
                      <p className="text-xs font-medium text-gray-500 px-2 mb-1">QUICK ACTIONS</p>
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setIsProfileOpen(false);
                            action.action();
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <span className="text-gray-500 mr-2">{action.icon}</span>
                          {action.label}
                        </button>
                      ))}
                    </div>

                    {/* User links */}
                    <div className="py-1">
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings size={16} className="mr-2 text-gray-500" />
                        Settings
                      </Link>

                      {/* Sign out button */}
                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
      <div className="sm:hidden p-2 bg-white border-b border-gray-200">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </div>
          </div>
        </form>
      </div>

      {/* Logout confirmation modal */}
      <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} size="sm">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sign Out</h2>
          <p className="text-gray-600 mb-6">Are you sure you want to sign out of your account?</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Modal>

      {/* Quick Add Transaction Modal */}
      {showAddTransaction && (
        <Modal isOpen={showAddTransaction} onClose={toggleAddTransaction} size="md">
          <div className="bg-white rounded-lg">
            {categoriesLoading ? (
              <div className="flex justify-center p-8">
                <Spinner />
                <span className="ml-2">Loading categories...</span>
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
