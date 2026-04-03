// ─── FileUpload Component ─────────────────────────────────────────────────────
// Drag-and-drop or click-to-upload with preview/filename display.

import React, { useRef, useState } from 'react';
import Button from './Button';

/**
 * FileUpload — Accepts images and documents, shows previews.
 *
 * @param {string}   accept     - MIME types (default: images + pdf + docs)
 * @param {boolean}  multiple   - allow multiple file selection
 * @param {function} onFiles    - callback with File[] array
 * @param {string}   label      - section label
 */
export default function FileUpload({
  accept = 'image/*,.pdf,.doc,.docx,.xlsx,.csv',
  multiple = true,
  onFiles,
  label = 'Upload Files',
}) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  /** Handle files from input or drop */
  const handleFiles = (incoming) => {
    const arr = Array.from(incoming);
    const enriched = arr.map((f) => ({
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }));
    setFiles((prev) => (multiple ? [...prev, ...enriched] : enriched));
    if (onFiles) onFiles(multiple ? [...files.map((f) => f.file), ...arr] : arr);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-xs font-mono uppercase tracking-wide text-slate">{label}</p>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={[
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer',
          'transition-all duration-200 select-none',
          dragOver
            ? 'border-ink bg-fog'
            : 'border-silver hover:border-slate hover:bg-snow',
        ].join(' ')}
      >
        <div className="text-3xl mb-2">📁</div>
        <p className="text-sm text-slate font-body">
          <span className="font-medium text-ink">Click to browse</span> or drag files here
        </p>
        <p className="text-xs text-muted mt-1">Images, PDFs, Word, Excel supported</p>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-fog animate-fade-in"
            >
              {/* Image preview or icon */}
              {f.preview ? (
                <img
                  src={f.preview}
                  alt={f.name}
                  className="w-10 h-10 object-cover rounded-md border border-fog"
                />
              ) : (
                <div className="w-10 h-10 rounded-md bg-fog flex items-center justify-center text-lg">
                  {f.name.endsWith('.pdf') ? '📄' : '📎'}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{f.name}</p>
                <p className="text-xs text-muted">{formatSize(f.size)}</p>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                className="text-muted hover:text-ink transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setFiles([]); if (onFiles) onFiles([]); }}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
