// src/layouts/DashboardLayout.tsx
import { FC, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useTheme } from '../hooks/useTheme';

const DashboardLayout: FC = () => {
  // On mobile: sidebarOpen toggles the overlay drawer (default closed)
  // On tablet/desktop: sidebarCollapsed controls the collapse (default open)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { isDark } = useTheme();
  const bp = useBreakpoint();
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close mobile drawer when breakpoint moves to tablet/desktop
  useEffect(() => {
    if (bp !== 'mobile') setSidebarOpen(false);
  }, [bp]);

  const toggleSidebar = () => {
    if (bp === 'mobile') {
      setSidebarOpen((v) => !v);
    } else {
      setSidebarCollapsed((v) => !v);
    }
  };

  const isMobile = bp === 'mobile';

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* ── Mobile overlay backdrop ── */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      {/* Desktop/tablet: always in layout flow, collapsible */}
      {/* Mobile: fixed overlay drawer, hidden by default */}
      <div
        className={[
          isMobile
            ? `fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'relative shrink-0',
        ].join(' ')}
      >
        <Sidebar
          collapsed={isMobile ? false : sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          onClose={() => setSidebarOpen(false)}
          isMobileOpen={sidebarOpen}
        />
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar toggleSidebar={toggleSidebar} />

        <main
          className={[
            'flex-1 overflow-y-auto overscroll-contain',
            isDark ? 'bg-gray-900' : 'bg-gray-50',
            'p-3 sm:p-4 md:p-6',
          ].join(' ')}
        >
          <div className="max-w-[1440px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
