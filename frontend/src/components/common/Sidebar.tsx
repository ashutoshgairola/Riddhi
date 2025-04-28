// src/components/common/Sidebar.tsx
import { FC } from 'react';
import { NavLink } from 'react-router-dom';

import { BarChart2, CreditCard, Menu, PieChart, Settings, Target, TrendingUp } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

const NavItem: FC<NavItemProps> = ({ to, icon, label, collapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center p-4 cursor-pointer
        ${
          isActive
            ? 'bg-green-50 text-green-800 border-r-4 border-green-600'
            : 'text-gray-700 hover:bg-gray-50'
        }
        ${collapsed ? 'justify-center' : ''}
      `}
    >
      <div className="text-gray-500">{icon}</div>
      {!collapsed && <span className="ml-4 font-medium">{label}</span>}
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
        />
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
