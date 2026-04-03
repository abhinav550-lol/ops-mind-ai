// ─── ChatPage ─────────────────────────────────────────────────────────────────
// Full RAG chat UI: sidebar (chat list) + chat window.
// Now supports companyId from URL params for scoped SOP querying.

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { chatService } from '../services/chatService';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('companyId');

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(() => {
    chatService
      .getMyChats()
      .then((d) => {
        const list = d?.data || [];
        setChats(list);
        if (list.length > 0 && !activeChatId) {
          setActiveChatId(list[0]._id);
        }
      })
      .catch(() => setChats([]))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  useEffect(() => { fetchChats(); }, [fetchChats]);

  const handleNewChat = (chat) => {
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat._id);
  };

  const handleDelete = async (chatId) => {
    if (!window.confirm('Delete this chat and all its messages?')) return;
    try {
      await chatService.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChatId === chatId) {
        const remaining = chats.filter((c) => c._id !== chatId);
        setActiveChatId(remaining.length > 0 ? remaining[0]._id : null);
      }
    } catch { /* ignore */ }
  };

  const handleTitleUpdate = (chatId, newTitle) => {
    setChats((prev) =>
      prev.map((c) => (c._id === chatId ? { ...c, title: newTitle } : c))
    );
  };

  return (
    <div className="flex h-full -m-6 animate-fade-in">
      {/* Sidebar */}
      {loading ? (
        <div className="w-64 bg-white border-r border-fog flex items-center justify-center text-muted text-xs">
          Loading chats…
        </div>
      ) : (
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelect={setActiveChatId}
          onNewChat={handleNewChat}
          onDelete={handleDelete}
          defaultCompanyId={companyId}
        />
      )}

      {/* Chat window */}
      <div className="flex-1 flex flex-col min-w-0 bg-snow">
        {activeChatId && (
          <div className="h-14 bg-white border-b border-fog flex items-center px-5 shrink-0">
            <div>
              <p className="text-sm font-semibold text-ink">
                {chats.find((c) => c._id === activeChatId)?.title || 'Chat'}
              </p>
              <p className="text-xs text-muted">Ask questions about company SOP documents</p>
            </div>
          </div>
        )}

        <ChatWindow chatId={activeChatId} onTitleUpdate={handleTitleUpdate} />
      </div>
    </div>
  );
}
