import { useAuth } from '../../hooks/useAuth';
import { Menu, LogOut, Settings, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 shadow-soft">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications placeholder */}
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-blue-600">1</span>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.name?.split(' ')[0]}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
