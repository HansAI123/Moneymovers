import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && (e.reason.message?.includes('WebSocket') || e.reason.message?.includes('closed without opened') || String(e.reason).includes('WebSocket'))) {
    e.preventDefault();
  }
});

window.addEventListener('error', (e) => {
  if (e.message && (e.message.includes('WebSocket') || e.message.includes('closed without opened'))) {
    e.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
