/*
 * Purpose: Sidebar on a wide screen, and a bottom tab bar on a phone.
 * Theme: Virtual identity and event-driven programming
 */

import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { initials } from '../utils/initials.js';
import { isMuted, setMuted } from '../utils/sounds.js';
import Modal from './Modal.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pushToast = useToast();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [muted, setMutedState] = useState(isMuted());

  useEffect(() => {
    // EVENT: window resize -> HANDLER: handleResize -> RESULT: the phone menu closes on a wide screen
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
        setDropdownOpen(false);
      }
    }

    // EVENT: click-outside -> HANDLER: handlePointerDown -> RESULT: avatar menu closes
    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  // EVENT: onClick (mute) -> HANDLER: handleToggleMute -> RESULT: beeps turn on or off
  function handleToggleMute() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  }

  // EVENT: onClick (logout confirm) -> HANDLER: handleConfirmLogout -> RESULT: cookie cleared, login page, toast
  async function handleConfirmLogout() {
    await logout();
    setLogoutOpen(false);
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate('/login');
    pushToast('Logged out successfully');
  }

  function closeMenus() {
    setMenuOpen(false);
    setDropdownOpen(false);
  }

  // Do not render navbar on unauthenticated screens (login, register)
  if (!user) {
    return null;
  }

  return (
    <>
      <aside className="sidebar">
        <Link className="brand" to="/home" onClick={closeMenus}>🍌 Banana Quiz</Link>
        <nav className="side-links">
          <NavLink to="/home" onClick={closeMenus}><span aria-hidden="true">🏠</span> Home</NavLink>
          <NavLink to="/play" onClick={closeMenus}><span aria-hidden="true">🎮</span> Play</NavLink>
          <NavLink to="/leaderboard" onClick={closeMenus}><span aria-hidden="true">🏆</span> Leaderboard</NavLink>
          <NavLink to="/profile" onClick={closeMenus}><span aria-hidden="true">👤</span> Profile</NavLink>
        </nav>
        <div className="side-foot">
          <button
            type="button"
            className="sound-btn"
            aria-label={muted ? 'Sound off' : 'Sound on'}
            aria-pressed={muted}
            onClick={handleToggleMute}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button type="button" className="logout-link" onClick={() => setLogoutOpen(true)}>Logout</button>
        </div>
      </aside>

      <div className="top-user">
        <span className="avatar" aria-hidden="true">{initials(user.username)}</span>
        <span className="side-name">{user.username}</span>
      </div>

      <header className="mobile-top">
        <Link className="brand" to="/home" onClick={closeMenus}>🍌 Banana Quiz</Link>
        <div className="mobile-top-tools">
          <button
            type="button"
            className="sound-btn"
            aria-label={muted ? 'Sound off' : 'Sound on'}
            aria-pressed={muted}
            onClick={handleToggleMute}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <div className="avatar-wrap" ref={menuRef}>
            {/* EVENT: onClick (avatar) -> HANDLER: setDropdownOpen -> RESULT: profile menu opens */}
            <button
              type="button"
              className="avatar"
              aria-label={'Account menu for ' + user.username}
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((open) => !open)}
            >
              {initials(user.username)}
            </button>
            {dropdownOpen ? (
              <div className="dropdown" role="menu">
                <Link to="/profile" role="menuitem" onClick={closeMenus}>Profile</Link>
                <Link to="/leaderboard" role="menuitem" onClick={closeMenus}>Leaderboard</Link>
                <button type="button" role="menuitem" onClick={() => setLogoutOpen(true)}>Logout</button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <nav className="tab-bar" aria-label="Pages">
        <NavLink to="/home" onClick={closeMenus}><span aria-hidden="true">🏠</span>Home</NavLink>
        <NavLink to="/play" onClick={closeMenus}><span aria-hidden="true">🎮</span>Play</NavLink>
        <NavLink to="/leaderboard" onClick={closeMenus}><span aria-hidden="true">🏆</span>Board</NavLink>
        <NavLink to="/profile" onClick={closeMenus}><span aria-hidden="true">👤</span>Me</NavLink>
      </nav>

      <Modal open={logoutOpen} title="Log out?" onClose={() => setLogoutOpen(false)}>
        <p>Are you sure?</p>
        <div className="button-row">
          <button type="button" onClick={handleConfirmLogout}>Log out</button>
          <button type="button" className="secondary" onClick={() => setLogoutOpen(false)}>Stay</button>
        </div>
      </Modal>
    </>
  );
}
