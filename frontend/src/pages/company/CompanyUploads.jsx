// ─── Company Uploads Page ─────────────────────────────────────────────────────
// Upload and manage SOP documents for the company.

import React, { useState, useEffect, useRef } from 'react';
import { filesApi } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import Button from '../../components/Button';
import IngestionStatusBadge from '../../components/files/IngestionStatusBadge';

export default function CompanyUploads() {
  const [pickedFiles, setPickedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [submitErr, setSubmitErr] = useState('');
  const inputRef = useRef(null);

  const [myUploads, setMyUploads] = useState([]);
  const [uploadsLoading, setUploadsLoading] = useState(true);
  const [uploadsErr, setUploadsErr] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    setUploadsLoading(true);
    filesApi
      .getMyUploads()
      .then((data) => setMyUploads(data?.data || []))
      .catch((err) => setUploadsErr(err.message))
      .finally(() => setUploadsLoading(false));
  }, []);

  useEffect(() => {
    const built = pickedFiles.map((f) => ({
      name: f.name,
      size: f.size,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }));
    setPreviews(built);
    return () => built.forEach((b) => b.preview && URL.revokeObjectURL(b.preview));
  }, [pickedFiles]);

  const addFiles = (incoming) => setPickedFiles((prev) => [...prev, ...Array.from(incoming)]);
  const removeFile = (idx) => setPickedFiles((prev) => prev.filter((_, i) => i !== idx));

  const formatSize = (b) => {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async () => {
    if (pickedFiles.length === 0) return;
    setSubmitting(true);
    setSubmitMsg('');
    setSubmitErr('');

    try {
      if (pickedFiles.length === 1) {
        await filesApi.uploadSingle(pickedFiles[0]);
      } else {
        await filesApi.uploadMultiple(pickedFiles);
      }

      setSubmitMsg(`✅ ${pickedFiles.length} SOP${pickedFiles.length > 1 ? 's' : ''} uploaded successfully!`);
      setPickedFiles([]);

      const data = await filesApi.getMyUploads();
      setMyUploads(data?.data || []);
    } catch (err) {
      setSubmitErr(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fileIcon = (mimetype = '') => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.includes('pdf')) return '📄';
    return '📎';
  };

  const handleDelete = async (fileId, fileName) => {
    if (!window.confirm(`Delete "${fileName}"? This will permanently remove the SOP and all its indexed data. This action cannot be undone.`)) return;
    setDeletingId(fileId);
    try {
      await filesApi.deleteFile(fileId);
      setMyUploads((prev) => prev.filter((f) => f._id !== fileId));
      setSubmitMsg(`🗑️ "${fileName}" deleted successfully.`);
    } catch (err) {
      setUploadsErr(err.message || 'Failed to delete file.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-2xl font-display font-semibold text-ink">Upload SOPs</h1>
        <p className="text-sm text-muted mt-1">
          Upload Standard Operating Procedure documents for your users to query.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload form */}
        <div className="bg-white rounded-xl border border-fog shadow-card p-6 space-y-5">
          <div>
            <h2 className="text-base font-display font-semibold text-ink">New Upload</h2>
            <p className="text-xs text-muted mt-0.5">Upload SOP documents (PDF, DOCX, TXT, etc.)</p>
          </div>

          {/* Drop zone */}
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-slate mb-2">Files</p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              onClick={() => inputRef.current?.click()}
              className={[
                'border-2 border-dashed rounded-xl p-7 text-center cursor-pointer',
                'transition-all duration-200 select-none',
                dragOver ? 'border-ink bg-fog' : 'border-silver hover:border-slate hover:bg-snow',
              ].join(' ')}
            >
              <div className="text-3xl mb-2">📁</div>
              <p className="text-sm text-slate">
                <span className="font-medium text-ink">Click to browse</span> or drag files here
              </p>
              <p className="text-xs text-muted mt-1">PDF, Word, Excel, Text — multiple files OK</p>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xlsx,.csv,.txt"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {previews.length > 0 && (
              <div className="mt-3 space-y-2">
                {previews.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 bg-snow rounded-lg border border-fog animate-fade-in">
                    <div className="w-9 h-9 rounded-md bg-fog flex items-center justify-center text-base shrink-0">📎</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink truncate">{p.name}</p>
                      <p className="text-xs text-muted">{formatSize(p.size)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                      className="text-muted hover:text-ink text-lg leading-none"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {submitMsg && (
            <div className="p-3 rounded-lg bg-fog border border-silver/50 text-xs text-ink text-center animate-fade-in">
              {submitMsg}
            </div>
          )}

          {submitErr && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100">
              <p className="text-xs text-red-600">{submitErr}</p>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleSubmit}
            loading={submitting}
            disabled={pickedFiles.length === 0}
          >
            {pickedFiles.length > 1 ? `Upload ${pickedFiles.length} SOPs` : 'Upload SOP'}
          </Button>
        </div>

        {/* Past uploads */}
        <div className="bg-white rounded-xl border border-fog shadow-card p-6">
          <div className="mb-4">
            <h2 className="text-base font-display font-semibold text-ink">My SOPs</h2>
            <p className="text-xs text-muted mt-0.5">All SOP documents you have uploaded.</p>
          </div>

          {uploadsLoading && (
            <div className="py-8 text-center">
              <div className="inline-block w-5 h-5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-muted mt-2">Loading…</p>
            </div>
          )}

          {uploadsErr && !uploadsLoading && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100">
              <p className="text-xs text-red-600">{uploadsErr}</p>
            </div>
          )}

          {!uploadsLoading && !uploadsErr && myUploads.length === 0 && (
            <div className="text-center py-10 text-muted">
              <div className="text-3xl mb-2">📂</div>
              <p className="text-sm">No SOPs uploaded yet.</p>
            </div>
          )}

          <div className="space-y-3">
            {myUploads.map((f) => (
              <div key={f._id} className={`flex items-center gap-3 p-3.5 rounded-lg border border-fog hover:bg-snow transition-colors ${deletingId === f._id ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="w-9 h-9 rounded-lg bg-fog flex items-center justify-center text-lg shrink-0">
                  {fileIcon(f.mimeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink truncate">{f.originalName}</p>
                  <p className="text-xs text-muted mt-0.5">{formatDate(f.createdAt)}</p>
                  <div className="mt-1"><IngestionStatusBadge status={f.status} /></div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`http://localhost:3000/${f.filePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-ink underline underline-offset-2 hover:text-slate"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(f._id, f.originalName)}
                    disabled={deletingId === f._id}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors px-1.5 py-1 rounded hover:bg-red-50"
                    title="Delete SOP"
                  >
                    {deletingId === f._id ? '…' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
