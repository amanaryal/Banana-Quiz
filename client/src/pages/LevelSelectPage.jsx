/*
 * Purpose: Three level cards. Starting a game asks the server to fetch a puzzle.
 * Theme: Event-driven programming and interoperability
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api.js';
import { GAME_MODES } from '../constants/gameModes.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LevelSelectPage() {
  const navigate = useNavigate();
  const { clearSession } = useAuth();
  const [best, setBest] = useState({ easy: 0, medium: 0, hard: 0 });
  const [error, setError] = useState('');
  const [starting, setStarting] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadBest() {
      const result = await api('/api/scores/me');

      if (cancelled) {
        return;
      }

      if (result.status === 401) {
        clearSession();
        return;
      }

      if (result.ok && result.data.profile) {
        setBest(result.data.profile.bestByDifficulty);
      }
    }

    loadBest();

    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  // EVENT: onClick (level card) -> HANDLER: handleStart -> RESULT: a 10-round game begins
  async function handleStart(difficulty) {
    setError('');
    setStarting(difficulty);

    const result = await api('/api/game/start', {
      method: 'POST',
      body: { difficulty }
    });

    setStarting('');

    if (result.status === 401) {
      clearSession();
      return;
    }

    if (!result.ok) {
      setError(result.data.message || 'Banana service is down, try again.');
      return;
    }

    navigate('/game', { state: { game: result.data.game } });
  }

  return (
    <section>
      <div className="page-title">
        <h1>Choose a level</h1>
        <p className="lead">Ten rounds. The clock, lives, and points come from the server, not from the picture service.</p>
      </div>
      {error ? <p className="message error" role="alert">{error}</p> : null}
      <div className="level-grid">
        {GAME_MODES.map((mode) => (
          <article key={mode.id} className={'level-card ' + mode.id}>
            <p className="level-emoji" aria-hidden="true">{mode.id === 'hard' ? '🔥' : mode.id === 'medium' ? '🍌' : '😊'}</p>
            <h2>{mode.label}</h2>
            <div className="chip-row">
              <span className="chip">{mode.seconds}s</span>
              <span className="chip">{mode.lives} {mode.lives === 1 ? 'life' : 'lives'}</span>
              <span className="chip">{mode.hints} {mode.hints === 1 ? 'hint' : 'hints'}</span>
            </div>
            <p className="best">Best score: {best[mode.id] || 0}</p>
            <button type="button" disabled={Boolean(starting)} onClick={() => handleStart(mode.id)}>
              {starting === mode.id ? 'Starting...' : 'Play'}
            </button>
          </article>
        ))}
      </div>
      <section className="card how-to">
        <h2>How to play</h2>
        <ol>
          <li>Look at the puzzle.</li>
          <li>Find the missing digit (the banana).</li>
          <li>Answer before the timer ends.</li>
        </ol>
      </section>
    </section>
  );
}
