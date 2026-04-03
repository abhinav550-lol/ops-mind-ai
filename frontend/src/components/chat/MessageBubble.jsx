// ─── MessageBubble ────────────────────────────────────────────────────────────
// Renders a single chat message (user or assistant) with optional sources.

import React, { useState } from 'react';

export default function MessageBubble({ message }) {
  const { role, content, sources } = message;
  const isUser = role === 'user';
  const [showSources, setShowSources] = useState(false);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-ink text-white rounded-tr-sm'
              : 'bg-white border border-fog text-ink rounded-tl-sm shadow-sm'
          }`}
        >
          {content}
        </div>

        {/* Sources (assistant only) */}
        {!isUser && sources?.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowSources((v) => !v)}
              className="text-xs text-muted hover:text-ink transition-colors flex items-center gap-1"
            >
              <span>{showSources ? '▾' : '▸'}</span>
              {sources.length} source{sources.length !== 1 ? 's' : ''}
            </button>

            {showSources && (
              <div className="mt-1.5 space-y-1.5">
                {sources.map((src, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-fog bg-white p-3 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-ink truncate">{src.fileName}</span>
                      {src.score !== undefined && (
                        <span className="badge bg-green-100 text-green-700 ml-2 shrink-0">
                          {Math.round(src.score * 100)}%
                        </span>
                      )}
                    </div>
                    <p className="text-muted leading-relaxed line-clamp-3">{src.preview}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
