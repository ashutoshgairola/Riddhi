// src/components/common/Navbar.tsx
import { FC } from 'react';

import { Bell, Menu, Search, User } from 'lucide-react';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: FC<NavbarProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm p-4">
      <div className="flex justify-between items-center">
        <div className="flex md:hidden">
          <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu size={20} />
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 hidden md:block">Dashboard</h1>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100 relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-green-800" />
            </div>
            <span className="text-sm font-medium hidden md:block">John Doe</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
