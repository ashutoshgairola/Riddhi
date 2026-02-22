// src/layouts/DashboardLayout.tsx
import { FC, useState } from 'react';
import { Outlet } from 'react-router-dom';

import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { useTheme } from '../hooks/useTheme';

const DashboardLayout: FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { isDark } = useTheme();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />

        <main
          className={`flex-1 overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
