// src/components/common/Sidebar.tsx
import { FC } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import {
  BarChart2,
  CreditCard,
  FolderTree,
  List,
  Menu,
  PieChart,
  Settings,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';

import { useTheme } from '../../hooks/useTheme';

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  /** Mobile only — close the drawer without toggling */
  onClose?: () => void;
  isMobileOpen?: boolean;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
  isDark: boolean;
}

const NavItem: FC<NavItemProps> = ({
  to,
  icon,
  label,
  collapsed,
  children,
  disabled = false,
  isDark,
}) => {
  const location = useLocation();

  const hasChildren = !!children;
  const isActive =
    location.pathname === to || (hasChildren && location.pathname.startsWith(to) && to !== '/');

  return (
    <div>
      <NavLink
        to={disabled ? '#' : to}
        className={({ isActive: routeActive }) => `
          flex items-center p-4 cursor-pointer select-none active:bg-opacity-80
          ${
            disabled
              ? ` ${isDark ? 'text-gray-500' : 'text-gray-400'} cursor-not-allowed`
              : isActive || routeActive
                ? `${isDark ? 'bg-green-900/20 text-green-300' : 'bg-green-50 text-green-800'} border-r-4 border-green-600`
                : `${isDark ? 'text-gray-300 hover:bg-gray-700 active:bg-gray-600' : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'}`
          }
          ${collapsed ? 'justify-center' : ''}
        `}
      >
        <div
          className={`${isDark ? 'text-gray-400' : 'text-gray-500'} ${disabled ? (isDark ? 'text-gray-500' : 'text-gray-400') : ''}`}
        >
          {icon}
        </div>
        {!collapsed && (
          <span
            className={`ml-4 font-medium ${disabled ? (isDark ? 'text-gray-500' : 'text-gray-400') : ''}`}
          >
            {label}
          </span>
        )}
      </NavLink>

      {hasChildren && !collapsed && <div>{children}</div>}
    </div>
  );
};

const SubNavItem: FC<{
  to: string;
  icon?: React.ReactNode;
  label: string;
  isDark: boolean;
}> = ({ to, icon, label, isDark }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center pl-12 pr-4 py-3 cursor-pointer select-none
        ${
          isActive
            ? `${isDark ? 'bg-green-900/20 text-green-300' : 'bg-green-50 text-green-800'} border-r-4 border-green-600`
            : `${isDark ? 'text-gray-300 hover:bg-gray-700 active:bg-gray-600' : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'}`
        }
      `}
    >
      {icon && <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mr-3`}>{icon}</div>}
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  );
};

const Sidebar: FC<SidebarProps> = ({ collapsed, toggleSidebar, onClose }) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`${isDark ? 'bg-gray-900' : 'bg-white'} shadow-md h-full flex flex-col ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between shrink-0">
        {!collapsed && (
          <h1 className={`text-xl font-bold ${isDark ? 'text-green-300' : 'text-green-800'}`}>
            <span className="text-4xl">₹</span>iddhi
          </h1>
        )}
        <div className="flex items-center gap-1">
          {/* Desktop collapse toggle */}
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-full select-none ${isDark ? 'hover:bg-gray-700 active:bg-gray-600' : 'hover:bg-gray-100 active:bg-gray-200'} hidden md:flex`}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          {/* Mobile close (X) button */}
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-full select-none md:hidden ${isDark ? 'hover:bg-gray-700 active:bg-gray-600' : 'hover:bg-gray-100 active:bg-gray-200'}`}
              aria-label="Close menu"
            >
              <X size={20} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
            </button>
          )}
        </div>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto overscroll-contain">
        <NavItem
          to="/dashboard"
          icon={<span className="text-xl">₹</span>}
          label="Dashboard"
          collapsed={collapsed}
          disabled={false}
          isDark={isDark}
        />

        <NavItem
          to="/transactions"
          icon={<CreditCard size={20} />}
          label="Transactions"
          collapsed={collapsed}
          disabled={false}
          isDark={isDark}
        >
          <SubNavItem
            to="/transactions"
            icon={<List size={16} />}
            label="All Transactions"
            isDark={isDark}
          />
          <SubNavItem
            to="/transactions/categories"
            icon={<FolderTree size={16} />}
            label="Categories"
            isDark={isDark}
          />
        </NavItem>

        <NavItem
          to="/budgets"
          icon={<PieChart size={20} />}
          label="Budgets"
          collapsed={collapsed}
          disabled={false}
          isDark={isDark}
        />

        <NavItem
          to="/goals"
          icon={<Target size={20} />}
          label="Goals"
          collapsed={collapsed}
          disabled={false}
          isDark={isDark}
        />

        <NavItem
          to="/investments"
          icon={<TrendingUp size={20} />}
          label="Investments"
          collapsed={collapsed}
          disabled={false}
          isDark={isDark}
        />

        <NavItem
          to="/reports"
          icon={<BarChart2 size={20} />}
          label="Reports"
          collapsed={collapsed}
          disabled={false}
          isDark={isDark}
        />

        <NavItem
          to="/settings"
          icon={<Settings size={20} />}
          label="Settings"
          collapsed={collapsed}
          disabled={false}
          isDark={isDark}
        />
      </nav>
    </div>
  );
};

export default Sidebar;
