/*
 * Purpose: Shows the saved result of one game.
 * Theme: Event-driven programming
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
import Confetti from '../components/Confetti.jsx';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state && location.state.result;

  if (!result) {
    return (
      <section className="card">
        <h1>No result yet</h1>
        <p className="lead">Finish a game and the score will show up here.</p>
        <Link className="button-link" to="/play">Choose a level</Link>
      </section>
    );
  }

  const accuracy = result.accuracy || 0;
  const celebrate = accuracy >= 50 || result.personalBest;

  return (
    <section className="card result-card">
      <Confetti show={celebrate} />
      <p className="eyebrow">{result.difficulty}</p>
      <h1>{result.score} points</h1>
      {result.personalBest ? <p className="badge">New personal best!</p> : null}
      <div className="stat-grid">
        <div><span>Accuracy</span><strong>{accuracy}%</strong></div>
        <div><span>Best streak</span><strong>{result.bestStreak}</strong></div>
        <div><span>Time bonus</span><strong>{result.timeBonus}</strong></div>
        <div><span>Correct</span><strong>{result.correctCount}/{result.totalRounds}</strong></div>
      </div>
      <div className="button-row">
        {/* EVENT: onClick (play again) -> HANDLER: navigate -> RESULT: same level starts from the level page */}
        <button type="button" onClick={() => navigate('/play')}>Play again</button>
        <Link className="button-link secondary" to="/play">Change level</Link>
        <Link className="button-link secondary" to="/leaderboard">View leaderboard</Link>
      </div>
    </section>
  );
}
