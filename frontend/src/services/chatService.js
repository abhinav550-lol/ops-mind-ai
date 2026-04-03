// ─── Chat Service ─────────────────────────────────────────────────────────────
// All chat-related API calls — /api/chat/* routes.

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

export const chatService = {
  /**
   * POST /api/chat
   * Create a new chat session scoped to a company's SOPs.
   * Body: { companyId, title?, fileIds? }
   */
  createChat: (payload = {}) =>
    apiFetch('/chat', { method: 'POST', body: JSON.stringify(payload) }),

  /** GET /api/chat — all chats for the logged-in user */
  getMyChats: () => apiFetch('/chat'),

  /** GET /api/chat/:chatId/messages */
  getChatMessages: (chatId) => apiFetch(`/chat/${chatId}/messages`),

  /**
   * POST /api/chat/:chatId/message
   * Send a question; receive RAG-grounded answer from company SOPs.
   */
  sendMessage: (chatId, question) =>
    apiFetch(`/chat/${chatId}/message`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),

  /** DELETE /api/chat/:chatId */
  deleteChat: (chatId) =>
    apiFetch(`/chat/${chatId}`, { method: 'DELETE' }),
};
