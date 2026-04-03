// ─── Button Component ─────────────────────────────────────────────────────────
// Variants: primary (black), secondary (outline), ghost, danger

import React from 'react';

const variants = {
  primary: 'bg-ink text-white hover:bg-graphite active:bg-ash border border-transparent',
  secondary: 'bg-white text-ink border border-fog hover:border-silver hover:bg-snow active:bg-fog',
  ghost: 'bg-transparent text-slate hover:bg-fog hover:text-ink border border-transparent',
  danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

/**
 * Button — Reusable button with variant, size, loading, icon support.
 *
 * @param {string}  variant   - 'primary' | 'secondary' | 'ghost' | 'danger'
 * @param {string}  size      - 'sm' | 'md' | 'lg'
 * @param {boolean} loading   - shows spinner when true
 * @param {node}    icon      - optional leading icon
 * @param {string}  className - additional Tailwind classes
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon = null,
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center rounded-lg font-body font-medium',
        'transition-all duration-200 select-none cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
    </svg>
  );
}
