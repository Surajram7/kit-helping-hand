import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  CheckCircle,
  HelpCircle,
  LayoutDashboard,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Badge } from './Badge';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Academic Resources', path: '/resources' },
    { name: 'Lecture Notes', path: '/resources?type=LECTURE_NOTE' },
    { name: 'Past Papers', path: '/past-papers' },
    { name: 'Solved Papers', path: '/past-papers?solved=true' },
    { name: 'Unsolved Papers', path: '/past-papers?solved=false' },
    { name: 'Student Requests', path: '/requests' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-navy-950 text-white shadow-md border-b border-navy-800">
      {/* Top institutional strip */}
      <div className="bg-navy-900 border-b border-navy-800/80 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium tracking-wide text-slate-200">
              {settings.institutionName || 'Khanpur Institute of Technology'}
            </span>
            <span className="hidden sm:inline text-slate-400">• Institutional Academic Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 hidden md:inline">
              {settings.tagline}
            </span>
            {isStaff && (
              <span className="bg-blue-600/30 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase">
                Staff Portal Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner group-hover:bg-blue-500 transition-colors">
              KIT
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-blue-200 transition-colors">
                  {settings.platformName}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-normal">
                Academic Resource Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-sm font-medium">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    active
                      ? 'bg-navy-800 text-blue-400 font-semibold'
                      : 'text-slate-200 hover:text-white hover:bg-navy-900'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-200 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {isStaff && (
                  <Link
                    to="/admin"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin')
                        ? 'bg-amber-600 text-white'
                        : 'bg-navy-800 text-amber-300 hover:bg-navy-700 border border-amber-600/30'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-navy-800 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-blue-400" />
                  <span className="max-w-[120px] truncate">{user?.fullName.split(' ')[0]}</span>
                  <Badge variant="primary" size="sm" className="bg-blue-900/80 text-blue-200 border-blue-700">
                    {user?.role === 'SUPER_ADMIN' ? 'Admin' : user?.role}
                  </Badge>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-300 hover:text-rose-400 hover:bg-navy-800 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-200 hover:text-white hover:bg-navy-850 rounded-lg transition-colors"
                >
                  Student Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex xl:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-navy-900 border-b border-navy-800 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive(link.path)
                  ? 'bg-navy-800 text-blue-400'
                  : 'text-slate-200 hover:text-white hover:bg-navy-850'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <hr className="border-navy-800 my-2" />

          {isAuthenticated ? (
            <div className="space-y-2 pt-1">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                <span>Student Dashboard</span>
              </Link>
              {isStaff && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-amber-300 bg-amber-950/40 border border-amber-800/40"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Administrative Control Panel</span>
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
              >
                <UserIcon className="w-4 h-4 text-blue-400" />
                <span>My Academic Profile</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-navy-800"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-sm font-medium text-slate-200 bg-navy-800 rounded-lg hover:bg-navy-750"
              >
                Student Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm"
              >
                Create Student Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
