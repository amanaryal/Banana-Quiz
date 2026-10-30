/*
 * Purpose: The signed-in player's level, best scores, and last five games.
 * Theme: Virtual identity
 */

import { useEffect, useState } from 'react';
import { api } from '../api/api.js';
import { GAME_MODES } from '../constants/gameModes.js';
import { useAuth } from '../context/AuthContext.jsx';
import { initials } from '../utils/initials.js';
import { Loader } from '../components/Loader.jsx';

function modeLabel(id) {
  const mode = GAME_MODES.find((item) => item.id === id);
  return mode ? mode.label : id;
}

export default function ProfilePage() {
  const { user, clearSession } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const result = await api('/api/scores/me');

      if (cancelled) {
        return;
      }

      if (result.status === 401) {
        clearSession();
        return;
      }

      if (!result.ok) {
        setError(result.data.message || 'Could not load your profile.');
        return;
      }

      setProfile(result.data.profile);
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  if (error) {
    return <p className="message error" role="alert">{error}</p>;
  }

  if (!profile) {
    return <Loader label="Loading your profile..." />;
  }

  return (
    <section className="card profile-card">
      <div className="profile-head">
        <p className="avatar large" aria-hidden="true">{initials(profile.username || (user && user.username))}</p>
        <div className="profile-identity">
          <h1>{profile.username}</h1>
          <p className="eyebrow">{profile.rankTitle}</p>
          <p className="status">Level {profile.level}</p>
        </div>
      </div>

      <div className="xp" aria-label={'Level progress ' + profile.percent + ' percent'}>
        <div className="xp-fill" style={{ width: profile.percent + '%' }} />
      </div>
      <p className="status">{profile.xpIntoLevel} / {profile.xpForNext} XP to the next level</p>

      <div className="stat-grid">
        <div className="stat-box"><span>Points</span><strong>{profile.totalPoints}</strong></div>
        <div className="stat-box"><span>Games</span><strong>{profile.gamesPlayed}</strong></div>
        <div className="stat-box"><span>Accuracy</span><strong>{profile.accuracy}%</strong></div>
      </div>

      <h2>Best by level</h2>
      <div className="stat-grid">
        <div className="stat-box"><span>Easy</span><strong>{profile.bestByDifficulty.easy}</strong></div>
        <div className="stat-box"><span>Medium</span><strong>{profile.bestByDifficulty.medium}</strong></div>
        <div className="stat-box"><span>Hard</span><strong>{profile.bestByDifficulty.hard}</strong></div>
      </div>

      <h2>Recent games</h2>
      {profile.recent.length === 0 ? <p className="status">No games yet.</p> : (
        <div className="table-wrap">
          <table className="board recent-board">
            <thead>
              <tr>
                <th>Mode</th>
                <th>Points</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {profile.recent.map((game) => (
                <tr key={game.id}>
                  <td data-label="Mode">{modeLabel(game.difficulty)}</td>
                  <td data-label="Points">{game.score}</td>
                  <td data-label="Accuracy">{game.accuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
