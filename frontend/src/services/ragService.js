// ─── RAG Service ──────────────────────────────────────────────────────────────
// Stateless SOP Q&A — /api/rag/* routes.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `Request failed (${res.status})`);
  return data;
}

export const ragService = {
  /**
   * POST /api/rag/ask
   * Ask a question across a company's SOP documents.
   * Body: { question, companyId, fileIds? }
   */
  ask: (question, companyId, fileIds = []) =>
    apiFetch('/rag/ask', {
      method: 'POST',
      body: JSON.stringify({ question, companyId, ...(fileIds.length ? { fileIds } : {}) }),
    }),

  /**
   * POST /api/rag/ask-file/:fileId
   * Ask a question scoped to a single SOP file.
   * Body: { question, companyId }
   */
  askFile: (fileId, question, companyId) =>
    apiFetch(`/rag/ask-file/${fileId}`, {
      method: 'POST',
      body: JSON.stringify({ question, companyId }),
    }),
};
