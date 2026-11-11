import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  GraduationCap,
  FileCheck,
  CheckCircle2,
  FileText,
  FolderOpen,
  Users,
  HelpCircle,
  Upload,
  Layers,
  Settings as SettingsIcon,
  User as UserIcon,
  Info,
  ChevronDown,
  BookOpen,
  X,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, isStaff, isContentManager } = useAuth();
  const location = useLocation();

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    academics: true,
    examination: false,
    studentAffairs: false,
    documentCenter: isStaff,
    account: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const isCurrent = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-label="Close navigation overlay"
          className="lg:hidden fixed inset-0 top-[70px] z-40 bg-[#061a30]/70 backdrop-blur-xs transition-opacity cursor-pointer"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="sidebarMenu"
        className={`fixed top-[70px] z-50 w-[260px] h-[calc(100vh-70px)] bg-[#061a30] text-[#cdd8ee] border-r border-white/10 overflow-y-auto sidebar-scroll transition-all duration-300 ease-in-out ${
          isOpen ? 'left-0 shadow-2xl' : '-left-[270px]'
        }`}
      >
        {/* Mobile Header with Close Button */}
        <div className="lg:hidden flex items-center justify-between px-3.5 py-3 border-b border-white/10 bg-[#0b2a4a]/90 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-white p-0.5 flex items-center justify-center shrink-0">
              <img src="/kit-logo.png" alt="KIT" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs font-bold text-white tracking-tight truncate">KIT Navigation Menu</span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-3 px-2.5 space-y-1">
          {/* Top Menu: Dashboard */}
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isCurrent('/dashboard')
                  ? 'bg-[#12365e] text-white font-semibold'
                  : 'text-slate-200 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-white shrink-0" />
              <span>Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/"
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isCurrent('/')
                  ? 'bg-[#12365e] text-white font-semibold'
                  : 'text-slate-200 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-white shrink-0" />
              <span>Home Portal</span>
            </Link>
          )}

          {/* Section: Academics (Matching KIT CMS) */}
          <div>
            <button
              onClick={() => toggleSection('academics')}
              type="button"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                openSections.academics
                  ? 'bg-[#12365e] text-white'
                  : 'text-slate-200 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-white shrink-0" />
                <span>Academics</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 text-slate-300 ${
                  openSections.academics ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            {openSections.academics && (
              <div className="mt-1 space-y-0.5">
                <Link
                  to="/resources"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-md text-xs sm:text-[13px] font-normal transition-colors ${
                    isCurrent('/resources') && !location.search
                      ? 'text-white font-semibold bg-[#1a4b7d]/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>Academic Resources</span>
                </Link>
                <Link
                  to="/resources?type=LECTURE_NOTE"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-md text-xs sm:text-[13px] font-normal transition-colors ${
                    location.search.includes('type=LECTURE_NOTE')
                      ? 'text-white font-semibold bg-[#1a4b7d]/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>Lecture Notes & Slides</span>
                </Link>
                <Link
                  to="/resources?type=LECTURE_PDF"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-md text-xs sm:text-[13px] font-normal transition-colors ${
                    location.search.includes('type=LECTURE_PDF')
                      ? 'text-white font-semibold bg-[#1a4b7d]/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>Course PDFs & Handouts</span>
                </Link>
              </div>
            )}
          </div>

          {/* Section: Examination Center */}
          <div>
            <button
              onClick={() => toggleSection('examination')}
              type="button"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                openSections.examination
                  ? 'bg-[#12365e] text-white'
                  : 'text-slate-200 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCheck className="w-4 h-4 text-white shrink-0" />
                <span>Examination</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 text-slate-300 ${
                  openSections.examination ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            {openSections.examination && (
              <div className="mt-1 space-y-0.5">
                <Link
                  to="/past-papers"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-md text-xs sm:text-[13px] font-normal transition-colors ${
                    isCurrent('/past-papers') && !location.search
                      ? 'text-white font-semibold bg-[#1a4b7d]/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>All Past Papers (PU/UET)</span>
                </Link>
                <Link
                  to="/past-papers?solved=true"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-md text-xs sm:text-[13px] font-normal transition-colors ${
                    location.search.includes('solved=true')
                      ? 'text-white font-semibold bg-[#1a4b7d]/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Solved Papers</span>
                </Link>
                <Link
                  to="/past-papers?solved=false"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-md text-xs sm:text-[13px] font-normal transition-colors ${
                    location.search.includes('solved=false')
                      ? 'text-white font-semibold bg-[#1a4b7d]/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>Unsolved Papers</span>
                </Link>
              </div>
            )}
          </div>

          {/* Section: Student Affairs (Matching KIT CMS) */}
          <div>
            <button
              onClick={() => toggleSection('studentAffairs')}
              type="button"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                openSections.studentAffairs
                  ? 'bg-[#12365e] text-white'
                  : 'text-slate-200 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-white shrink-0" />
                <span>Student Affairs</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 text-slate-300 ${
                  openSections.studentAffairs ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            {openSections.studentAffairs && (
              <div className="mt-1 space-y-0.5">
                <Link
                  to="/requests"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-md text-xs sm:text-[13px] font-normal transition-colors ${
                    isCurrent('/requests') && !location.search.includes('tab=history')
                      ? 'text-white font-semibold bg-[#1a4b7d]/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Request Missing Material</span>
                </Link>
                <Link
                  to="/requests?tab=history"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-md text-xs sm:text-[13px] font-normal transition-colors ${
                    location.search.includes('tab=history')
                      ? 'text-white font-semibold bg-[#1a4b7d]/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Inquiries & Responses</span>
                </Link>
              </div>
            )}
          </div>

          {/* Section: Document Center (Matching KIT CMS, for Admin / CR / GR) */}
          {isStaff && (
            <div>
              <button
                onClick={() => toggleSection('documentCenter')}
                type="button"
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  openSections.documentCenter
                    ? 'bg-[#12365e] text-white'
                    : 'text-slate-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-4 h-4 text-[#cd7f32] shrink-0" />
                  <span className="text-[#cd7f32] font-semibold">Document Center</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 text-[#cd7f32] ${
                    openSections.documentCenter ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openSections.documentCenter && (
                <div className="mt-1 space-y-0.5">
                  {!isContentManager && (
                    <Link
                      to="/admin?tab=stats"
                      onClick={onClose}
                      className={`flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-md text-xs sm:text-[13px] font-normal transition-colors ${
                        location.pathname === '/admin' && (location.search.includes('tab=stats') || !location.search)
                          ? 'text-white font-semibold bg-[#1a4b7d]/40'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                      <span>Portal Statistics</span>
                    </Link>
                  )}

                  <Link
                    to="/admin?tab=resources"
                    onClick={onClose}
                    className={`flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-md text-xs sm:text-[13px] font-normal transition-colors ${
                      location.pathname === '/admin' && location.search.includes('tab=resources')
                        ? 'text-white font-semibold bg-[#1a4b7d]/40'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5 shrink-0" />
                    <span>Upload & Manage Files</span>
                  </Link>

                  {!isContentManager && (
                    <>
                      <Link
                        to="/admin?tab=users"
                        onClick={onClose}
                        className={`flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-md text-xs sm:text-[13px] font-normal transition-colors ${
                          location.pathname === '/admin' && location.search.includes('tab=users')
                            ? 'text-white font-semibold bg-[#1a4b7d]/40'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        <span>Manage CR / GR & Users</span>
                      </Link>

                      <Link
                        to="/admin?tab=academic"
                        onClick={onClose}
                        className={`flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-md text-xs sm:text-[13px] font-normal transition-colors ${
                          location.pathname === '/admin' && location.search.includes('tab=academic')
                            ? 'text-white font-semibold bg-[#1a4b7d]/40'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 shrink-0" />
                        <span>Academic Setup</span>
                      </Link>

                      <Link
                        to="/admin?tab=settings"
                        onClick={onClose}
                        className={`flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-md text-xs sm:text-[13px] font-normal transition-colors ${
                          location.pathname === '/admin' && location.search.includes('tab=settings')
                            ? 'text-white font-semibold bg-[#1a4b7d]/40'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <SettingsIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>Portal Configuration</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section: Account & Info */}
          <div className="pt-2 border-t border-white/10">
            {isAuthenticated && (
              <Link
                to="/profile"
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isCurrent('/profile')
                    ? 'bg-[#12365e] text-white font-semibold'
                    : 'text-slate-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                <UserIcon className="w-4 h-4 text-white shrink-0" />
                <span>My Profile</span>
              </Link>
            )}

            <Link
              to="/about"
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isCurrent('/about')
                  ? 'bg-[#12365e] text-white font-semibold'
                  : 'text-slate-200 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Info className="w-4 h-4 text-white shrink-0" />
              <span>About Platform</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};
