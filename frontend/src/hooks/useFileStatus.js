// ─── useFileStatus hook ───────────────────────────────────────────────────────
// Polls GET /api/files/:id every 4 seconds until ingestion is finished.

import { useState, useEffect } from 'react';
import { filesApi } from '../services/api';

/**
 * @param {string|null} fileId  - MongoDB _id of the file to track
 * @returns {object|null}       - Latest file document from the backend
 */
export function useFileStatus(fileId) {
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!fileId) return;

    // Immediate first fetch
    filesApi.getById(fileId).then((data) => setFile(data?.data ?? null)).catch(() => {});

    const interval = setInterval(async () => {
      try {
        const data = await filesApi.getById(fileId);
        const doc = data?.data ?? null;
        setFile(doc);
        if (doc && ['ready', 'failed'].includes(doc.status)) {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [fileId]);

  return file;
}
