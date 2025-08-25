import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import CodeEditor from './CodeEditor';
import CompilerAnimation from './CompilerAnimation';
import TerminalOutput from './TerminalOutput';
import ParserTreeGraph from './ParserTreeGraph';
import { TokenViewer, StageTimeline, LanguageSelector, CompilerWorkers } from './EnhancedComponents';
import PythonLab from './PythonLab';
import Gallery from './Gallery';


/**
 * Interactive Compiler Classroom - Production Ready Application
 * A comprehensive educational tool for understanding compilation processes
 */
function App() {

  const [code, setCode] = useState(() => {
    try { return localStorage.getItem('code') || ''; } catch (_) { return ''; }
  });
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationComplete, setCompilationComplete] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    try { return localStorage.getItem('language') || 'javascript'; } catch (_) { return 'javascript'; }
  });
  const [viewMode, setViewMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') || localStorage.getItem('viewMode') || 'learning';
  }); // learning, advanced, simplified
  const [activePanel, setActivePanel] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('tab') || localStorage.getItem('activePanel') || 'compiler');
  }); // compiler, tokens, parsetree, workers, output, pythonlab
  const [currentStage, setCurrentStage] = useState(0);


  // Parse tree selected node
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Reset selection when code is cleared
  useEffect(() => {
    if (!code.trim()) {
      setSelectedNode(null);
    }
  }, [code]);

  // Compilation stages for educational display
  const compilationStages = [
    'Source Code',
    'Lexical Analysis', 
    'Syntax Analysis',
    'Semantic Analysis', 
    'Code Generation',
    'Optimization',
    'Executable'
  ];

  // Available languages
  const supportedLanguages = ['javascript', 'python', 'java', 'cpp', 'c'];

  // Sample code templates
  const codeTemplates = {
    javascript: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(5));`,
    python: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(5))`,
    java: `public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    public static void main(String[] args) {
        System.out.println(fibonacci(5));
    }
}`,
    cpp: `#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << fibonacci(5) << endl;
    return 0;
}`,
    c: `#include <stdio.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    printf("%d\\n", fibonacci(5));
    return 0;
}`
  };

  const handleCodeChange = useCallback((value) => {
    const next = value || '';
    setCode(next);
    try { localStorage.setItem('code', next); } catch(_) {}
    if (compilationComplete) {
      setCompilationComplete(false);
    }
  }, [compilationComplete]);

  const handleCompile = () => {
    if (!code.trim()) {
      alert('Please enter some code to compile! Try selecting a template from the language dropdown.');
      return;
    }
    
    setIsCompiling(true);
    setCompilationComplete(false);
    setCurrentStage(0);
    
    // Simulate compilation stages
    const stageInterval = setInterval(() => {
      setCurrentStage(prevStage => {
        const nextStage = prevStage + 1;
        if (nextStage >= compilationStages.length - 1) {
          clearInterval(stageInterval);
          setIsCompiling(false);
          setCompilationComplete(true);
          return nextStage;
        }
        return nextStage;
      });
    }, window.matchMedia && window.matchMedia('(max-width: 768px)').matches ? 2000 : 1500);
  };

  const handleCompilationComplete = () => {
    setIsCompiling(false);
    setCompilationComplete(true);
    setCurrentStage(compilationStages.length - 1);
  };

  const handleReset = () => {
    setIsCompiling(false);
    setCompilationComplete(false);
    setCurrentStage(0);
  };

  // Mode change: ensure a valid tab is active for the new mode
  useEffect(() => {
    const allowed = viewMode === 'simplified'
      ? ['compiler', 'output']
      : ['compiler', 'tokens', 'parsetree', 'workers', 'output', 'pythonlab', 'gallery'];
    if (!allowed.includes(activePanel)) {
      setActivePanel('compiler');
    }
  try { localStorage.setItem('viewMode', viewMode); } catch(_) {}
  const params = new URLSearchParams(window.location.search);
  params.set('mode', viewMode);
  const url = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, '', url);
  }, [viewMode, activePanel]);
  // Persist active panel and reflect in URL
  useEffect(() => {
    try { localStorage.setItem('activePanel', activePanel); } catch(_) {}
    const params = new URLSearchParams(window.location.search);
    params.set('tab', activePanel);
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', url);
  }, [activePanel]);

  const handleLanguageChange = (newLanguage) => {
    setSelectedLanguage(newLanguage);
    try { localStorage.setItem('language', newLanguage); } catch(_) {}
    if (!code.trim() || window.confirm('Load sample code for ' + newLanguage.toUpperCase() + '? This will replace your current code.')) {
      setCode(codeTemplates[newLanguage] || '');
      try { localStorage.setItem('code', codeTemplates[newLanguage] || ''); } catch(_) {}
    }
  };

  const loadTemplate = () => {
    setCode(codeTemplates[selectedLanguage] || '');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 p-3 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center justify-between md:justify-start space-x-4">
          <h1 className="text-lg md:text-xl font-bold">
            <span className="text-blue-500">Interactive</span> Compiler Classroom
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-2 md:gap-4">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            languages={supportedLanguages}
          />
          {/* View Mode Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Mode:</span>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:border-blue-500"
            >
              <option value="learning">Learning</option>
              <option value="advanced">Advanced</option>
              <option value="simplified">Simplified</option>
            </select>
          </div>
          <button
            onClick={loadTemplate}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 md:px-4 rounded"
          >
            Load Template
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Code Editor */}
        <div className="w-full md:w-1/2 p-2 md:p-4">
          <CodeEditor 
            code={code}
            onChange={handleCodeChange}
            isCompiling={isCompiling}
            language={selectedLanguage}
          />
        </div>

        {/* Compiler Visualization */}
        <div className="w-full md:w-1/2 p-2 md:p-4 flex flex-col">
          {viewMode !== 'simplified' && (
            <div className="mb-3 md:mb-4">
              <StageTimeline
                stages={compilationStages}
                currentStage={currentStage}
                onStageClick={(stageIndex) => {
                  setCurrentStage(stageIndex);
                  console.log('Stage clicked:', compilationStages[stageIndex]);
                }}
                isPlaying={isCompiling}
              />
            </div>
          )}

          <div className="flex items-center gap-2 md:space-x-4 mb-3 md:mb-4">
            <button
              onClick={handleCompile}
              disabled={isCompiling}
              className={`flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ${
                isCompiling ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isCompiling ? (
                <span className="flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Compiling...</span>
                </span>
              ) : (
                'Compile'
              )}
            </button>
            {isCompiling && (
              <div className="hidden md:block text-sm text-yellow-300">Compilation in progress…</div>
            )}
            <button
              onClick={handleReset}
              disabled={!isCompiling && !compilationComplete}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                !isCompiling && !compilationComplete
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-500 text-white'
              }`}
            >
              Reset
            </button>
          </div>

          {/* Mobile sticky toolbar */}
          <div className="fixed bottom-2 left-2 right-2 z-50 md:hidden">
            <div className="bg-gray-800/90 backdrop-blur rounded-xl shadow-lg border border-gray-700 flex items-center p-2 gap-2">
              <button
                onClick={handleCompile}
                disabled={isCompiling}
                className={`flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ${
                  isCompiling ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isCompiling ? 'Compiling…' : 'Run ▶'}
              </button>
              <button
                onClick={handleReset}
                disabled={!isCompiling && !compilationComplete}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  !isCompiling && !compilationComplete
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {isCompiling ? 'Stop' : 'Reset'}
              </button>
            </div>
          </div>

          {/* Tabbed Interface */}
          <div className="flex flex-col flex-grow">
            <div className="border-b border-gray-700">
              <nav className="flex space-x-2 md:space-x-4 overflow-x-auto no-scrollbar">
                {(viewMode === 'simplified' 
                  ? ['Compiler', 'Output'] 
                  : ['Compiler', 'Tokens', 'Parse Tree', 'Workers', 'Output']
                ).concat(['Python Lab', 'Gallery']).map((tab) => (
                  <button
                    key={tab}
                    className={`py-2 px-3 md:px-4 text-sm md:text-base font-medium rounded-t-lg ${
                      activePanel === tab.toLowerCase().replace(/\s+/g, '')
                        ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => !isCompiling && setActivePanel(tab.toLowerCase().replace(/\s+/g, ''))}
                    disabled={isCompiling}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-grow p-2 md:p-4">
              {activePanel === 'compiler' && (
                <div className="h-full">
                  <CompilerAnimation
                    code={code}
                    language={selectedLanguage}
                    isCompiling={isCompiling}
                    onCompilationComplete={handleCompilationComplete}
                    viewMode={viewMode}
                    controls={true}
                    onControl={(action) => {
                      // bridge simple controls into stage cycling / compile flow
                      if (action === 'restart') {
                        handleReset();
                        handleCompile();
                      } else if (action === 'next') {
                        setCurrentStage((s) => Math.min(s + 1, 6));
                      } else if (action === 'prev') {
                        setCurrentStage((s) => Math.max(s - 1, 0));
                      }
                    }}
                  />
                </div>
              )}

              {activePanel === 'tokens' && (
                <div className="h-full">
                  <TokenViewer
                    code={code}
                    language={selectedLanguage}
                    isRealTime={true}
                  />
                </div>
              )}


      {activePanel === 'parsetree' && (
        <div className="h-full">
          <ParserTreeGraph
            code={code}
            onNodeClick={setSelectedNode}
            selectedNode={selectedNode}
          />
        </div>
      )}

      {activePanel === 'pythonlab' && (
        <div className="h-full">
          <PythonLab />
        </div>
      )}

      {activePanel === 'gallery' && (
        <div className="h-full">
          <Gallery />
        </div>
      )}

              {activePanel === 'workers' && (
                <div className="h-full">
                  <CompilerWorkers
                    currentStage={currentStage}
                    isPlaying={isCompiling}
                  />
                  <div className="mt-4 text-xs text-gray-400">
                    <span className="inline-block mr-4"><span className="inline-block w-3 h-3 bg-blue-600 rounded-full mr-1"></span>Active Worker</span>
                    <span className="inline-block mr-4"><span className="inline-block w-3 h-3 bg-gray-700 rounded-full mr-1"></span>Idle Worker</span>
                  </div>
                </div>
              )}

      {activePanel === 'output' && (
                <div className="h-full">
                  <TerminalOutput
                    isCompiling={isCompiling}
                    compilationComplete={compilationComplete}
        code={code}
        language={selectedLanguage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Stage Timeline (Classroom Mode Only) */}
  {viewMode === 'learning' && (
    <div className={`h-16 bg-gray-800 border-t border-gray-700 ${isCompiling ? 'opacity-75 pointer-events-none' : ''}`}>
          <StageTimeline
            stages={compilationStages}
            currentStage={currentStage}
            onStageClick={(stageIndex) => {
              setCurrentStage(stageIndex);
              console.log('Stage clicked:', compilationStages[stageIndex]);
            }}
      isPlaying={isCompiling}
          />
        </div>
      )}

      {/* Help Overlay (shown when no code is present) */}
      {!code.trim() && !isCompiling && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-8 max-w-lg mx-4 text-center border border-gray-700 shadow-2xl"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-3">Welcome Young Coder! 👨‍💻👩‍💻</h2>
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">
              Ready to learn how computers understand your code? This fun tool will show you 
              step-by-step how your programs come to life! ✨
            </p>
            
            <div className="space-y-3 text-left text-lg text-gray-400 mb-8">
              <div className="flex items-center space-x-3">
                <span className="text-green-400 text-2xl">📝</span>
                <span>Write cool code in JavaScript or Python!</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-blue-400 text-2xl">🎬</span>
                <span>Watch amazing animations of how it works!</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-yellow-400 text-2xl">🖥️</span>
                <span>See your program run and create output!</span>
              </div>
            </div>
            
            <button
              onClick={() => setCode(`# Welcome to Python Programming! 🐍
# Python is super easy to learn and fun to use!

def say_hello(name):
    print(f"Hello, {name}! 🌟")

# Let's call our function
say_hello("Young Coder")

# Try some math!
age = 10
next_year = age + 1
print(f"Next year you'll be {next_year} years old! 🎂")

# Python makes coding fun!
for i in range(3):
    print(f"Coding is awesome! #{i + 1} 🚀")`)}
              className="px-8 py-3 bg-gradient-to-r from-stage-primary to-stage-secondary hover:from-stage-secondary hover:to-stage-primary text-white rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🚀 Start Coding Adventure!
            </button>
          </motion.div>
        </motion.div>
      )}


    </div>
  );
}

export default App;
