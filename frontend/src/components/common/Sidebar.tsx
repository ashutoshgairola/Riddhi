// src/components/common/Sidebar.tsx
import { FC, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import {
  BarChart2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FolderTree,
  List,
  Menu,
  PieChart,
  Settings,
  Target,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  children?: React.ReactNode;
}

const NavItem: FC<NavItemProps> = ({ to, icon, label, collapsed, children }) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(
    () => location.pathname.startsWith(to) && to !== '/',
  );

  const hasChildren = !!children;
  const isActive =
    location.pathname === to || (hasChildren && location.pathname.startsWith(to) && to !== '/');

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren && !collapsed) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <NavLink
        to={to}
        onClick={handleClick}
        className={({ isActive: routeActive }) => `
          flex items-center p-4 cursor-pointer
          ${
            isActive || routeActive
              ? 'bg-green-50 text-green-800 border-r-4 border-green-600'
              : 'text-gray-700 hover:bg-gray-50'
          }
          ${collapsed ? 'justify-center' : ''}
        `}
      >
        <div className="text-gray-500">{icon}</div>
        {!collapsed && (
          <div className="flex items-center justify-between flex-1">
            <span className="ml-4 font-medium">{label}</span>
            {hasChildren && (
              <span className="ml-2">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            )}
          </div>
        )}
      </NavLink>

      {hasChildren && !collapsed && isExpanded && <div className="bg-gray-50">{children}</div>}
    </div>
  );
};

const SubNavItem: FC<{
  to: string;
  icon?: React.ReactNode;
  label: string;
}> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center pl-12 pr-4 py-3 cursor-pointer
        ${
          isActive
            ? 'bg-green-50 text-green-800 border-r-4 border-green-600'
            : 'text-gray-600 hover:bg-gray-100'
        }
      `}
    >
      {icon && <div className="text-gray-500 mr-3">{icon}</div>}
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  );
};

const Sidebar: FC<SidebarProps> = ({ collapsed, toggleSidebar }) => {
  return (
    <div
      className={`bg-white shadow-md ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-xl font-bold text-green-800">
            <span className="text-4xl">₹</span>iddhi
          </h1>
        )}
        <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-100">
          <Menu size={20} />
        </button>
      </div>

      <nav className="mt-8">
        <NavItem
          to="/dashboard"
          icon={<span className="text-xl">₹</span>}
          label="Dashboard"
          collapsed={collapsed}
        />

        <NavItem
          to="/transactions"
          icon={<CreditCard size={20} />}
          label="Transactions"
          collapsed={collapsed}
        >
          <SubNavItem to="/transactions" icon={<List size={16} />} label="All Transactions" />
          <SubNavItem
            to="/transactions/categories"
            icon={<FolderTree size={16} />}
            label="Categories"
          />
        </NavItem>

        <NavItem
          to="/budgets"
          icon={<PieChart size={20} />}
          label="Budgets"
          collapsed={collapsed}
        />

        <NavItem to="/goals" icon={<Target size={20} />} label="Goals" collapsed={collapsed} />

        <NavItem
          to="/investments"
          icon={<TrendingUp size={20} />}
          label="Investments"
          collapsed={collapsed}
        />

        <NavItem
          to="/reports"
          icon={<BarChart2 size={20} />}
          label="Reports"
          collapsed={collapsed}
        />

        <NavItem
          to="/settings"
          icon={<Settings size={20} />}
          label="Settings"
          collapsed={collapsed}
        />
      </nav>
    </div>
  );
};

export default Sidebar;
