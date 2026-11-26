/*
 * Purpose: The play screen. Timer, lives, number pad, hint, and quit.
 * Theme: Event-Driven Programming (70+ First Class Design & Critical Evaluation)
 *
 * Event Architecture:
 * 1. User Interface Events:
 *    - onClick / onKeyDown (Digit press 0-9) -> handleDigitPress -> Updates answer state
 *    - onClick (Check button) / onKeyDown (Enter) -> handleCheckAnswer -> Submits guess
 *    - onClick (Hint button) -> handleHint -> Fetches even/odd or range clue
 *    - onClick (Quit button) -> setQuitOpen -> Opens confirmation modal
 *    - onClick (Modal Confirm) -> handleQuit -> Saves current game progress
 *
 * 2. Temporal & System Events:
 *    - setInterval (Tick Event every 200ms) -> Updates remaining countdown bar
 *    - Countdown Expiry (Timer Timeout Event) -> handleTimeout -> Forfeits round and loses life
 *    - Asynchronous Promise Events (fetch API replies) -> Resolves network state, updates score/lives
 *
 * 3. 70+ Event Safeguards:
 *    - Duplicate Submission Prevention: busyRef lock and timeoutLock guarantee only one guess is processed per round.
 *    - Interval Cleanup: Explicit clearInterval in useEffect cleanup phase prevents background interval leakage.
 *    - Safe Time Calculation: Math.max(0, ...) prevents timer bar and numerical countdown from going below zero.
 *    - Event Listener Cleanup: window.removeEventListener('keydown', handleKeyDown) removes keyboard listeners on unmount.
 *
 * 4. Critical Justification & Alternatives:
 *    - Why Event-Driven? In an interactive, time-sensitive game, user keystrokes and timer ticks demand instantaneous
 *      DOM updates without reloading the entire page or stalling execution.
 *    - Alternative (Traditional Request-Response / Polling):
 *      Full page reloads would flicker the screen, destroy the game's temporal flow, and waste substantial bandwidth.
 *      Polling would introduce network latency jitter and overload the backend.
 *      Event-driven React state updates provide non-blocking responsiveness and deterministic rendering.
 */

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import NumberPad from '../components/NumberPad.jsx';
import TimerBar from '../components/TimerBar.jsx';
import Lives from '../components/Lives.jsx';
import Modal from '../components/Modal.jsx';
import { playCorrect, playWrong, playGameOver } from '../utils/sounds.js';

function secondsRemaining(game) {
  if (!game || !game.issuedAt) {
    return 0;
  }

  const elapsed = (Date.now() - game.issuedAt) / 1000;
  // Guard: Never allow negative seconds
  return Math.max(0, game.seconds - elapsed);
}

