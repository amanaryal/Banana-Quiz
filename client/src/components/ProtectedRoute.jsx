/*
 * Purpose: Sends a logged-out visitor to the login page.
 * Theme: Virtual identity
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="status">Checking who is logged in...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
