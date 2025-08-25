import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { runCode } from './runtime/virtualizer';

const TerminalOutput = ({ isCompiling, compilationComplete, code, language = 'javascript' }) => {
  const [output, setOutput] = useState([]);
  const terminalRef = useRef(null);
  const stopRef = useRef(null);
  const [isJsRunning, setIsJsRunning] = useState(false);



  // Clear output when compilation starts
  useEffect(() => {
    if (isCompiling) {
      setOutput([]);
    }
  }, [isCompiling]);

  // Generate output when compilation completes
  useEffect(() => {
    if (!compilationComplete || !code) return;

    const lines = [];
    const add = (type, text) => lines.push({ id: lines.length + 1, type, text, timestamp: new Date().toLocaleTimeString() });
    const MAX_LINES = 500;
    add('info', '🚀 Launching runtime...');
    setOutput([...lines].slice(-MAX_LINES));

    const { stop } = runCode(
      {
        language, // 'javascript' | 'python' | others (simulated)
        code,
        timeoutMs: 5000,
        // indexURL: '/pyodide/' // Optional: self-host your Pyodide assets. Leave unset to use the CDN.
      },
      (evt) => {
        if (evt.type === 'start') {
          add('info', '▶️ Program started');
          if (language === 'javascript') setIsJsRunning(true);
        } else if (evt.type === 'stdout') {
          add('output', String(evt.text ?? ''));
        } else if (evt.type === 'stderr') {
          add('warning', String(evt.text ?? ''));
        } else if (evt.type === 'result') {
          add('success', String(evt.value ?? ''));
        } else if (evt.type === 'error') {
          add('error', evt.message || 'Runtime error');
          if (language === 'javascript') setIsJsRunning(false);
        } else if (evt.type === 'timeout') {
          add('warning', evt.message);
          if (language === 'javascript') setIsJsRunning(false);
        } else if (evt.type === 'done') {
          add('success', '✅ Program finished');
          if (language === 'javascript') setIsJsRunning(false);
        }
        // Only keep last N lines to avoid heavy re-render on mobile
        setOutput([...lines].slice(-MAX_LINES));
      }
    );

    stopRef.current = stop;

    return () => {
      try { stopRef.current && stopRef.current(); } catch(_) {}
      setIsJsRunning(false);
    };
  }, [compilationComplete, code, language]);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const clearTerminal = () => {
    setOutput([]);
  };

  const stopJs = () => {
    if (stopRef.current) {
      try { stopRef.current(); } catch (_) {}
      setIsJsRunning(false);
      setOutput((prev) => ([...prev, { id: (prev[prev.length-1]?.id || 0) + 1, type: 'warning', text: '⏹️ JS execution stopped by user', timestamp: new Date().toLocaleTimeString() }]));
    }
  };

  const getLineColor = (type) => {
    switch (type) {
      case 'info':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      case 'output':
        return 'text-white';
      default:
        return 'text-gray-300';
    }
  };

  const getLinePrefix = (type) => {
    switch (type) {
      case 'info':
        return '[INFO]';
      case 'success':
        return '[SUCCESS]';
      case 'warning':
        return '[WARN]';
      case 'error':
        return '[ERROR]';
      case 'output':
        return '';
      default:
        return '';
    }
  };

  return (
    <div className="h-full bg-terminal-bg border-t border-gray-700 flex flex-col">
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-2 text-gray-300 text-sm font-medium">🖥️ Magic Output Terminal</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={clearTerminal}
            className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded"
            title="Clear terminal"
          >
            Clear
          </button>
          {language === 'javascript' && (
            <button
              onClick={stopJs}
              disabled={!isJsRunning}
              className={`px-2 py-1 text-xs rounded ${!isJsRunning ? 'bg-gray-600 text-gray-400' : 'bg-red-600 hover:bg-red-500 text-white'}`}
              title="Stop JS runtime"
            >
              Stop
            </button>
          )}
          <div className="hidden sm:block text-xs text-gray-400">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-sm"
      >
        {output.length === 0 && !isCompiling ? (
          <div className="text-gray-500 text-center py-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <div className="text-3xl">🎮</div>
              <div className="text-lg">Ready for coding magic!</div>
              <div className="text-sm">Write some code and click "Compile" to see it work! ✨</div>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence>
              {output.map((line, index) => (
                <motion.div
                  key={line.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: index * 0.2,
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                  className={`flex items-start space-x-2 ${getLineColor(line.type)}`}
                >
                  <span className="text-gray-500 text-xs min-w-[60px]">
                    {line.timestamp}
                  </span>
                  <span className="text-xs min-w-[60px] opacity-70">
                    {getLinePrefix(line.type)}
                  </span>
                  <span className="flex-1">{line.text}</span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator when compilation is running */}
            {isCompiling && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2 text-yellow-400"
              >
                <span className="text-gray-500 text-xs min-w-[60px]">
                  {new Date().toLocaleTimeString()}
                </span>
                <span className="text-xs min-w-[60px] opacity-70">[INFO]</span>
                <span className="flex items-center space-x-1">
                  <span>🎯 Compiling your awesome code</span>
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ 
                      duration: 1, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    ...
                  </motion.span>
                </span>
              </motion.div>
            )}

            {/* Cursor */}
            {!isCompiling && output.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="flex items-center space-x-2 text-green-400"
              >
                <span className="text-gray-500 text-xs min-w-[60px]">
                  {new Date().toLocaleTimeString()}
                </span>
                <span className="text-xs min-w-[60px] opacity-70"></span>
                <span>$</span>
                <div className="w-2 h-4 bg-green-400"></div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Terminal Status Bar */}
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Ready</span>
          <span className={`flex items-center space-x-1 ${
            isCompiling ? 'text-yellow-400' : 
            compilationComplete ? 'text-green-400' : 'text-gray-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isCompiling ? 'bg-yellow-400 animate-pulse' : 
              compilationComplete ? 'bg-green-400' : 'bg-gray-400'
            }`}></div>
            <span>
              {isCompiling ? 'Compiling...' : 
               compilationComplete ? 'Completed' : 'Idle'}
            </span>
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span>Lines: {output.length}</span>
          <span>•</span>
          <span>Encoding: UTF-8</span>
          <span>•</span>
          <span>Runtime: {language === 'javascript' ? 'Sandboxed JS' : (language === 'python' ? 'Pyodide' : 'Simulated')}</span>
        </div>
      </div>
    </div>
  );
};

export default TerminalOutput;
