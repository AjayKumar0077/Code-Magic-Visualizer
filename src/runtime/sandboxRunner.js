// Lightweight, sandboxed JavaScript runner using an iframe
// Streams events back to the caller via postMessage and a provided callback.
// Usage: const stop = runJavaScript(code, { timeoutMs: 3000 }, (evt)=>{ ... });

export function runJavaScript(
  code,
  options = {},
  onEvent = () => {}
) {
  const {
    timeoutMs = 3000,
    maxLogBytes = 64 * 1024, // cap total log bytes to avoid flooding
  } = options;

  const runId = `js_${Math.random().toString(36).slice(2)}`;
  const token = `${Math.random().toString(36).slice(2)}.${Date.now()}`;

  // Emit helper
  const emit = (type, payload = {}) => {
    try { onEvent({ type, runId, ...payload }); } catch (_) { /* noop */ }
  };

  emit('init', { runId });

  // Create sandboxed iframe
  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-scripts');
  iframe.setAttribute('referrerpolicy', 'no-referrer');
  iframe.style.display = 'none';

  const srcdoc = `<!doctype html>
<html>
  <head><meta charset="utf-8"/></head>
  <body>
    <script>
      (function(){
        // Communication channel via postMessage
        const send = (msg) => parent.postMessage(msg, '*');

        // Track the token provided by the host per execution
        let execToken = null;

        // Override console to pipe logs out
        const levels = ['log','info','warn','error'];
        const original = {};
        levels.forEach(l=>{
          original[l] = console[l] && console[l].bind ? console[l].bind(console) : function(){};
          console[l] = function(){
            try {
              const args = Array.from(arguments).map(a => {
                try { return typeof a === 'string' ? a : JSON.stringify(a); } catch(_) { return String(a); }
              });
              send({ __runner: true, token: execToken, type: 'log', level: l, args });
            } catch(_){}
            try { return original[l](...arguments); } catch(_){ return undefined; }
          }
        });

        window.addEventListener('message', (e) => {
          const data = e && e.data;
          if (!data || data.__runner !== true || data.type !== 'execute') return;
          execToken = data.token || null;
          send({ __runner: true, token: execToken, type: 'start' });
          try {
            // Use Function constructor to run in global scope of iframe
            const fn = new Function(String(data.code || '') + '\n//# sourceURL=runtime.js');
            fn();
            send({ __runner: true, token: execToken, type: 'done' });
          } catch (err) {
            send({ __runner: true, token: execToken, type: 'error', message: String(err && err.message || err), stack: err && err.stack });
          }
        });
      })();
    </script>
  </body>
</html>`;

  iframe.srcdoc = srcdoc;
  document.body.appendChild(iframe);

  let finished = false;
  let totalLogBytes = 0;
  let truncatedNotified = false;

  const handleMsg = (e) => {
    const data = e && e.data;
    if (!data || data.__runner !== true || data.token !== token) return; // strict filtering by token
    if (finished) return;

    if (data.type === 'log') {
      const text = (data.args || []).join(' ');
      const bytes = new TextEncoder().encode(text).length;
      if (totalLogBytes + bytes <= maxLogBytes) {
        totalLogBytes += bytes;
        emit('log', { level: data.level || 'log', text });
      } else if (!truncatedNotified) {
        truncatedNotified = true;
        emit('log', { level: 'warn', text: '[output truncated]' });
      }
    } else if (data.type === 'error') {
      emit('error', { message: data.message, stack: data.stack });
      finished = true;
      clearTimeout(timer);
      cleanup();
    } else if (data.type === 'start') {
      emit('start');
    } else if (data.type === 'done') {
      emit('done');
      finished = true;
      clearTimeout(timer);
      cleanup();
    }
  };
  window.addEventListener('message', handleMsg);

  const cleanup = () => {
    window.removeEventListener('message', handleMsg);
    try { document.body.removeChild(iframe); } catch (_) {}
  };

  const timer = setTimeout(() => {
    if (!finished) {
      emit('timeout', { message: `Execution timed out after ${timeoutMs}ms` });
      finished = true;
      cleanup();
    }
  }, timeoutMs);

  const stop = () => {
    clearTimeout(timer);
    cleanup();
  };

  const execute = () => {
    try {
      iframe.contentWindow.postMessage({ __runner: true, type: 'execute', code, token }, '*');
    } catch (_) { /* ignore */ }
  };

  // Wait for iframe to be ready then execute
  iframe.addEventListener('load', execute);

  return stop;
}