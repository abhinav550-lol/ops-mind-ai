// ─── User Dashboard ───────────────────────────────────────────────────────────
// User home page: browse companies, select one, and query their SOPs.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { userApi } from '../../services/api';
import { StatCard } from '../../components/Card';
import Button from '../../components/Button';
import { formatDate } from '../../utils/helpers';

export default function UserDashboard() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userApi
      .getCompanies()
      .then((d) => setCompanies(d?.data || []))
      .catch((err) => setError(err.message || 'Failed to load companies.'))
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-muted mt-1">
            Browse companies and query their SOP documents with AI.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/user/companies">
            <Button variant="secondary" size="sm">Browse Companies</Button>
          </Link>
          <Link to="/chat">
            <Button size="sm">Chat with SOPs</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Companies" value={loading ? '—' : companies.length} sub="Available to query" icon="🏢" />
        <StatCard label="AI Chat" value="💬" sub="Ask questions to SOPs" icon="" />
        <StatCard label="Quick Ask" value="⚡" sub="Instant one-shot Q&A" icon="" />
      </div>

      {/* Companies list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-display font-semibold text-ink">Available Companies</h2>
            <p className="text-xs text-muted mt-0.5">Select a company to explore their SOPs</p>
          </div>
          <Link to="/user/companies">
            <Button variant="ghost" size="sm">View all →</Button>
          </Link>
        </div>

        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-fog rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && companies.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-fog">
            <p className="text-2xl mb-2">🏢</p>
            <p className="text-sm font-medium text-ink">No companies available yet</p>
            <p className="text-xs text-muted mt-1">Companies will appear here once they register and upload SOPs.</p>
          </div>
        )}

        {!loading && companies.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.slice(0, 6).map((company) => (
              <Link key={company._id} to={`/user/companies/${company._id}`}>
                <div className="bg-white rounded-xl border border-fog shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 p-5 h-full">
                  <div className="w-10 h-10 rounded-lg bg-fog flex items-center justify-center text-lg mb-3">🏢</div>
                  <h3 className="text-sm font-semibold text-ink font-body">{company.name}</h3>
                  <p className="text-xs text-muted mt-1">{company.email}</p>
                  <p className="text-xs text-muted mt-0.5">Joined {formatDate(company.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/user/companies', icon: '🏢', title: 'Browse Companies', desc: 'Find companies and explore their SOPs.' },
          { to: '/chat', icon: '💬', title: 'Chat with SOPs', desc: 'AI-powered Q&A across company documents.' },
          { to: '/quick-ask', icon: '⚡', title: 'Quick Ask', desc: 'Get instant answers from company SOPs.' },
        ].map((item) => (
          <Link key={item.to} to={item.to}>
            <div className="bg-white rounded-xl border border-fog shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 p-5 h-full">
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="text-sm font-semibold text-ink font-body">{item.title}</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
