/*
 * Purpose: Chooses which page to show, and wraps the app in login state and toasts.
 * Theme: Virtual identity and event-driven programming
 */

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LevelSelectPage from './pages/LevelSelectPage.jsx';
import GamePage from './pages/GamePage.jsx';
import ResultPage from './pages/ResultPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="shell">
            <Navbar />
            <div className="main-col">
              <main className="page">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/play" element={<ProtectedRoute><LevelSelectPage /></ProtectedRoute>} />
                  <Route path="/game" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
                  <Route path="/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
                  <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="*" element={<section className="card"><h1>Page not found</h1></section>} />
                </Routes>
              </main>
            </div>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
