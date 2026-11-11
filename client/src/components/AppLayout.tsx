import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, showSidebar = true }) => {
  // On desktop (>= 1024px), default open. On mobile (< 1024px), default closed.
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024 && showSidebar;
    }
    return showSidebar;
  });

  const location = useLocation();

  // Close mobile drawer automatically when user navigates to a new page
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname, location.search]);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-[#cd7f32] selection:text-white">
      {/* Fixed 70px Header */}
      <Navbar
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={sidebarOpen}
      />

      {/* Header spacer so content never sits beneath the 70px fixed navbar */}
      <div className="h-[70px] shrink-0" aria-hidden="true" />

      {/* Main Layout Area */}
      {showSidebar ? (
        <div className="layout-wrapper flex-1 flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main
            className={`layout-main flex-1 min-w-0 bg-[#f8fafc] flex flex-col justify-between ${
              sidebarOpen ? 'with-sidebar' : 'collapsed-sidebar'
            }`}
          >
            <div className="flex-1">
              {children}
            </div>
            {/* Institutional sub-footer inside layout-main */}
            <footer className="mt-14 pt-6 pb-2 border-t border-slate-200/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>
                © {new Date().getFullYear()} <strong className="text-slate-700 font-semibold">Khanpur Institute of Technology</strong>. All Rights Reserved.
              </p>
              <p className="text-[11px] text-slate-400">
                KIT Helping Hand • Academic Resource Portal
              </p>
            </footer>
          </main>
        </div>
      ) : (
        <div className="layout-wrapper flex-1 flex relative">
          {/* Drawer for non-sidebar pages (e.g. login/register) when menu button clicked */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="layout-main collapsed-sidebar flex-1 min-w-0 flex flex-col justify-between bg-white">
            <div className="flex-1">
              {children}
            </div>
            <footer className="py-4 bg-[#061a30] text-center text-xs text-white/50 border-t border-white/10">
              © {new Date().getFullYear()} Khanpur Institute of Technology • Academic Resource System
            </footer>
          </main>
        </div>
      )}
    </div>
  );
};

