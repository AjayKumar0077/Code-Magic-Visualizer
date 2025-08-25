// Wrapper to interact with the Pyodide web worker with production-grade protocol
export class PythonExecutor {
  constructor(options = {}) {
    this.worker = null;
    this.listeners = new Set();
    this.ready = false;
    this.indexURL = options.indexURL || null; // allow custom/self-hosted pyodide

    // Security: random token to tie messages to this executor instance
    this.token = `${Math.random().toString(36).slice(2)}.${Date.now()}`;
  }

  ensureWorker() {
    if (this.worker) return;
    this.worker = new Worker(new URL('./pyWorker.js', import.meta.url), { type: 'module' });

    this.worker.onmessage = (e) => {
      const msg = e.data || {};
      if (msg.token && msg.token !== this.token) return; // ignore other sessions
      if (msg.type === 'ready') {
        this.ready = true;
      }
      this.listeners.forEach((cb) => {
        try { cb(msg); } catch (_) {}
      });
    };

    const initPayload = { type: 'init', token: this.token };
    if (this.indexURL) initPayload.indexURL = this.indexURL;
    this.worker.postMessage(initPayload);
  }

  onMessage(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  async run(code) {
    this.ensureWorker();
    if (!this.ready) {
      await new Promise((res) => {
        const off = this.onMessage((m) => { if (m.type === 'ready') { off(); res(); } });
      });
    }
    const runId = `py_${Math.random().toString(36).slice(2)}`;
    this.worker.postMessage({ type: 'run', token: this.token, runId, code });
    return runId;
  }

  dispose() {
    try { this.worker && this.worker.terminate(); } catch (_) {}
    this.worker = null;
    this.ready = false;
    this.listeners.clear();
  }
}