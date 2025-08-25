/* eslint-disable no-restricted-globals, no-undef */
/* global self */
// Pyodide Worker: loads pyodide and executes Python code safely off the main thread.
// Protocol:
// Host -> Worker:
//   { type: 'init', token, indexURL? }
//   { type: 'run', token, runId, code }
// Worker -> Host (always echoes token and runId when available):
//   { type: 'ready', token }
//   { type: 'start', token, runId }
//   { type: 'stdout'|'stderr', token, runId, text }
//   { type: 'result', token, runId, value }
//   { type: 'error', token, runId, message }

let pyodide = null;
let initialized = false;
let indexURL = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'; // pinned version
let currentToken = null; // token for the current executor instance

async function loadPyodideIfNeeded() {
  if (initialized) return;
  if (typeof self.loadPyodide !== 'function') {
    // Load pyodide loader script from configured base URL
    importScripts(indexURL + 'pyodide.js');
  }
  pyodide = await self.loadPyodide({ indexURL });
  initialized = true;
}

self.onmessage = async (e) => {
  const msg = e.data || {};
  try {
    if (msg.type === 'init') {
      if (typeof msg.indexURL === 'string' && msg.indexURL) {
        // Ensure trailing slash
        indexURL = msg.indexURL.endsWith('/') ? msg.indexURL : msg.indexURL + '/';
      }
      currentToken = msg.token || null;
      await loadPyodideIfNeeded();
      self.postMessage({ type: 'ready', token: currentToken });
      return;
    }

    if (msg.type === 'run') {
      // Only accept run messages tied to our current token
      if (!initialized) await loadPyodideIfNeeded();
      if (!msg.token || msg.token !== currentToken) return;

      const runId = msg.runId || null;

      // Bridge a JS helper into Python to stream stdout/stderr with token/runId
      const postStd = (kind, text) => {
        try {
          self.postMessage({ type: kind, token: currentToken, runId, text: String(text) });
        } catch (_) {}
      };
      // Expose to Python world
      pyodide.globals.set('post_std', postStd);
      // Also attach to global JS scope so Python can import from 'js'
      self.post_std = postStd;

      self.postMessage({ type: 'start', token: currentToken, runId });

      // Redirect stdout/stderr in Python to our JS bridge
      await pyodide.runPythonAsync(`
import sys
import js
class StdoutCatcher:
    def write(self, s):
        if s:
            try:
                js.post_std('stdout', s)
            except Exception:
                pass
class StderrCatcher:
    def write(self, s):
        if s:
            try:
                js.post_std('stderr', s)
            except Exception:
                pass
sys.stdout = StdoutCatcher()
sys.stderr = StderrCatcher()
`);

      try {
        const value = await pyodide.runPythonAsync(String(msg.code || ''));
        self.postMessage({ type: 'result', token: currentToken, runId, value: value == null ? '' : String(value) });
      } catch (err) {
        self.postMessage({ type: 'error', token: currentToken, runId, message: String((err && err.message) || err) });
      }
      return;
    }
  } catch (err) {
    self.postMessage({ type: 'error', token: currentToken, runId: null, message: String((err && err.message) || err) });
  }
};