import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Enhanced Compiler Animation Component
 * Production-ready educational compiler visualization
 */
function CompilerAnimation({ code, language, isCompiling, onCompilationComplete, viewMode = 'learning', controls = false, onControl }) {
  const [currentStage, setCurrentStage] = useState(0);
  const [animationPhase, setAnimationPhase] = useState('idle');
  const [tokens, setTokens] = useState([]);
  // View modes
  const learningMode = viewMode === 'learning';
  const advancedMode = viewMode === 'advanced';
  // const simplifiedMode = viewMode === 'simplified';
  const durationFactor = learningMode ? 1.0 : advancedMode ? 0.6 : 0.35;

  // Enhanced compilation stages with comprehensive metadata
  const stages = useMemo(() => [
    {
      id: 'lexical',
      title: '🔤 Lexical Analysis',
      subtitle: 'Tokenization & Symbol Recognition',
      description: 'Breaking down source code into meaningful tokens (keywords, identifiers, operators, literals)',
      icon: '🔍',
      color: 'from-blue-500 to-cyan-500',
      duration: Math.round(4000 * durationFactor),
      tips: [
        'Tokens are the smallest meaningful units of code',
        'Keywords like "function" and "if" are special tokens',
        'White spaces are usually ignored during tokenization'
      ],
      examples: [
        { input: 'let x = 5;', tokens: ['let', 'x', '=', '5', ';'] },
        { input: 'if (true)', tokens: ['if', '(', 'true', ')'] }
      ],
      steps: [
        '📖 Reading source code character by character',
        '🔍 Identifying token boundaries',
        '🏷️ Classifying tokens by type',
        '✅ Creating token stream'
      ]
    },
    {
      id: 'syntax',
      title: '🌳 Syntax Analysis',
      subtitle: 'Building Parse Trees',
      description: 'Analyzing token sequence to create Abstract Syntax Tree (AST) according to grammar rules',
      icon: '🌲',
      color: 'from-green-500 to-emerald-500',
  duration: Math.round(5000 * durationFactor),
      tips: [
        'The AST represents the hierarchical structure of your code',
        'Grammar rules define how tokens can be combined',
        'Syntax errors are caught at this stage'
      ],
      examples: [
        { input: 'x + y', tree: 'BinaryExpression(x, +, y)' },
        { input: 'if (condition) { }', tree: 'IfStatement(condition, block)' }
      ],
      steps: [
        '🔢 Parsing token sequence',
        '🌳 Building syntax tree nodes',
        '🔗 Connecting parent-child relationships',
        '✅ Validating syntax correctness'
      ]
    },
    {
      id: 'semantic',
      title: '🧠 Semantic Analysis',
      subtitle: 'Type Checking & Scope Resolution',
      description: 'Ensuring code makes logical sense: type compatibility, variable declarations, function calls',
      icon: '🎯',
      color: 'from-purple-500 to-violet-500',
  duration: Math.round(4500 * durationFactor),
      tips: [
        'Semantic analysis checks if your code makes logical sense',
        'Type mismatches are caught here (e.g., adding string to number)',
        'Variable scope and declaration issues are identified'
      ],
      examples: [
        { issue: 'Type mismatch', code: '"hello" + 5', error: 'Cannot add string and number' },
        { issue: 'Undefined variable', code: 'console.log(x)', error: 'Variable x not declared' }
      ],
      steps: [
        '🔍 Symbol table construction',
        '🏷️ Type checking operations',
        '📊 Scope resolution',
        '✅ Semantic validation'
      ]
    },
    {
      id: 'optimization',
      title: '⚡ Code Optimization',
      subtitle: 'Performance Enhancement',
      description: 'Improving code efficiency without changing behavior: dead code elimination, constant folding',
      icon: '🚀',
      color: 'from-orange-500 to-red-500',
  duration: Math.round(3500 * durationFactor),
      tips: [
        'Optimizations make your code run faster',
        'Dead code (unreachable code) is removed',
        'Mathematical expressions are pre-calculated when possible'
      ],
      examples: [
        { before: 'let x = 2 + 3;', after: 'let x = 5;', type: 'Constant folding' },
        { before: 'if (false) { ... }', after: '// removed', type: 'Dead code elimination' }
      ],
      steps: [
        '🔍 Code analysis',
        '⚡ Applying optimizations',
        '📈 Performance improvements',
        '✅ Validation of correctness'
      ]
    },
    {
      id: 'generation',
      title: '⚙️ Code Generation',
      subtitle: 'Target Code Production',
      description: 'Converting optimized AST into target machine code, bytecode, or JavaScript',
      icon: '🏭',
      color: 'from-cyan-500 to-blue-500',
  duration: Math.round(4000 * durationFactor),
      tips: [
        'This is where your high-level code becomes machine instructions',
        'Different targets require different code generators',
        'Register allocation and instruction selection happen here'
      ],
      examples: [
        { source: 'x = y + z', target: 'LOAD R1, y\nADD R1, z\nSTORE R1, x' },
        { source: 'function call', target: 'CALL function_address' }
      ],
      steps: [
        '🎯 Target platform selection',
        '⚙️ Instruction generation',
        '📝 Register allocation',
        '✅ Code emission'
      ]
    }
  ], [durationFactor]);

  // Animation control effects
  useEffect(() => {
    if (isCompiling && animationPhase === 'idle') {
      setAnimationPhase('starting');
      setCurrentStage(0);
    } else if (!isCompiling && animationPhase !== 'idle') {
      setAnimationPhase('completing');
      setTimeout(() => {
        setAnimationPhase('idle');
        if (onCompilationComplete) {
          onCompilationComplete();
        }
      }, 1000);
    }
  }, [isCompiling, animationPhase, onCompilationComplete]);

  // Stage progression effect
  useEffect(() => {
    if (animationPhase === 'starting' || animationPhase === 'running') {
      const timer = setTimeout(() => {
        if (currentStage < stages.length - 1) {
          setCurrentStage(prev => prev + 1);
          setAnimationPhase('running');
        } else {
          setAnimationPhase('completing');
        }
      }, stages[currentStage]?.duration || 1000);

      return () => clearTimeout(timer);
    }
  }, [currentStage, animationPhase, stages]);

  // Simple tokenizer for demonstration
  const tokenizeCode = useCallback((sourceCode) => {
    if (!sourceCode) return [];

    // Regex includes keywords, identifiers, numbers, operators, punctuation
    // Note: ']' must be escaped inside a character class; '[' does not need escaping
    const tokenRegex = /\b(?:function|let|const|var|if|else|for|while|return|class|import|export)\b|[a-zA-Z_][a-zA-Z0-9_]*|[0-9]+\.?[0-9]*|[+\-*/=<>!&|]+|(?:\[|]|[{}();,.])|"[^"]*"|'[^']*'/g;
    const matches = sourceCode.match(tokenRegex) || [];

    return matches.map((token, index) => ({
      id: index,
      value: token,
      type: getTokenType(token),
      position: index
    }));
  }, []);

  const getTokenType = (token) => {
    const keywords = ['function', 'let', 'const', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export'];
    const operators = ['+', '-', '*', '/', '=', '<', '>', '!', '&', '|', '==', '!=', '<=', '>='];
    const punctuation = ['{', '}', '(', ')', '[', ']', ';', ',', '.'];
    
    if (keywords.includes(token)) return 'keyword';
    if (operators.some(op => token.includes(op))) return 'operator';
    if (punctuation.includes(token)) return 'punctuation';
    if (/^[0-9]/.test(token)) return 'number';
    if (/^["']/.test(token)) return 'string';
    return 'identifier';
  };

  useEffect(() => {
    if (code) {
      setTokens(tokenizeCode(code));
    }
  }, [code, tokenizeCode]);

  const getStageProgress = () => {
    if (animationPhase === 'idle') return 0;
    if (animationPhase === 'completing') return 100;
    return ((currentStage + 1) / stages.length) * 100;
  };

  const currentStageData = stages[currentStage];

  return (
    <div className="h-full bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: isCompiling ? 360 : 0 }}
              transition={{ duration: 2, repeat: isCompiling ? Infinity : 0, ease: "linear" }}
              className="text-2xl"
            >
              ⚙️
            </motion.div>
            <div>
              <h2 className="text-lg font-bold text-white">Compiler Pipeline</h2>
              <p className="text-sm text-gray-400">
                {animationPhase === 'idle' ? 'Ready to compile' : 
                 animationPhase === 'completing' ? 'Compilation complete!' :
                 `Stage ${currentStage + 1} of ${stages.length}`}
              </p>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center space-x-3">
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${getStageProgress()}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm text-gray-300 min-w-max">
              {Math.round(getStageProgress())}%
            </span>
          </div>
        </div>
      </div>

      {/* Controls (optional) */}
      {controls && (
        <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center gap-2 justify-end">
          <button
            onClick={() => onControl && onControl('prev')}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm"
          >Prev</button>
          <button
            onClick={() => onControl && onControl('next')}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm"
          >Next</button>
          <button
            onClick={() => onControl && onControl('restart')}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm"
          >Restart</button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        <AnimatePresence mode="wait">
          {currentStageData && (
            <motion.div
              key={currentStageData.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Stage header */}
              <div className={`bg-gradient-to-r ${currentStageData.color} p-6 rounded-lg text-white`}>
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{currentStageData.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{currentStageData.title}</h3>
                    <p className="text-lg opacity-90">{currentStageData.subtitle}</p>
                    <p className="mt-2 opacity-80">{currentStageData.description}</p>
                  </div>
                </div>
              </div>

              {/* Learning content (classroom mode) */}
              {learningMode && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Learning tips */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      💡 Learning Tips
                    </h4>
                    <ul className="space-y-2">
                      {currentStageData.tips?.map((tip, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="text-gray-300 flex items-start space-x-2"
                        >
                          <span className="text-yellow-400 mt-1">▶</span>
                          <span>{tip}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Examples */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      📝 Examples
                    </h4>
                    <div className="space-y-3">
                      {currentStageData.examples?.map((example, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.3 }}
                          className="bg-gray-700 rounded p-3"
                        >
                          {example.input && (
                            <div className="mb-2">
                              <span className="text-gray-400 text-sm">Input:</span>
                              <code className="block bg-gray-900 text-green-400 p-2 rounded text-sm font-mono">
                                {example.input}
                              </code>
                            </div>
                          )}
                          {example.tokens && (
                            <div>
                              <span className="text-gray-400 text-sm">Tokens:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {example.tokens.map((token, tokenIndex) => (
                                  <span
                                    key={tokenIndex}
                                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-mono"
                                  >
                                    {token}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {example.before && (
                            <div className="space-y-2">
                              <div>
                                <span className="text-gray-400 text-sm">Before:</span>
                                <code className="block bg-gray-900 text-red-400 p-2 rounded text-sm font-mono">
                                  {example.before}
                                </code>
                              </div>
                              <div>
                                <span className="text-gray-400 text-sm">After:</span>
                                <code className="block bg-gray-900 text-green-400 p-2 rounded text-sm font-mono">
                                  {example.after}
                                </code>
                              </div>
                              <span className="text-blue-400 text-sm">{example.type}</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Processing steps */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">🔄 Processing Steps</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentStageData.steps?.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 bg-gray-700 rounded p-3"
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompiling ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-gray-300">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Token visualization for lexical analysis */}
              {currentStageData.id === 'lexical' && tokens.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">🎯 Live Tokenization</h4>
                  <div className="flex flex-wrap gap-2">
                    {tokens.map((token, index) => (
                      <motion.div
                        key={token.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`px-3 py-1 rounded-full text-sm font-mono ${
                          token.type === 'keyword' ? 'bg-purple-600 text-white' :
                          token.type === 'operator' ? 'bg-orange-600 text-white' :
                          token.type === 'number' ? 'bg-green-600 text-white' :
                          token.type === 'string' ? 'bg-yellow-600 text-black' :
                          'bg-blue-600 text-white'
                        }`}
                      >
                        {token.value}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CompilerAnimation;
