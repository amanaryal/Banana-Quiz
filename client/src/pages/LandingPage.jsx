/*
 * Purpose: The home page. Play now and three short steps.
 * Theme: Event-driven programming
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">10 rounds · 3 levels</p>
        <h1>Find the missing digit.</h1>
        <p className="lead">
          A picture hides one number. You guess it before the timer runs out.
          The server keeps the answer. You only see the picture.
        </p>
        <div className="button-row">
          <Link className="button-link" to={user ? '/play' : '/login'}>Play now</Link>
          <Link className="button-link secondary" to={user ? '/leaderboard' : '/login'}>Leaderboard</Link>
        </div>
        {!user ? (
          <p className="switch-link">
            Have an account? <Link to="/login">Log in</Link> · New player? <Link to="/register">Register</Link>
          </p>
        ) : null}
      </div>

      <div className="hero-art" aria-hidden="true">
        <svg viewBox="0 0 160 160" className="banana-svg">
          <path d="M40 90c10-40 40-60 80-50 8 2 10 12 4 18-18 16-30 40-24 62 2 8-8 16-16 12-30-14-52-18-44-42z" fill="#f0b429" />
          <path d="M108 48c8 2 14 10 10 18" fill="none" stroke="#6b4f2a" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      <ol className="steps">
        <li><strong>1. Pick a level.</strong> Easy gives you a minute. Hard gives you 15 seconds.</li>
        <li><strong>2. Read the picture.</strong> Tap a digit or use the keyboard.</li>
        <li><strong>3. Keep a streak.</strong> Three in a row scores more. Five in a row scores double.</li>
      </ol>
    </section>
  );
}
