// ─── IngestionStatusBadge ─────────────────────────────────────────────────────
// Displays the current file ingestion pipeline status as a coloured badge.

import React from 'react';

const STATUS_MAP = {
  uploaded:        { label: 'Queued',           cls: 'bg-gray-100 text-gray-600' },
  extracting_text: { label: 'Extracting text…', cls: 'bg-blue-100 text-blue-700' },
  chunking:        { label: 'Chunking…',         cls: 'bg-blue-100 text-blue-700' },
  embedding:       { label: 'Embedding…',        cls: 'bg-purple-100 text-purple-700' },
  ready:           { label: 'Ready ✓',           cls: 'bg-green-100 text-green-700' },
  failed:          { label: 'Failed ✗',          cls: 'bg-red-100 text-red-600' },
};

export default function IngestionStatusBadge({ status }) {
  const { label, cls } = STATUS_MAP[status] || { label: status, cls: 'bg-gray-100 text-gray-500' };
  return (
    <span className={`badge ${cls}`}>{label}</span>
  );
}
