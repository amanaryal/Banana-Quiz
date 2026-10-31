/*
 * Purpose: Register form. Names with spaces are allowed. Any non-empty password is allowed.
 * Theme: Virtual identity and event-driven programming
 *
 * The plain password is sent once to our server, which hashes it. It is not stored in the browser.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/api.js';
import { checkEmail, checkPassword, checkUsername } from '../constants/validation.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const usernameHint = username ? checkUsername(username) : '';
  const emailHint = email ? checkEmail(email) : '';
  const passwordHint = password ? checkPassword(password) : '';

  // EVENT: onSubmit -> HANDLER: handleRegister -> RESULT: account created, login page opens
  async function handleRegister(event) {
    event.preventDefault();
    const usernameError = checkUsername(username);
    const emailError = checkEmail(email);
    const passwordError = checkPassword(password);

    if (usernameError || emailError || passwordError) {
      setError(usernameError || emailError || passwordError);
      return;
    }

    setError('');
    setSubmitting(true);

    const result = await api('/api/auth/register', {
      method: 'POST',
      body: { username, email, password }
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.data.message || 'Could not register.');
      return;
    }

    navigate('/login', { state: { message: 'Account created. Please log in.' } });
  }

  return (
    <section className="card auth-card">
      <p className="eyebrow">🍌 Banana Quiz</p>
      <h1>Create an account</h1>
      <p className="lead">Use your name, an email, and any password you can remember. A short password is allowed.</p>

      <form className="stack" onSubmit={handleRegister}>
        <label htmlFor="username">Username</label>
        <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
        <p className={usernameHint ? 'field-hint' : 'field-hint good'}>
          {usernameHint || (username ? 'Looks good. Example: Aman Aryal' : 'Example: Aman Aryal')}
        </p>

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
            autoComplete="new-password"
          />
          {/* EVENT: onClick (show password) -> HANDLER: setShowPassword -> RESULT: password text is visible or hidden */}
          <button type="button" className="secondary" onClick={() => setShowPassword((current) => !current)}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {passwordHint ? <p className="field-hint">{passwordHint}</p> : null}

        {error ? <p className="message error" role="alert">{error}</p> : null}
        <button type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Register'}</button>
      </form>

      <p className="switch-link">Already registered? <Link to="/login">Log in</Link></p>
    </section>
  );
}
