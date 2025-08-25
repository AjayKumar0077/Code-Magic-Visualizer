import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { PythonExecutor } from './python/executor';
import { saveSnippet, loadSnippet } from './services/snippets';
import { useToasts } from './components/Toasts';
import { pythonLessons } from './lessons/pythonLessons';

const defaultCode = `# Welcome to Python Lab 🐍\nprint('Hello from Pyodide!')\nfor i in range(3):\n    print('Line', i+1)`;

export default function PythonLab() {
  const [code, setCode] = useState(defaultCode);
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState([]);
  const [status, setStatus] = useState('Idle');
  const execRef = useRef(null);
  const stopRef = useRef(null);
  const timeoutRef = useRef(null);
  const toasts = useToasts();
  const { push } = toasts || { push: () => {} };
  const [lessonIndex, setLessonIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Use CDN by default; set indexURL to self-hosted path only if you host pyodide assets
    execRef.current = new PythonExecutor({ /* indexURL: '/pyodide/' */ });
    const off = execRef.current.onMessage((m) => {
      if (m.type === 'ready') {
        setStatus('Ready');
      } else if (m.type === 'stdout') {
        setLines((prev) => [...prev, { type: 'out', text: m.text }]);
      } else if (m.type === 'stderr') {
        setLines((prev) => [...prev, { type: 'err', text: m.text }]);
      } else if (m.type === 'result') {
        setRunning(false);
        setStatus('Done');
        if (m.value) setLines((prev) => [...prev, { type: 'res', text: String(m.value) }]);
      } else if (m.type === 'error') {
        setRunning(false);
        setStatus('Error');
        setLines((prev) => [...prev, { type: 'err', text: m.message }]);
      }
    });
    return () => off();
  }, []);

  const run = useCallback(async (withTests = false) => {
    setLines([]);
    setRunning(true);
    setStatus('Running');
    stopRef.current = undefined; // reset
    const lesson = (pythonLessons || [])[lessonIndex];
    const program = withTests && lesson ? `${code}\n\n${lesson.testCode}` : code;
    await execRef.current.run(program);
    // Hard timeout 6s
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (running) {
        setRunning(false);
        setStatus('Timeout');
        setLines((prev) => [...prev, { type: 'err', text: 'Execution timed out' }]);
      }
    }, 6000);
    setCountdown(6);
  }, [code, lessonIndex, running]);

  const stop = () => {
    // Recreate executor to terminate current run
    execRef.current = new PythonExecutor({ /* indexURL: '/pyodide/' */ });
    setRunning(false);
    setStatus('Stopped');
    setLines((prev) => [...prev, { type: 'err', text: 'Execution stopped by user' }]);
  clearTimeout(timeoutRef.current);
  setCountdown(0);
  };

  // Keyboard shortcut: Ctrl+Enter to run
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!running) run();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, code, run]);

  const onSave = async () => {
    try {
      const { id } = await saveSnippet({ code, language: 'python' });
      const url = `${window.location.origin}?snippet=${id}`;
      await navigator.clipboard.writeText(url);
      setLines((prev) => [...prev, { type: 'res', text: `Share link copied: ${url}` }]);
  push({ type: 'success', message: 'Snippet saved and link copied!' });
    } catch (e) {
  setLines((prev) => [...prev, { type: 'err', text: 'Failed to save snippet' }]);
  push({ type: 'error', message: 'Failed to save snippet' });
    }
  };

  // Auto-load snippet by URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('snippet');
    if (!id) return;
    loadSnippet(id).then((snip) => {
      if (snip?.code) setCode(snip.code);
    }).catch(() => {
      setLines((prev) => [...prev, { type: 'err', text: 'Snippet not found' }]);
      push({ type: 'error', message: 'Snippet not found' });
    });
  }, [push]);

  // Countdown UI
  useEffect(() => {
    if (!running || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [running, countdown]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        <h2 className="text-sm font-medium text-gray-200">Python Lab</h2>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">Status: {status}</span>
          <button onClick={run} disabled={running} className={`px-3 py-1 rounded ${running ? 'bg-gray-600 text-gray-400' : 'bg-green-600 hover:bg-green-500 text-white'}`}>Run ▶ (Ctrl+Enter)</button>
          <button onClick={stop} disabled={!running} className={`px-3 py-1 rounded ${!running ? 'bg-gray-600 text-gray-400' : 'bg-red-600 hover:bg-red-500 text-white'}`}>Stop ■</button>
          <button onClick={onSave} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white">Save/Share</button>
        </div>
      </div>
      <div className="flex flex-1">
        <div className="w-64 border-r border-gray-700 bg-gray-900 overflow-auto">
          <div className="p-3 border-b border-gray-800 text-gray-300 font-semibold">Lessons</div>
          <ul>
            {(pythonLessons || []).map((l, idx) => (
              <li key={l.id}>
                <button
                  className={`w-full text-left px-3 py-2 hover:bg-gray-800 ${idx === lessonIndex ? 'bg-gray-800 text-white' : 'text-gray-300'}`}
                  onClick={() => { setLessonIndex(idx); setCode(l.starterCode || ''); setLines([]); }}
                >
                  {idx + 1}. {l.title}
                </button>
              </li>
            ))}
          </ul>
          {running && countdown > 0 && (
            <div className="p-3 text-xs text-yellow-300">Time left: {countdown}s</div>
          )}
        </div>
        <div className="flex-1 border-r border-gray-700">
          <Editor
            height="100%"
            defaultLanguage="python"
            language="python"
            value={code}
            onChange={(v) => setCode(v || '')}
            options={{ fontSize: 16, automaticLayout: true, wordWrap: 'on' }}
          />
        </div>
        <div className="flex-1 p-3 bg-black text-white font-mono text-sm overflow-auto">
          {lines.length === 0 ? (
            <div className="text-gray-500">Output will appear here…</div>
          ) : (
            lines.map((l, idx) => (
              <div key={idx} className={l.type === 'err' ? 'text-red-400' : l.type === 'res' ? 'text-green-400' : ''}>{l.text}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
