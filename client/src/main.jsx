/*
 * Purpose: Starts React and draws the App component into the page.
 * Theme: Event-driven programming
 */

import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// StrictMode is left off on purpose. In development it runs effects twice,
// which would ask the Banana API for two puzzles every time the page opens.
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
