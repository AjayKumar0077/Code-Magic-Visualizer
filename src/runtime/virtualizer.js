// Unified, production-ready live compiler/virtualizer orchestrator
// Supports JS in-browser (iframe sandbox) and Python via Pyodide worker
// Usage:
//   const { stop } = runCode({ language: 'javascript'|'python', code, timeoutMs }, (evt)=>{ ... })
// Events:
//   init, start, stdout, stderr, log, result, error, done, timeout

import { runJavaScript } from './sandboxRunner';
import { PythonExecutor } from '../python/executor';

export function runCode(options, onEvent = () => {}) {
  const {
    language = 'javascript',
    code = '',
    timeoutMs = 5000,
    maxLogBytes = 64 * 1024,
    indexURL = null, // for Python: allow self-hosted pyodide
  } = options || {};

  const runId = `${language}_${Math.random().toString(36).slice(2)}`;

  const emit = (type, payload = {}) => {
    try { onEvent({ type, runId, language, ...payload }); } catch (_) {}
  };

  emit('init', { runId });

  // Shared log budget per run
  let totalLogBytes = 0;
  let truncatedNotified = false;
  const budgetedEmit = (type, text, level = 'log') => {
    const s = String(text || '');
    const bytes = new TextEncoder().encode(s).length;
    if (totalLogBytes + bytes <= maxLogBytes) {
      totalLogBytes += bytes;
      emit(type, { text: s, level });
    } else if (!truncatedNotified) {
      truncatedNotified = true;
      emit('log', { level: 'warn', text: '[output truncated]' });
    }
  };

  let stop = () => {};

  if (language === 'javascript' || language === 'js' || language === 'typescript' || language === 'ts') {
    // For TS, assume transpiled earlier; this runner executes plain JS
    stop = runJavaScript(code, { timeoutMs, maxLogBytes }, (evt) => {
      if (evt.type === 'init') emit('init');
      if (evt.type === 'start') emit('start');
      if (evt.type === 'log') {
        budgetedEmit('stdout', evt.text, evt.level || 'log');
        emit('log', { level: evt.level || 'log', text: evt.text });
      }
      if (evt.type === 'error') emit('error', { message: evt.message, stack: evt.stack });
      if (evt.type === 'done') emit('done');
      if (evt.type === 'timeout') emit('timeout', { message: evt.message });
    });

    return { stop };
  }

  if (language === 'python' || language === 'py') {
    const py = new PythonExecutor({ indexURL });
    const off = py.onMessage((msg) => {
      if (msg.type === 'ready') return; // already handled
      if (msg.type === 'start') emit('start');
      if (msg.type === 'stdout') budgetedEmit('stdout', msg.text, 'info');
      if (msg.type === 'stderr') budgetedEmit('stderr', msg.text, 'warn');
      if (msg.type === 'result') emit('result', { value: msg.value });
      if (msg.type === 'error') emit('error', { message: msg.message });
    });

    let finished = false;
    const timer = setTimeout(() => {
      if (!finished) {
        emit('timeout', { message: `Execution timed out after ${timeoutMs}ms` });
        py.dispose();
      }
    }, timeoutMs);

    py.run(code).finally(() => {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        emit('done');
      }
    }).catch(() => {/* errors are emitted via onMessage */});

    stop = () => {
      try { clearTimeout(timer); } catch (_) {}
      try { off && off(); } catch (_) {}
      py.dispose();
    };

    return { stop };
  }

  // Unsupported language
  emit('error', { message: `Unsupported language: ${language}` });
  emit('done');
  return { stop: () => {} };
}