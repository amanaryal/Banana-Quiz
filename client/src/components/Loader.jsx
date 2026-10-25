/*
 * Purpose: Loading text and grey placeholder bars.
 * Theme: Event-driven programming
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 */

export function Loader({ label }) {
  return <p className="status" role="status">{label || 'Loading...'}</p>;
}

export function Skeleton({ count }) {
  const rows = count || 3;

  return (
    <div className="skeleton-stack" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton" />
      ))}
    </div>
  );
}
