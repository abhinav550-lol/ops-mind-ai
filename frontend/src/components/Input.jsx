// ─── Input Component ──────────────────────────────────────────────────────────
// Wraps label + input + error into a single block for clean forms.

import React from 'react';

/**
 * Input — Label + input field with optional error and left/right icon slots.
 *
 * @param {string}  label     - visible label text
 * @param {string}  error     - error message (shows below input in red)
 * @param {node}    leftIcon  - icon rendered inside left edge
 * @param {string}  className - extra classes for the wrapper div
 */
export default function Input({
  label,
  error,
  leftIcon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-slate tracking-wide uppercase font-mono"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* Optional left icon */}
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          className={[
            'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink',
            'placeholder:text-silver font-body',
            'transition-all duration-200',
            'focus:ring-2 focus:ring-ink/10 focus:border-ink',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-fog hover:border-silver',
            leftIcon ? 'pl-10' : '',
          ].join(' ')}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 font-body">{error}</p>
      )}
    </div>
  );
}
