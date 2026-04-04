// ─── Company Detail Page ──────────────────────────────────────────────────────
// User views a specific company's SOPs and can chat/query them.

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { filesApi } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import RagAsk from '../../components/RagAsk';
import IngestionStatusBadge from '../../components/files/IngestionStatusBadge';
import Button from '../../components/Button';

export default function CompanyDetail() {
  const { companyId } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ragFile, setRagFile] = useState(null);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    setError('');
    setRagFile(null);

    filesApi
      .getCompanyFiles(companyId)
      .then((data) => setFiles(data?.data || []))
      .catch((err) => { setError(err.message); setFiles([]); })
      .finally(() => setLoading(false));
  }, [companyId]);

  const fileIcon = (mimetype = '') => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.includes('pdf')) return '📄';
    return '📎';
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link to="/user/companies" className="text-xs text-muted hover:text-ink mb-2 inline-block">
            ← Back to companies
          </Link>
          <h1 className="text-2xl font-display font-semibold text-ink">Company SOPs</h1>
          <p className="text-sm text-muted mt-1">
            {loading ? 'Loading…' : `${files.length} SOP document${files.length !== 1 ? 's' : ''} available`}
          </p>
        </div>
        <Link to={`/chat?companyId=${companyId}`}>
          <Button size="sm">Chat with SOPs</Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* File list */}
        <div className="bg-white rounded-xl border border-fog shadow-card p-6 space-y-5">
          <div>
            <h2 className="text-base font-display font-semibold text-ink">SOP Documents</h2>
            <p className="text-xs text-muted mt-0.5">Click a document to query it with AI.</p>
          </div>

          {loading && (
            <div className="py-8 text-center">
              <div className="inline-block w-5 h-5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-muted mt-2">Loading SOPs…</p>
            </div>
          )}

          {!loading && files.length === 0 && (
            <div className="text-center py-10 text-muted">
              <div className="text-3xl mb-2">📂</div>
              <p className="text-sm">No SOPs uploaded by this company yet.</p>
            </div>
          )}

          {!loading && files.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted font-mono">{files.length} SOP{files.length !== 1 ? 's' : ''}</p>
              {files.map((f) => {
                const fId = f._id ?? f.id;
                const isSelected = ragFile?.id === fId;
                return (
                  <div
                    key={fId}
                    onClick={() => setRagFile(isSelected ? null : { id: fId, name: f.originalName ?? 'File' })}
                    className={[
                      'flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all',
                      isSelected ? 'border-ink bg-fog' : 'border-fog hover:bg-snow',
                    ].join(' ')}
                  >
                    <div className="w-9 h-9 rounded-lg bg-fog flex items-center justify-center text-lg shrink-0">
                      {fileIcon(f.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink truncate">{f.originalName ?? 'Unnamed file'}</p>
                      <p className="text-xs text-muted mt-0.5">{formatDate(f.createdAt)}</p>
                    </div>
                    <span className={`text-xs font-mono ${isSelected ? 'text-ink' : 'text-muted'}`}>
                      {isSelected ? 'Selected ✓' : 'Ask AI'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RAG panel */}
        <div className="bg-white rounded-xl border border-fog shadow-card p-6 space-y-5">
          <div>
            <h2 className="text-base font-display font-semibold text-ink">AI SOP Query</h2>
            <p className="text-xs text-muted mt-0.5">
              {ragFile
                ? `Asking about: ${ragFile.name}`
                : 'Select a document to query it, or ask across all SOPs.'}
            </p>
          </div>

          <RagAsk
            fileId={ragFile?.id ?? null}
            fileName={ragFile?.name ?? null}
            companyId={companyId}
          />
        </div>
      </div>
    </div>
  );
}
