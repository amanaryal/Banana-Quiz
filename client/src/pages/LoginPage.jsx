/*
 * Purpose: Login form with a show-password toggle.
 * Theme: Virtual identity and event-driven programming
 */

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { checkEmail, checkPassword } from '../constants/validation.js';

export default function LoginPage() {
  const { user, loading, setLoggedInUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const notice = location.state && location.state.message ? location.state.message : '';
  const emailHint = email ? checkEmail(email) : '';
  const passwordHint = password ? checkPassword(password) : '';

  useEffect(() => {
    if (!loading && user) {
      navigate('/play');
    }
  }, [loading, user, navigate]);

  // EVENT: onClick (show password) -> HANDLER: setShowPassword -> RESULT: password text is visible or hidden
  function handleTogglePassword() {
    setShowPassword((current) => !current);
  }

  // EVENT: onSubmit -> HANDLER: handleLogin -> RESULT: cookie set by the server, level page opens
  async function handleLogin(event) {
    event.preventDefault();
    const emailError = checkEmail(email);
    const passwordError = checkPassword(password);

    if (emailError || passwordError) {
      setError(emailError || passwordError);
      return;
    }

    setError('');
    setSubmitting(true);

    const result = await api('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.data.message || 'Could not log in.');
      return;
    }

    setLoggedInUser(result.data.user);
    navigate('/play');
  }

  return (
    <section className="card auth-card">
      <p className="eyebrow">🍌 Banana Quiz</p>
      <h1>Log in</h1>
      <p className="lead">Use the email and password from registration. Scores are saved only after you log in.</p>
      {notice ? <p className="message ok" role="status">{notice}</p> : null}

      <form className="stack" onSubmit={handleLogin}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
        {emailHint ? <p className="field-hint">{emailHint}</p> : null}

        <label htmlFor="password">Password</label>
        <div className="password-row">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
          <button type="button" className="secondary" onClick={handleTogglePassword}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {passwordHint ? <p className="field-hint">{passwordHint}</p> : null}

        {error ? <p className="message error" role="alert">{error}</p> : null}
        <button type="submit" disabled={submitting}>{submitting ? 'Logging in...' : 'Log in'}</button>
      </form>

      <p className="switch-link">No account yet? <Link to="/register">Register</Link></p>
    </section>
  );
}
