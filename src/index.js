import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import { ToastProvider } from './components/Toasts';

// ────────────────────────────────────────────────────────────────────────────────
// Suppress the “ResizeObserver loop completed with undelivered notifications” warning
// ────────────────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  const isROMessage = (msg) =>
    typeof msg === 'string' && (
      msg.includes('ResizeObserver loop completed with undelivered notifications') ||
      msg.includes('ResizeObserver loop limit exceeded')
    );
  const isROError = (err) => !!err && (
    err.name === 'ResizeObserverLoopError' ||
    isROMessage(err.message || '')
  );

  // Filter window error events
  window.addEventListener(
    'error',
    (event) => {
      if (isROMessage(event?.message) || isROError(event?.error)) {
        event.stopImmediatePropagation();
      }
      // otherwise let real errors bubble
    },
    true // capture phase so we stop the CRA overlay
  );

  // Filter unhandled promise rejections carrying the RO message
  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reasonMsg = event?.reason?.message || event?.reason;
      if (isROMessage(reasonMsg)) {
        event.preventDefault();
        event.stopImmediatePropagation?.();
      }
    },
    true
  );

  // Guard console.error to avoid dev overlay noise (keep other errors)
  const origConsoleError = console.error.bind(console);
  console.error = (...args) => {
    const first = args[0];
    if (isROMessage(first)) {
      return; // swallow only this known benign warning
    }
    origConsoleError(...args);
  };
}

// Patch ResizeObserver to schedule callbacks on next animation frame to avoid loop errors
try {
  if (typeof window !== 'undefined' && 'ResizeObserver' in window && !window.__RO_PATCHED__) {
    const OriginalRO = window.ResizeObserver;
    window.ResizeObserver = class ResizeObserver extends OriginalRO {
      constructor(callback) {
        super((entries, observer) => {
          const runner = () => {
            try {
              callback(entries, observer);
            } catch (e) {
              // Swallow callback errors to avoid triggering overlay
              if (process.env.NODE_ENV === 'development') {
                // eslint-disable-next-line no-console
                if (!(e && (e.name === 'ResizeObserverLoopError' || (e.message || '').includes('ResizeObserver')))) {
                  console.warn('ResizeObserver callback error suppressed:', e);
                }
              }
            }
          };
          (window.requestAnimationFrame || window.setTimeout)(runner);
        });
      }
    };
    window.__RO_PATCHED__ = true;
  }
} catch (_) {
  // no-op
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
