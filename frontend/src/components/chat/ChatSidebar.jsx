// ─── ChatSidebar ──────────────────────────────────────────────────────────────
// Lists all user chats; handles new chat creation. Now supports company selection.

import React, { useState, useEffect } from 'react';
import { chatService } from '../../services/chatService';
import { userApi, filesApi } from '../../services/api';
import Button from '../Button';

export default function ChatSidebar({ chats, activeChatId, onSelect, onNewChat, onDelete, defaultCompanyId }) {
  const [showNewModal, setShowNewModal] = useState(false);

  return (
    <div className="w-64 shrink-0 bg-white border-r border-fog flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-fog shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-display font-semibold text-ink">Chats</h2>
          <button
            onClick={() => setShowNewModal(true)}
            className="w-7 h-7 rounded-lg bg-ink text-white flex items-center justify-center text-lg hover:bg-graphite transition-colors"
            title="New Chat"
          >
            +
          </button>
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chats.length === 0 && (
          <p className="text-xs text-muted text-center py-8 px-4">
            No chats yet. Start a new one to query company SOPs.
          </p>
        )}
        {chats.map((chat) => (
          <div
            key={chat._id}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
              chat._id === activeChatId ? 'bg-ink text-white' : 'hover:bg-fog text-ink'
            }`}
            onClick={() => onSelect(chat._id)}
          >
            <span className={`text-lg shrink-0`}>💬</span>
            <p className="text-xs font-medium truncate flex-1">{chat.title || 'New Chat'}</p>
            <button
              className={`opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1 rounded ${
                chat._id === activeChatId ? 'text-white hover:text-red-300' : 'text-muted hover:text-red-500'
              }`}
              onClick={(e) => { e.stopPropagation(); onDelete(chat._id); }}
              title="Delete chat"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* New Chat Modal */}
      {showNewModal && (
        <NewChatModal
          onClose={() => setShowNewModal(false)}
          onCreated={(chat) => { onNewChat(chat); setShowNewModal(false); }}
          defaultCompanyId={defaultCompanyId}
        />
      )}
    </div>
  );
}

// ── Inline New Chat Modal ─────────────────────────────────────────────────────
function NewChatModal({ onClose, onCreated, defaultCompanyId }) {
  const [title, setTitle] = useState('');
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(defaultCompanyId || '');
  const [files, setFiles] = useState([]);
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load companies
  useEffect(() => {
    userApi.getCompanies()
      .then((d) => setCompanies(d?.data || []))
      .catch(() => setCompanies([]))
      .finally(() => setLoadingCompanies(false));
  }, []);

  // Load files when company changes
  useEffect(() => {
    if (!selectedCompanyId) { setFiles([]); return; }
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

  const handleCreate = async () => {
    if (!selectedCompanyId) {
      setError('Please select a company.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await chatService.createChat({
        title: title.trim() || undefined,
        companyId: selectedCompanyId,
        fileIds: selectedFileIds.length ? selectedFileIds : undefined,
      });
      onCreated(res.data);
    } catch (err) {
      setError(err.message || 'Failed to create chat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-fog">
          <h3 className="text-base font-display font-semibold text-ink">New Chat</h3>
          <button onClick={onClose} className="text-muted hover:text-ink text-xl">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
              Chat Title (optional)
            </label>
            <input
              className="w-full rounded-lg border border-fog px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-ink transition-colors"
              placeholder="Will be auto-set from first message"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Company selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
              Company *
            </label>
            {loadingCompanies ? (
              <p className="text-xs text-muted">Loading companies…</p>
            ) : (
              <select
                value={selectedCompanyId}
                onChange={(e) => { setSelectedCompanyId(e.target.value); setSelectedFileIds([]); }}
                className="w-full rounded-lg border border-fog px-3 py-2.5 text-sm text-ink focus:border-ink transition-colors bg-white"
              >
                <option value="">Select a company…</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* File scope */}
          {selectedCompanyId && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Scope to SOPs (optional — empty = all company SOPs)
              </label>
              {loadingFiles ? (
                <p className="text-xs text-muted">Loading SOPs…</p>
              ) : files.length === 0 ? (
                <p className="text-xs text-muted">No ready SOPs for this company.</p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {files.map((f) => (
                    <label
                      key={f._id}
                      className="flex items-center gap-2.5 p-2 rounded-lg border border-fog hover:bg-snow cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFileIds.includes(f._id)}
                        onChange={() => toggleFile(f._id)}
                        className="accent-ink"
                      />
                      <span className="text-xs text-ink">{f.originalName}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-fog text-sm font-medium text-slate hover:bg-fog transition-colors"
            >
              Cancel
            </button>
            <Button onClick={handleCreate} loading={loading} className="flex-1">
              Create Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
