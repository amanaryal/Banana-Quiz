/*
 * Purpose: The play screen. Timer, lives, number pad, hint, and quit.
 * Theme: Event-driven programming (the picture still comes from our server, not the Banana API)
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 *
 * The countdown on screen is a guide. The server rejects a guess that arrives too late.
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
    }
  }

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
        navigate('/play');
        return;
      }

      remember(result.data.game, true);
    }

    loadPuzzle();

    return () => {
      cancelled = true;
    };
  }, [clearSession, location.state, navigate]);

  async function sendAnswer(body) {
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

  // EVENT: timer tick -> HANDLER: the interval below -> RESULT: bar shrinks, then a timeout is sent
  useEffect(() => {
    if (!game || !game.puzzleId) {
      return undefined;
    }

    const id = setInterval(() => {
      const current = gameRef.current;

      if (!current || !current.issuedAt) {
        return;
      }

      const left = secondsRemaining(current);
      setTimeLeft(left);

      if (left <= 0) {
        handleTimeout();
      }
    }, 200);

    return () => clearInterval(id);
  }, [game && game.puzzleId]);

  // EVENT: timeout -> HANDLER: handleTimeout -> RESULT: round counts as wrong and a life is lost
  function handleTimeout() {
    if (timeoutLock.current || busyRef.current) {
      return;
    }

    timeoutLock.current = true;
    sendRef.current({ timedOut: true });
  }

  // EVENT: onClick (number pad) -> HANDLER: handleDigitPress -> RESULT: digit shown in answer box
  function handleDigitPress(digit) {
    if (busyRef.current) {
      return;
    }

    setAnswer(digit);
  }

  // EVENT: onKeyDown (Backspace) -> HANDLER: handleBackspace -> RESULT: answer box clears
  function handleBackspace() {
    setAnswer('');
  }

  // EVENT: onClick / Enter -> HANDLER: handleCheckAnswer -> RESULT: Correct or Wrong from the server
  function handleCheckAnswer() {
    if (!answer) {
      setError('Tap a digit first.');
      return;
    }

    sendAnswer({ guess: answer });
  }

  useEffect(() => {
    // EVENT: onKeyDown (digit or Enter) -> HANDLER: handleKeyDown -> RESULT: same as the pad or the check button
    function handleKeyDown(event) {
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
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // EVENT: onClick (hint) -> HANDLER: handleHint -> RESULT: even/odd or a range, and 5 points spent
  async function handleHint() {
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

  // EVENT: onClick (quit confirm) -> HANDLER: handleQuit -> RESULT: game saved and result screen opens
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
              <img src={game.imageUrl} alt="Puzzle. One digit is hidden." />
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
            <button type="button" className="secondary" onClick={handleHint} disabled={busy || game.hintsLeft <= 0}>
              Hint ({game.hintsLeft})
            </button>
            {/* EVENT: onClick (quit) -> HANDLER: setQuitOpen -> RESULT: confirm modal opens */}
            <button type="button" className="secondary" onClick={() => setQuitOpen(true)}>Quit</button>
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
