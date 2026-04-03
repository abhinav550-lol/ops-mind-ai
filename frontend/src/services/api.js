// ─── API Service ──────────────────────────────────────────────────────────────
// Central place for all HTTP calls to the backend.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Core fetch wrapper — attaches credentials (cookies) and handles JSON errors.
 */
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed (${res.status})`);
  }

  return data;
}

/**
 * Multipart fetch wrapper — used for file uploads.
 */
async function apiUpload(path, formData, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || `Upload failed (${res.status})`);
  }

  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// USER ROUTES  (/api/user/*)
// ─────────────────────────────────────────────────────────────────────────────

export const userApi = {
  /** POST /api/user/register */
  register: (name, email, password, role) =>
    apiFetch('/user/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  /** POST /api/user/login */
  login: (email, password) =>
    apiFetch('/user/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  /** POST /api/user/logout */
  logout: () =>
    apiFetch('/user/logout', { method: 'POST' }),

  /** GET /api/user/me */
  me: () =>
    apiFetch('/user/me'),

  /** GET /api/user/companies — list all company accounts */
  getCompanies: () =>
    apiFetch('/user/companies'),
};

// ─────────────────────────────────────────────────────────────────────────────
// FILE ROUTES  (/api/files/*)
// ─────────────────────────────────────────────────────────────────────────────

export const filesApi = {
  /**
   * POST /api/files/upload
   * Company-only. Uploads a single SOP file.
   */
  uploadSingle: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiUpload('/files/upload', fd);
  },

  /**
   * POST /api/files/upload-multiple
   * Company-only. Uploads multiple SOP files.
   */
  uploadMultiple: (files) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    return apiUpload('/files/upload-multiple', fd);
  },

  /**
   * GET /api/files/my-uploads
   * Company-only. Returns SOPs uploaded by the logged-in company.
   */
  getMyUploads: () =>
    apiFetch('/files/my-uploads'),

  /**
   * GET /api/files/company/:companyId
   * Returns all ready SOPs for a specific company (for users to browse).
   */
  getCompanyFiles: (companyId) =>
    apiFetch(`/files/company/${companyId}`),

  /**
   * GET /api/files/:id
   * Returns metadata for a single file by its ID.
   */
  getById: (id) =>
    apiFetch(`/files/${id}`),

  /**
   * DELETE /api/files/:id
   * Company-only. Deletes an SOP and all its related chunks.
   */
  deleteFile: (id) =>
    apiFetch(`/files/${id}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────────────────────────────────────
// RAG ROUTES  (/api/rag/*)
// ─────────────────────────────────────────────────────────────────────────────

export const ragApi = {
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
