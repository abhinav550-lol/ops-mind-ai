// ─── DashboardLayout ─────────────────────────────────────────────────────────
// Sidebar + top bar layout wrapping all dashboard pages.

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { getInitials } from '../utils/helpers';

// ── Nav items per role ────────────────────────────────────────────────────────
const COMPANY_NAV = [
  { to: '/company/dashboard', label: 'Overview',       icon: GridIcon },
  { to: '/company/uploads',   label: 'Upload SOPs',    icon: UploadIcon },
  { to: '/chat',              label: 'Chat with SOPs', icon: ChatIcon },
  { to: '/quick-ask',         label: 'Quick Ask',      icon: BoltIcon },
];

const USER_NAV = [
  { to: '/user/dashboard',  label: 'Overview',         icon: GridIcon },
  { to: '/user/companies',  label: 'Browse Companies', icon: CompanyIcon },
  { to: '/chat',            label: 'Chat with SOPs',   icon: ChatIcon },
  { to: '/quick-ask',       label: 'Quick Ask',        icon: BoltIcon },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = user?.role === 'company' ? COMPANY_NAV : USER_NAV;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-snow overflow-hidden">
      {/* ── Overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-ink/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={[
          'fixed lg:static inset-y-0 left-0 z-30 w-60 bg-white border-r border-fog',
          'flex flex-col transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-fog shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-display font-bold font-sans">O</span>
            </div>
            <div>
              <p className="text-sm font-display font-semibold text-ink leading-none">OpsMindAI</p>
              <p className="text-xs text-muted leading-none mt-0.5">
                {user?.role === 'company' ? 'Company Portal' : 'User Portal'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-mono uppercase tracking-widest text-muted px-3 mb-3">
            Menu
          </p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User card at bottom */}
        <div className="p-3 border-t border-fog shrink-0">
          <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-fog transition-colors">
            <div className="w-8 h-8 rounded-full bg-graphite text-white text-xs font-semibold flex items-center justify-center font-display shrink-0">
              {getInitials(user?.name || 'U')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ink truncate">{user?.name || user?.email}</p>
              <p className="text-xs text-muted capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-muted hover:text-ink transition-colors"
            >
              <LogoutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-fog flex items-center px-5 gap-4 shrink-0">
          <button
            className="lg:hidden text-slate hover:text-ink"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="badge bg-fog text-slate capitalize hidden sm:inline-flex">
              {user?.name}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function GridIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  );
}

function CompanyIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function UploadIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function LogoutIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function MenuIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function ChatIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function BoltIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
