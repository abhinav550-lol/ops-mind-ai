// ─── Company Dashboard ────────────────────────────────────────────────────────
// Overview for company admins: SOP upload stats, recent uploads, quick actions.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { filesApi } from '../../services/api';
import { StatCard } from '../../components/Card';
import Button from '../../components/Button';
import IngestionStatusBadge from '../../components/files/IngestionStatusBadge';
import { formatDate } from '../../utils/helpers';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    filesApi
      .getMyUploads()
      .then((d) => setFiles(d?.data || []))
      .catch((err) => setError(err.message || 'Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const readyCount = files.filter((f) => f.status === 'ready').length;
  const processingCount = files.filter((f) => !['ready', 'failed'].includes(f.status)).length;
  const failedCount = files.filter((f) => f.status === 'failed').length;
  const recentFiles = [...files].slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const fileIcon = (mime = '') => {
    if (mime.startsWith('image/')) return '🖼️';
    if (mime.includes('pdf')) return '📄';
    return '📎';
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-muted mt-1">
            {loading
              ? 'Loading your dashboard…'
              : `${files.length} SOP document${files.length !== 1 ? 's' : ''} in your workspace.`}
          </p>
        </div>
        <Link to="/company/uploads">
          <Button size="sm">Upload SOPs</Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total SOPs" value={loading ? '—' : files.length} sub="All uploaded" icon="📁" />
        <StatCard label="Ready" value={loading ? '—' : readyCount} sub="Fully processed" icon="✅" />
        <StatCard label="Processing" value={loading ? '—' : processingCount} sub="In pipeline" icon="⏳" />
        <StatCard label="Failed" value={loading ? '—' : failedCount} sub="Need attention" icon="❌" />
      </div>

      {/* Recent uploads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-display font-semibold text-ink">Recent Uploads</h2>
            <p className="text-xs text-muted mt-0.5">Latest SOP documents added to your workspace</p>
          </div>
          <Link to="/company/uploads">
            <Button variant="ghost" size="sm">See all →</Button>
          </Link>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-fog rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && recentFiles.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-fog">
            <p className="text-2xl mb-2">📄</p>
            <p className="text-sm font-medium text-ink">No SOPs uploaded yet</p>
            <p className="text-xs text-muted mt-1">Upload your first SOP to get started.</p>
          </div>
        )}

        {!loading && recentFiles.length > 0 && (
          <div className="bg-white rounded-xl border border-fog shadow-card divide-y divide-fog">
            {recentFiles.map((f) => (
              <div key={f._id} className="flex items-center gap-3 p-4 hover:bg-snow transition-colors">
                <div className="w-9 h-9 rounded-lg bg-fog flex items-center justify-center text-lg shrink-0">
                  {fileIcon(f.mimeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink truncate">{f.originalName}</p>
                  <p className="text-xs text-muted mt-0.5">{formatDate(f.createdAt)}</p>
                </div>
                <IngestionStatusBadge status={f.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/company/uploads', icon: '📁', title: 'Upload SOPs', desc: 'Add new SOP documents to your workspace.' },
          { to: '/chat', icon: '💬', title: 'Chat with SOPs', desc: 'AI-powered Q&A across your documents.' },
          { to: '/quick-ask', icon: '⚡', title: 'Quick Ask', desc: 'Get instant answers from your SOPs.' },
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
