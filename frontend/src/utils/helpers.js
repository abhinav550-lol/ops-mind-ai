// ─── Utility Helpers ─────────────────────────────────────────────────────────

/** Format a date string to readable format */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/** Get initials from a full name */
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/** Map file status to badge color classes */
export const statusColor = (status) => {
  const map = {
    ready: 'bg-green-100 text-green-700',
    processing: 'bg-blue-100 text-blue-700',
    failed: 'bg-red-100 text-red-600',
    uploaded: 'bg-gray-100 text-gray-600',
  };
  return map[status] || 'bg-fog text-slate';
};
