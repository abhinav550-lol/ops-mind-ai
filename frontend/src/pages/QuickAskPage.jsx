// ─── QuickAskPage ─────────────────────────────────────────────────────────────
// Stateless one-shot RAG Q&A scoped to a company's SOPs.

import React, { useState, useEffect } from 'react';
import { ragService } from '../services/ragService';
import { userApi, filesApi } from '../services/api';

export default function QuickAskPage() {
  const [question, setQuestion] = useState('');
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showFilePicker, setShowFilePicker] = useState(false);

  // Load companies on mount
  useEffect(() => {
    userApi.getCompanies()
      .then((d) => setCompanies(d?.data || []))
      .catch(() => setCompanies([]));
  }, []);

  // Load SOPs when company changes
  useEffect(() => {
    if (!selectedCompanyId) { setFiles([]); setSelectedFileIds([]); return; }
    setLoadingFiles(true);
    filesApi.getCompanyFiles(selectedCompanyId)
      .then((d) => setFiles((d?.data || []).filter((f) => f.status === 'ready')))
      .catch(() => setFiles([]))
      .finally(() => setLoadingFiles(false));
  }, [selectedCompanyId]);

  const toggleFile = (id) =>
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleAsk = async (e) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || !selectedCompanyId) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await ragService.ask(q, selectedCompanyId, selectedFileIds);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to get an answer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-ink">Quick Ask</h1>
        <p className="text-sm text-muted mt-1">
          Instant one-shot Q&amp;A across company SOPs — no conversation history.
          For follow-up questions, use the{' '}
          <a href="/chat" className="text-ink underline underline-offset-2">Chat</a> page.
        </p>
      </div>

      {/* Ask form */}
      <div className="bg-white rounded-xl border border-fog shadow-card p-6">
        <form onSubmit={handleAsk} className="space-y-4">
          {/* Company selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
              Company *
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => { setSelectedCompanyId(e.target.value); setSelectedFileIds([]); }}
              className="w-full rounded-xl border border-fog px-4 py-2.5 text-sm text-ink bg-snow focus:border-ink transition-colors"
            >
              <option value="">Select a company…</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
              Your Question
            </label>
            <textarea
              className="w-full rounded-xl border border-fog px-4 py-3 text-sm text-ink placeholder:text-muted resize-none focus:border-ink transition-colors bg-snow"
              rows={3}
              placeholder="e.g. What is the process for handling customer complaints?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* File scope toggle */}
          {files.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowFilePicker((v) => !v)}
                className="text-xs text-slate hover:text-ink transition-colors flex items-center gap-1"
              >
                <span>{showFilePicker ? '▾' : '▸'}</span>
                Scope to specific SOPs{' '}
                {selectedFileIds.length > 0 && (
                  <span className="badge bg-ink text-white ml-1">{selectedFileIds.length}</span>
                )}
              </button>

              {showFilePicker && (
                <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto pl-3 border-l-2 border-fog">
                  {files.map((f) => (
                    <label
                      key={f._id}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFileIds.includes(f._id)}
                        onChange={() => toggleFile(f._id)}
                        className="accent-ink"
                      />
                      <span className="text-xs text-ink group-hover:text-ink/80 truncate">
                        {f.originalName}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={!question.trim() || !selectedCompanyId || loading}
            className="w-full py-2.5 rounded-xl bg-ink text-white text-sm font-medium hover:bg-graphite transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Thinking…
              </>
            ) : (
              '→ Ask'
            )}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Answer */}
      {result && (
        <div className="space-y-4 animate-slide-up">
          <div className="bg-white rounded-xl border border-fog shadow-card p-6">
            <p className="text-xs font-mono uppercase tracking-wide text-muted mb-3">Answer</p>
            <p className="text-sm text-ink leading-relaxed">{result.answer}</p>
          </div>

          {result.sources?.length > 0 && (
            <div className="bg-white rounded-xl border border-fog shadow-card p-6">
              <p className="text-xs font-mono uppercase tracking-wide text-muted mb-3">
                Sources ({result.sources.length})
              </p>
              <div className="space-y-3">
                {result.sources.map((src, i) => (
                  <div key={i} className="p-3 rounded-lg border border-fog bg-snow">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-ink">{src.fileName}</span>
                      {src.score !== undefined && (
                        <span className="badge bg-green-100 text-green-700">
                          {Math.round(src.score * 100)}% match
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{src.preview}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.sources?.length === 0 && (
            <p className="text-xs text-muted text-center">
              No specific sources found — answer based on general knowledge.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
