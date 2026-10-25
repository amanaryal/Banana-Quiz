/*
 * Purpose: A small dialog used for quit and logout confirmation.
 * Theme: Event-driven programming
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 */

export default function Modal({ open, title, children, onClose }) {
  if (!open) {
    return null;
  }

  // EVENT: onClick (backdrop) -> HANDLER: onClose -> RESULT: modal closes
  return (
    <div className="modal-back" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
