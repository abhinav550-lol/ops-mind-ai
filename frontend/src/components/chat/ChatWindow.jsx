// ─── ChatWindow ───────────────────────────────────────────────────────────────
// Full chat interface: loads messages, handles send, shows typing indicator.

import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../../services/chatService';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ chatId, onTitleUpdate }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  // Load messages when chatId changes
  useEffect(() => {
    if (!chatId) return;
    setMessages([]);
    setError('');
    setFetching(true);
    chatService.getChatMessages(chatId)
      .then((d) => setMessages(d?.data || []))
      .catch((err) => setError(err.message || 'Failed to load messages.'))
      .finally(() => setFetching(false));
  }, [chatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const q = question.trim();
    if (!q || loading) return;

    // Optimistic user message
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setQuestion('');
    setLoading(true);
    setError('');

    try {
      const res = await chatService.sendMessage(chatId, q);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.answer, sources: res.sources || [] },
      ]);
      // Update sidebar title if auto-set
      if (res.chatTitle && onTitleUpdate) {
        onTitleUpdate(chatId, res.chatTitle);
      }
    } catch (err) {
      setError(err.message || 'Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center text-center text-muted p-8">
        <div>
          <p className="text-4xl mb-4">💬</p>
          <p className="text-sm font-medium text-ink mb-1">Select a chat to get started</p>
          <p className="text-xs">Or create a new one from the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {fetching && (
          <p className="text-xs text-center text-muted py-8">Loading messages…</p>
        )}

        {!fetching && messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center text-muted">
            <div>
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-sm font-medium text-ink mb-1">No messages yet</p>
              <p className="text-xs">Ask a question below to query your documents.</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-fog rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-silver animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-md p-3 rounded-lg bg-red-50 border border-red-100 mb-3">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-fog bg-white p-4">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            className="flex-1 rounded-xl border border-fog px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-ink transition-colors bg-snow"
            placeholder="Ask a question about your documents…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="px-5 py-2.5 rounded-xl bg-ink text-white text-sm font-medium hover:bg-graphite transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
