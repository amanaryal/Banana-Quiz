/*
 * Purpose: Top 10 scores, with filters, a podium, and the signed-in player's rank.
 * Theme: Virtual identity
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { initials } from '../utils/initials.js';
import { Skeleton } from '../components/Loader.jsx';

const LEVELS = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
  { id: 'all', label: 'All' }
];
const PERIODS = [
  { id: 'all', label: 'All-time' },
  { id: 'week', label: 'Week' },
  { id: 'today', label: 'Today' }
];

function PodiumCard({ row, place }) {
  if (!row) {
    return <div className={'podium-card empty ' + place} />;
  }

  return (
    <article className={'podium-card ' + place}>
      <p className="place-num">{row.rank}</p>
      <p className="crown">{place === 'gold' ? '👑' : place === 'silver' ? '🥈' : '🥉'}</p>
      <p className="avatar small" aria-hidden="true">{initials(row.username)}</p>
      <h3>{row.username}</h3>
      <p>{row.bestScore} pts</p>
      <p className="status">{row.rankTitle}</p>
    </article>
  );
}

export default function LeaderboardPage() {
  const { user, clearSession } = useAuth();
  const [difficulty, setDifficulty] = useState('all');
  const [period, setPeriod] = useState('all');
  const [rows, setRows] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadBoard() {
      setLoading(true);
      setError('');
      const result = await api('/api/scores/leaderboard?difficulty=' + difficulty + '&period=' + period);

      if (cancelled) {
        return;
      }

      if (result.status === 401) {
        clearSession();
        return;
      }

      if (!result.ok) {
        setError(result.data.message || 'Could not load the leaderboard.');
        setLoading(false);
        return;
      }

      setRows(result.data.leaderboard || []);
      setMyRank(result.data.myRank);
      setLoading(false);
    }

    loadBoard();

    return () => {
      cancelled = true;
    };
  }, [difficulty, period, clearSession]);

  const first = rows[0];
  const second = rows[1];
  const third = rows[2];
  const rest = rows;

  return (
    <section className="card wide">
      <div className="page-title">
        <h1>🏆 Leaderboard</h1>
        <p className="lead">Best score for the level you pick.</p>
      </div>

      <div className="filters" role="tablist" aria-label="Difficulty">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            className={difficulty === level.id ? 'filter on' : 'filter'}
            onClick={() => setDifficulty(level.id)}
          >
            {level.label}
          </button>
        ))}
      </div>
      <div className="filters" aria-label="Time">
        {PERIODS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={period === item.id ? 'filter on' : 'filter'}
            onClick={() => setPeriod(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? <Skeleton count={4} /> : null}
      {error ? <p className="message error" role="alert">{error}</p> : null}

      {!loading && !error && rows.length === 0 ? (
        <div className="empty-board">
          <p className="empty-emoji">🍌</p>
          <p>No scores yet - be the first!</p>
          <Link className="button-link" to="/play">Play</Link>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div className="podium">
          <PodiumCard row={second} place="silver" />
          <PodiumCard row={first} place="gold" />
          <PodiumCard row={third} place="bronze" />
        </div>
      ) : null}

      {myRank ? (
        <p className="rank-card">Your rank: #{myRank.rank}</p>
      ) : (
        <p className="rank-card">Your rank: not on this list yet. Play a game.</p>
      )}

      {rest.length > 0 ? (
        <div className="table-wrap">
          <table className="board">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Best</th>
                <th>Games</th>
                <th>Accuracy</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((row) => (
                <tr key={row.rank} className={user && row.username === user.username ? 'me' : ''}>
                  <td data-label="Rank">{row.rank}</td>
                  <td data-label="Player">{row.username}</td>
                  <td data-label="Best">{row.bestScore}</td>
                  <td data-label="Games">{row.gamesPlayed}</td>
                  <td data-label="Accuracy">{row.accuracy}%</td>
                  <td data-label="Level">{row.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
