import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AppLayout } from './components/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { PastPapersPage } from './pages/PastPapersPage';
import { RequestsPage } from './pages/RequestsPage';
import { AboutPage } from './pages/AboutPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; staffOnly?: boolean }> = ({
  children,
  staffOnly = false,
}) => {
  const { isAuthenticated, isLoading, isStaff } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-[#0b2a4a] border-t-[#cd7f32] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Verifying institutional credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (staffOnly && !isStaff) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
            {/* Public Pages with KIT CMS Layout */}
            <Route
              path="/"
              element={
                <AppLayout>
                  <LandingPage />
                </AppLayout>
              }
            />
            <Route
              path="/resources"
              element={
                <AppLayout>
                  <ResourcesPage />
                </AppLayout>
              }
            />
            <Route
              path="/past-papers"
              element={
                <AppLayout>
                  <PastPapersPage />
                </AppLayout>
              }
            />
            <Route
              path="/requests"
              element={
                <AppLayout>
                  <RequestsPage />
                </AppLayout>
              }
            />
            <Route
              path="/about"
              element={
                <AppLayout>
                  <AboutPage />
                </AppLayout>
              }
            />

            {/* Authentication Pages (Clean Standalone Portal View) */}
            <Route
              path="/login"
              element={
                <AppLayout showSidebar={false}>
                  <LoginPage />
                </AppLayout>
              }
            />
            <Route
              path="/register"
              element={
                <AppLayout showSidebar={false}>
                  <RegisterPage />
                </AppLayout>
              }
            />

            {/* Authenticated Student Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProfilePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Administrative Staff Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute staffOnly>
                  <AppLayout>
                    <AdminPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
