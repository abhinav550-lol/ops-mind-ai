// ─── App.jsx ──────────────────────────────────────────────────────────────────
// Root component: sets up AuthProvider + React Router with role-based routes.

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// Company Pages
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyUploads   from './pages/company/CompanyUploads';

// User Pages
import UserDashboard   from './pages/user/UserDashboard';
import CompanyBrowser   from './pages/user/CompanyBrowser';
import CompanyDetail    from './pages/user/CompanyDetail';

// Shared Pages (both roles)
import ChatPage    from './pages/ChatPage';
import QuickAskPage from './pages/QuickAskPage';

// Guards
import ProtectedRoute from './components/ProtectedRoute';

// ── Root redirect: send to correct dashboard if logged in ─────────────────────
function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'company' ? '/company/dashboard' : '/user/dashboard'} replace />;
}

// ── Company route wrapper ─────────────────────────────────────────────────────
function CompanyRoute({ children }) {
  return (
    <ProtectedRoute requiredRole="company">
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

// ── User route wrapper ────────────────────────────────────────────────────────
function UserRoute({ children }) {
  return (
    <ProtectedRoute requiredRole="user">
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

// ── Shared route (any authenticated role) ─────────────────────────────────────
function SharedRoute({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"        element={<RootRedirect />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/signup"  element={<Signup />} />

          {/* ── Company routes ── */}
          <Route path="/company/dashboard" element={<CompanyRoute><CompanyDashboard /></CompanyRoute>} />
          <Route path="/company/uploads"   element={<CompanyRoute><CompanyUploads /></CompanyRoute>} />

          {/* ── User routes ── */}
          <Route path="/user/dashboard"              element={<UserRoute><UserDashboard /></UserRoute>} />
          <Route path="/user/companies"              element={<UserRoute><CompanyBrowser /></UserRoute>} />
          <Route path="/user/companies/:companyId"   element={<UserRoute><CompanyDetail /></UserRoute>} />

          {/* ── Shared routes (both roles) ── */}
          <Route path="/chat"      element={<SharedRoute><ChatPage /></SharedRoute>} />
          <Route path="/quick-ask" element={<SharedRoute><QuickAskPage /></SharedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
