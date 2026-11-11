import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen = false }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[70px] z-50 bg-[#0b2a4a] text-white border-b border-white/10 shadow-md">
      <div className="h-full px-3 sm:px-5 flex items-center justify-between gap-3">
        {/* Left Side: Sidebar Toggle & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              id="sidebarToggle"
              type="button"
              aria-label={isSidebarOpen ? 'Collapse Navigation Menu' : 'Open Navigation Menu'}
              title={isSidebarOpen ? 'Close Navigation' : 'Open Navigation'}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-[#cd7f32]/50 ${
                isSidebarOpen
                  ? 'bg-white/20 text-white shadow-inner'
                  : 'text-white/90 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 min-w-0 group">
            {/* KIT Institutional Crest */}
            <div className="w-10 h-10 rounded-full bg-white p-0.5 flex items-center justify-center shadow-md shrink-0 border border-white/30 overflow-hidden group-hover:scale-105 transition-transform">
              <img
                src="/kit-logo.png"
                alt="Khanpur Institute of Technology"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base text-white tracking-tight truncate">
                  {settings.institutionName || 'Khanpur Institute of Technology'}
                </span>
              </div>
              <p className="text-[11px] text-[#cd7f32] font-semibold truncate">
                {settings.platformName || 'KIT Helping Hand'} • Academic Portal
              </p>
            </div>
          </Link>
        </div>

        {/* Right Side: User Status & Actions (Matching KIT CMS) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {isAuthenticated ? (
            <>
              {/* My Profile Button */}
              <Link
                to="/profile"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-white/80" />
                <span>My Profile</span>
              </Link>

              {/* User Identity / Roll / Email */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-white/90">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] text-white shrink-0">
                  <UserIcon className="w-3 h-3 text-white" />
                </div>
                <span className="max-w-[140px] sm:max-w-[190px] truncate font-medium">
                  {user?.studentId ? `${user.studentId} • ${user?.email.split('@')[0]}` : user?.email}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-rose-600/80 border border-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
                title="Sign out of portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition-colors"
              >
                <span>Student Login</span>
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#cd7f32] hover:bg-[#ba6a25] text-white text-xs font-bold transition-colors"
              >
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
