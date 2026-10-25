/*
 * Purpose: Shows a short message at the bottom of the screen, then removes it.
 * Theme: Event-driven programming
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 */

import { createContext, useContext, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function pushToast(message) {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2800);
  }

  return (
    <ToastContext.Provider value={pushToast}>
      {children}
      <div className="toast-wrap" aria-live="polite">
        {toasts.map((toast) => (
          <p key={toast.id} className="toast" role="status">{toast.message}</p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const pushToast = useContext(ToastContext);

  if (!pushToast) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return pushToast;
}
