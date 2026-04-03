// ─── Card Component ───────────────────────────────────────────────────────────
// Base card wrapper used throughout the dashboard.

import React from 'react';

/**
 * Card — Wrapper with optional title, subtitle, and action slot.
 *
 * @param {string} title     - card heading
 * @param {string} subtitle  - smaller subtext below title
 * @param {node}   action    - optional top-right element (button, badge, etc.)
 * @param {string} className - additional Tailwind classes
 * @param {bool}   hover     - enables lift-on-hover effect (default true)
 */
export default function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
  hover = true,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={[
        'bg-white rounded-xl border border-fog shadow-card p-5',
        hover ? 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5' : '',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {/* Card header */}
      {(title || action) && (
        <div className="flex items-start justify-between mb-4 gap-2">
          <div>
            {title && (
              <h3 className="font-display text-base font-semibold text-ink leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-muted mt-0.5 font-body">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {children}
    </div>
  );
}

/** StatCard — small metric tile */
export function StatCard({ label, value, sub, icon }) {
  return (
    <div className="bg-white rounded-xl border border-fog shadow-card p-5 flex items-start gap-4">
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-ink/5 flex items-center justify-center text-lg shrink-0">
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs text-muted font-mono uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-display font-semibold text-ink mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
      </div>
    </div>
  );
}