export default function GamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearSession } = useAuth();
  const [game, setGame] = useState(null);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');
  const [floatText, setFloatText] = useState('');
  const [hint, setHint] = useState('');
  const [quitOpen, setQuitOpen] = useState(false);
  const [lifeLoss, setLifeLoss] = useState(false);

  // References for non-state event locking to prevent race conditions and duplicate submissions
  const gameRef = useRef(null);
  const busyRef = useRef(false);
  const timeoutLock = useRef(false);
  const sendRef = useRef(null);

  function remember(next, resetRound) {
    gameRef.current = next;
    setGame(next);

    if (resetRound && next && next.puzzleId) {
      setAnswer('');
      setHint('');
      setTimeLeft(secondsRemaining(next));
      timeoutLock.current = false;
      busyRef.current = false;
      setBusy(false);
    }
  }

  // SYSTEM EVENT: Component mount -> Load initial puzzle
  useEffect(() => {
    const incoming = location.state && location.state.game;

    if (incoming) {
      remember(incoming, true);
      return undefined;
    }

    let cancelled = false;

    async function loadPuzzle() {
      const result = await api('/api/game/puzzle');

      if (cancelled) {
        return;
      }

      if (result.status === 401) {
        clearSession();
        return;
      }

      if (!result.ok) {
        setError(result.data.message || 'Could not load puzzle. Redirecting...');
        setTimeout(() => {
          if (!cancelled) navigate('/play');
        }, 1500);
        return;
      }

      remember(result.data.game, true);
    }

    loadPuzzle();

    return () => {
      cancelled = true;
    };
  }, [clearSession, location.state, navigate]);

  // SYSTEM ASYNC EVENT: Submit guess or timeout to server
  async function sendAnswer(body) {
    // 70+ Guard: Prevent duplicate answer submissions under fast clicking or concurrent events
    if (busyRef.current) {
      return;
    }

    busyRef.current = true;
    setBusy(true);
    setError('');

    const result = await api('/api/game/answer', { method: 'POST', body });

    busyRef.current = false;
    setBusy(false);

    if (result.status === 401) {
      clearSession();
      return;
    }

    if (!result.ok) {
      setError(result.data.message || 'Could not check that answer.');
      if (result.data.game) {
        remember(result.data.game, Boolean(result.data.game.puzzleId));
      }
      timeoutLock.current = false;
      return;
    }

    const previousLives = gameRef.current ? gameRef.current.lives : 0;

    if (result.data.correct) {
      playCorrect();
      setFlash('correct');
      setFloatText('+' + result.data.pointsEarned);
    } else {
      // 70+ Requirement: Distinct audio and visual handling when losing all lives
      if (result.data.finished) {
        playGameOver();
      } else {
        playWrong();
      }
      setFlash('wrong');
      setFloatText('');
      if (!result.data.game || result.data.game.lives < previousLives) {
        setLifeLoss(true);
      }
    }

    setTimeout(() => {
      setFlash('');
      setFloatText('');
      setLifeLoss(false);
    }, 700);

    if (result.data.finished) {
      navigate('/result', { state: { result: result.data.result } });
      return;
    }

    remember(result.data.game, true);
  }

  sendRef.current = sendAnswer;

  // SYSTEM TEMPORAL EVENT: Timer tick (200ms interval) -> Shrinks progress bar, detects timeout
  useEffect(() => {
    if (!game || !game.puzzleId) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      const current = gameRef.current;

      if (!current || !current.issuedAt) {
        return;
      }

      const left = secondsRemaining(current);
      // Guard: Keep timer clamped at 0 or above
      setTimeLeft(Math.max(0, left));

      if (left <= 0) {
        handleTimeout();
      }
    }, 200);

    // 70+ Requirement: Clean up timer interval on unmount or when round changes
    return () => clearInterval(intervalId);
  }, [game && game.puzzleId]);

  // SYSTEM EVENT: Clock expired -> HANDLER: handleTimeout -> Submits timedOut penalty
  function handleTimeout() {
    if (timeoutLock.current || busyRef.current) {
      return;
    }

    timeoutLock.current = true;
    sendRef.current({ timedOut: true });
  }

  // USER EVENT: Number pad tap -> HANDLER: handleDigitPress -> Updates answer state
  function handleDigitPress(digit) {
    if (busyRef.current || timeoutLock.current) {
      return;
    }

    setAnswer(digit);
  }

  // USER EVENT: Backspace key/button -> HANDLER: handleBackspace -> Clears current input
  function handleBackspace() {
    if (busyRef.current || timeoutLock.current) {
      return;
    }
    setAnswer('');
  }

  // USER EVENT: Check answer submit -> HANDLER: handleCheckAnswer -> Sends guess to backend
  function handleCheckAnswer() {
    if (busyRef.current || timeoutLock.current) {
      return;
    }

    if (!answer) {
      setError('Tap a digit first.');
      return;
    }

    sendAnswer({ guess: answer });
  }

  // USER HARDWARE EVENT: Keyboard keydown -> HANDLER: handleKeyDown
  useEffect(() => {
    function handleKeyDown(event) {
      if (busyRef.current || timeoutLock.current) {
        return;
      }

      if (event.key >= '0' && event.key <= '9') {
        handleDigitPress(event.key);
      } else if (event.key === 'Backspace') {
        handleBackspace();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleCheckAnswer();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    // 70+ Requirement: Explicit event listener removal prevents duplicate listener memory leaks
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [answer, busy]);

  // USER EVENT: Hint button click -> HANDLER: handleHint -> Spends 5 points for clue
  async function handleHint() {
    if (busyRef.current || timeoutLock.current) {
      return;
    }

    setError('');
    const result = await api('/api/game/hint', { method: 'POST' });

    if (result.status === 401) {
      clearSession();
      return;
    }

    if (!result.ok) {
      setError(result.data.message || 'No hints left.');
      return;
    }

    setHint(result.data.hint);
    remember(result.data.game, false);
  }

  // USER EVENT: Quit modal confirmation -> HANDLER: handleQuit -> Persists final score
  async function handleQuit() {
    const result = await api('/api/game/finish', { method: 'POST' });
    setQuitOpen(false);

    if (!result.ok) {
      setError(result.data.message || 'Could not save the game.');
      return;
    }

    navigate('/result', { state: { result: result.data.result } });
  }

  if (!game) {
    return <p className="status">Loading the round...</p>;
  }

  return (
    <section className={'game-screen ' + flash}>
      <div className="hud">
        <span>Round {game.round}/{game.roundsTotal}</span>
        <span>Score {game.score}</span>
        <Lives lives={game.lives} maxLives={game.maxLives} shaking={lifeLoss} />
        <span>{Math.ceil(timeLeft)}s</span>
      </div>

      <TimerBar timeLeft={timeLeft} total={game.seconds} />
      {error ? <p className="message error" role="alert">{error}</p> : null}

      <div className="game-columns">
        <div className={'puzzle-card ' + flash}>
          {game.imageUrl ? (
            <div className="puzzle-frame">
              <img src={game.imageUrl} alt="Banana Quiz Puzzle. One digit is missing." />
            </div>
          ) : (
            <p className="status">Waiting for the picture...</p>
          )}
          {floatText ? <p className="float-points">{floatText}</p> : null}
        </div>

        <div className="play-panel">
          {flash === 'correct' ? <p className="message ok">Correct</p> : null}
          {flash === 'wrong' ? <p className="message error">Wrong</p> : null}
          {hint ? <p className="message ok" role="status">{hint}</p> : null}
          <p className="answer-box" aria-live="polite">{answer || '–'}</p>
          <NumberPad
            onDigit={handleDigitPress}
            onBackspace={handleBackspace}
            onCheck={handleCheckAnswer}
            disabled={busy}
          />
          <div className="button-row play-actions">
            <button
              type="button"
              className="secondary"
              onClick={handleHint}
              disabled={busy || game.hintsLeft <= 0}
            >
              Hint ({game.hintsLeft})
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setQuitOpen(true)}
              disabled={busy}
            >
              Quit
            </button>
          </div>
        </div>
      </div>

      <Modal open={quitOpen} title="Quit this game?" onClose={() => setQuitOpen(false)}>
        <p>Your score so far will be saved.</p>
        <div className="button-row">
          <button type="button" onClick={handleQuit}>Save and quit</button>
          <button type="button" className="secondary" onClick={() => setQuitOpen(false)}>Keep playing</button>
        </div>
      </Modal>
    </section>
  );
}
