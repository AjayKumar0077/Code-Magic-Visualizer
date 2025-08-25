import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Enhanced Interactive Compiler Classroom Components
 * Production-ready components with advanced features
 */

// TokenViewer Component - Real-time tokenization display
const TokenViewer = ({ code, language = 'javascript' }) => {
  const [tokens, setTokens] = useState([]);

  const performLiveTokenization = useCallback((sourceCode) => {
    const languageConfig = {
      javascript: {
        keywords: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export'],
        operators: ['=', '+', '-', '*', '/', '==', '===', '!=', '!==', '<', '>', '<=', '>=', '&&', '||', '!'],
        delimiters: ['(', ')', '{', '}', '[', ']', ';', ',', '.']
      },
      python: {
        keywords: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except'],
        operators: ['=', '+', '-', '*', '/', '//', '%', '**', '==', '!=', '<', '>', '<=', '>=', 'and', 'or', 'not'],
        delimiters: ['(', ')', '[', ']', ':', ',', '.']
      },
      java: {
        keywords: ['public', 'private', 'class', 'interface', 'if', 'else', 'for', 'while', 'return', 'import', 'package'],
        operators: ['=', '+', '-', '*', '/', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!'],
        delimiters: ['(', ')', '{', '}', '[', ']', ';', ',', '.']
      },
      cpp: {
        keywords: ['int', 'float', 'double', 'char', 'if', 'else', 'for', 'while', 'return', 'class', 'public', 'private'],
        operators: ['=', '+', '-', '*', '/', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!'],
        delimiters: ['(', ')', '{', '}', '[', ']', ';', ',', '.']
      },
      c: {
        keywords: ['int', 'float', 'double', 'char', 'if', 'else', 'for', 'while', 'return', 'struct', 'typedef'],
        operators: ['=', '+', '-', '*', '/', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!'],
        delimiters: ['(', ')', '{', '}', '[', ']', ';', ',', '.']
      }
    };

    const config = languageConfig[language] || languageConfig.javascript;
    const words = sourceCode.split(/(\s+|[^\w\s])/g).filter(word => word.trim());
    
    return words.map((word, index) => {
      const token = {
        id: index,
        value: word,
        position: { start: index, end: index + word.length },
        line: 1,
        column: index
      };

      // Advanced token classification
      if (config.keywords.includes(word)) {
        token.type = 'keyword';
        token.category = 'reserved';
        token.description = 'Reserved language keyword';
        token.color = 'text-blue-400';
        token.bgColor = 'bg-blue-900';
      } else if (config.operators.includes(word)) {
        token.type = 'operator';
        token.category = 'symbol';
        token.description = 'Operator or symbol';
        token.color = 'text-purple-400';
        token.bgColor = 'bg-purple-900';
      } else if (config.delimiters.includes(word)) {
        token.type = 'delimiter';
        token.category = 'punctuation';
        token.description = 'Delimiter or punctuation';
        token.color = 'text-gray-400';
        token.bgColor = 'bg-gray-700';
      } else if (/^\d+(\.\d+)?$/.test(word)) {
        token.type = 'number';
        token.category = 'literal';
        token.description = 'Numeric literal';
        token.color = 'text-yellow-400';
        token.bgColor = 'bg-yellow-900';
      } else if (/^["'].*["']$/.test(word)) {
        token.type = 'string';
        token.category = 'literal';
        token.description = 'String literal';
        token.color = 'text-green-400';
        token.bgColor = 'bg-green-900';
      } else if (/^\/\//.test(word) || /^\/\*/.test(word)) {
        token.type = 'comment';
        token.category = 'documentation';
        token.description = 'Code comment';
        token.color = 'text-gray-500';
        token.bgColor = 'bg-gray-800';
      } else if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(word)) {
        token.type = 'identifier';
        token.category = 'variable';
        token.description = 'User-defined identifier';
        token.color = 'text-cyan-400';
        token.bgColor = 'bg-cyan-900';
      } else {
        token.type = 'unknown';
        token.category = 'error';
        token.description = 'Unrecognized token';
        token.color = 'text-red-400';
        token.bgColor = 'bg-red-900';
      }

      return token;
    });
  }, [language]);

  useEffect(() => {
    if (code) {
      setTokens(performLiveTokenization(code));
    }
  }, [code, performLiveTokenization]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold text-lg">Live Tokenization</h3>
        <div className="text-sm text-gray-400">
          {tokens.length} tokens • {language.toUpperCase()}
        </div>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {tokens.map((token, index) => (
          <motion.div
            key={`${token.id}-${index}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={`flex items-center p-2 rounded ${token.bgColor} border border-opacity-30`}
          >
            <div className={`font-mono text-sm font-bold ${token.color} min-w-[80px]`}>
              "{token.value}"
            </div>
            <div className="flex-1 ml-3">
              <div className="text-xs text-gray-300 uppercase">{token.type}</div>
              <div className="text-xs text-gray-500">{token.description}</div>
            </div>
            <div className="text-xs text-gray-400">
              {token.position.start}:{token.position.end}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Token Statistics */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-white font-semibold mb-2">Statistics</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {['keyword', 'identifier', 'operator', 'literal'].map(type => {
            const count = tokens.filter(t => 
              (t.type === 'keyword' && type === 'keyword') ||
              (t.type === 'identifier' && type === 'identifier') ||
              (t.type === 'operator' && type === 'operator') ||
              (['string', 'number'].includes(t.type) && type === 'literal')
            ).length;
            return (
              <div key={type} className="bg-gray-700 p-2 rounded text-center">
                <div className="text-white font-bold">{count}</div>
                <div className="text-gray-400 capitalize">{type}s</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// StageTimeline Component - Interactive progress bar
const StageTimeline = ({ stages, currentStage, onStageClick, isPlaying }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold">Compilation Pipeline</h3>
        <div className="text-sm text-gray-400">
          Stage {currentStage + 1} of {stages.length}
        </div>
      </div>
      
      <div className="flex space-x-2">
        {stages.map((stage, index) => (
          <button
            key={typeof stage === 'string' ? stage : stage.id}
            onClick={() => onStageClick(index)}
            disabled={isPlaying}
            className={`flex-1 h-16 rounded-lg border-2 transition-all duration-300 ${
              index === currentStage 
                ? 'bg-blue-600 border-blue-400 text-white shadow-lg scale-105' 
                : index < currentStage
                ? 'bg-green-600 border-green-400 text-white hover:scale-105'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:scale-105'
            } ${isPlaying ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <span className="text-2xl mb-1">
                {typeof stage === 'string' 
                  ? ['🔤', '🌳', '🧠', '⚡', '🔧', '🎯'][index] || '📋'
                  : stage.icon
                }
              </span>
              <span className="text-xs font-medium text-center leading-tight">
                {typeof stage === 'string' ? stage : stage.title?.replace(/🔤|🌳|🧠|⚡|🔧|🎯/g, '').trim()}
              </span>
              {index === currentStage && isPlaying && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-white rounded-full mt-1"
                />
              )}
            </div>
          </button>
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4 bg-gray-700 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

// LanguageSelector Component
const LanguageSelector = ({ selectedLanguage, onLanguageChange, languages }) => {
  const [isOpen, setIsOpen] = useState(false);

  const languageInfo = {
    javascript: { name: 'JavaScript', icon: '🟨', extension: '.js' },
    python: { name: 'Python', icon: '🐍', extension: '.py' },
    java: { name: 'Java', icon: '☕', extension: '.java' },
    cpp: { name: 'C++', icon: '⚡', extension: '.cpp' },
    c: { name: 'C', icon: '🔧', extension: '.c' }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition-colors"
      >
        <span className="text-lg">{languageInfo[selectedLanguage]?.icon}</span>
        <span className="font-medium">{languageInfo[selectedLanguage]?.name}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 bg-gray-700 rounded-lg shadow-lg z-10 min-w-[150px]"
          >
            {languages.map(lang => (
              <button
                key={lang}
                onClick={() => {
                  onLanguageChange(lang);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-600 transition-colors ${
                  lang === selectedLanguage ? 'bg-blue-600' : ''
                } ${lang === languages[0] ? 'rounded-t-lg' : ''} ${
                  lang === languages[languages.length - 1] ? 'rounded-b-lg' : ''
                }`}
              >
                <span className="text-lg">{languageInfo[lang]?.icon}</span>
                <div>
                  <div className="text-white font-medium">{languageInfo[lang]?.name}</div>
                  <div className="text-xs text-gray-400">{languageInfo[lang]?.extension}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ParseTree Component - Interactive SVG-based parse tree
const ParseTree = ({ parseData, onNodeClick, selectedNode }) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Normalize and build levels for layout
  const { roots, nodesById, levels, positions, svgSize } = useMemo(() => {
    const data = Array.isArray(parseData) ? parseData : [];
    const nodesById = new Map(data.map(n => [n.id, n]));
    const roots = data.filter(n => n.parent == null);
    // Build levels with BFS
    const levels = [];
    const visited = new Set();
    const queue = [...roots.map(r => ({ node: r, level: 0 }))];
    while (queue.length) {
      const { node, level } = queue.shift();
      if (!levels[level]) levels[level] = [];
      if (!visited.has(node.id)) {
        levels[level].push(node);
        visited.add(node.id);
        (node.children || []).forEach(cid => {
          const c = nodesById.get(cid);
          if (c) queue.push({ node: c, level: level + 1 });
        });
      }
    }
    const maxPerLevel = Math.max(1, ...levels.map(arr => arr.length));
    const levelCount = Math.max(1, levels.length);
    const margin = 40;
    const nodeGapX = 90; // horizontal spacing between siblings
    const nodeGapY = 110; // vertical spacing between levels
    const width = Math.max(600, margin * 2 + (maxPerLevel - 1) * nodeGapX + 80);
    const height = Math.max(300, margin * 2 + (levelCount - 1) * nodeGapY + 80);
    // Compute positions centered per level
    const positions = new Map();
    levels.forEach((arr, level) => {
      const totalWidth = (arr.length - 1) * nodeGapX;
      const baseX = width / 2 - totalWidth / 2;
      arr.forEach((node, idx) => {
        positions.set(node.id, { x: baseX + idx * nodeGapX, y: margin + level * nodeGapY });
      });
    });
    return { roots, nodesById, levels, positions, svgSize: { width, height } };
  }, [parseData]);

  const renderConnections = () => (
    <g>
      {Array.from(nodesById.values()).map((node) => (
        (node.children || []).map((cid) => {
          const child = nodesById.get(cid);
          if (!child) return null;
          const p = positions.get(node.id);
          const c = positions.get(child.id);
          if (!p || !c) return null;
          return (
            <line
              key={`${node.id}-${child.id}`}
              x1={p.x}
              y1={p.y + 20}
              x2={c.x}
              y2={c.y - 20}
              stroke="#6B7280"
              strokeWidth={1}
            />
          );
        })
      ))}
    </g>
  );

  const renderNodes = () => (
    <g>
      {Array.from(nodesById.values()).map((node) => {
        const pos = positions.get(node.id);
        if (!pos) return null;
        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;
        return (
          <g key={node.id}>
            <motion.circle
              cx={pos.x}
              cy={pos.y}
              r={20}
              fill={isSelected ? '#3B82F6' : isHovered ? '#6B7280' : '#374151'}
              stroke={isSelected ? '#60A5FA' : '#6B7280'}
              strokeWidth={2}
              className="cursor-pointer"
              onClick={() => onNodeClick && onNodeClick(node)}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            />
            <text
              x={pos.x}
              y={pos.y + 5}
              textAnchor="middle"
              className="text-xs fill-white font-medium pointer-events-none"
            >
              {String(node.label).substring(0, 12)}
            </text>
          </g>
        );
      })}
    </g>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold">Interactive Parse Tree</h3>
        <div className="text-xs text-gray-400">Roots: {roots.length} • Levels: {levels.length}</div>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
        <svg width={svgSize.width} height={svgSize.height} className="min-w-full">
          {renderConnections()}
          {renderNodes()}
        </svg>
      </div>

      {(selectedNode || hoveredNode) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-gray-700 rounded-lg"
        >
          <h4 className="text-white font-semibold">
            {(selectedNode || hoveredNode).label}
          </h4>
          <p className="text-gray-300 text-sm mt-1">
            {(selectedNode || hoveredNode).description}
          </p>
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
            <span>Type: {(selectedNode || hoveredNode).type}</span>
            <span>Level: {(selectedNode || hoveredNode).level}</span>
            <span>Children: {(selectedNode || hoveredNode).children?.length || 0}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// CompilerWorkers Component - Animated workers visualization
const CompilerWorkers = ({ currentStage, isPlaying }) => {
  const workers = [
    { id: 'lexer', name: 'Lexical Analyzer', icon: '🔍', stage: 0, position: { x: 50, y: 100 } },
    { id: 'parser', name: 'Parser', icon: '🌲', stage: 1, position: { x: 200, y: 100 } },
    { id: 'semantic', name: 'Semantic Analyzer', icon: '🎯', stage: 2, position: { x: 350, y: 100 } },
    { id: 'optimizer', name: 'Optimizer', icon: '⚡', stage: 3, position: { x: 500, y: 100 } },
    { id: 'codegen', name: 'Code Generator', icon: '⚙️', stage: 4, position: { x: 350, y: 200 } },
    { id: 'executor', name: 'Executor', icon: '🚀', stage: 5, position: { x: 200, y: 200 } }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white font-bold mb-4">Compiler Workers</h3>
      <div className="relative bg-gray-900 rounded-lg p-4 h-64">
        <svg width="100%" height="100%" className="absolute inset-0">
          {/* Connection lines */}
          <path
            d="M 50,100 L 200,100 L 350,100 L 500,100 L 350,200 L 200,200"
            stroke="#4B5563"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
          />
          
          {/* Data flow animation */}
          {isPlaying && (
            <motion.circle
              r="4"
              fill="#3B82F6"
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: '100%' }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{
                offsetPath: 'path("M 50,100 L 200,100 L 350,100 L 500,100 L 350,200 L 200,200")',
                offsetRotate: 'auto'
              }}
            />
          )}
        </svg>
        
        {workers.map((worker) => (
          <motion.div
            key={worker.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
              currentStage === worker.stage ? 'z-10' : 'z-0'
            }`}
            style={{ left: worker.position.x, top: worker.position.y }}
            animate={{
              scale: currentStage === worker.stage ? 1.2 : 1,
              opacity: currentStage >= worker.stage ? 1 : 0.5
            }}
            transition={{ duration: 0.3 }}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
              currentStage === worker.stage 
                ? 'bg-blue-600 border-blue-400 shadow-lg' 
                : 'bg-gray-700 border-gray-600'
            }`}>
              <span className="text-2xl">{worker.icon}</span>
            </div>
            <div className="text-center mt-2">
              <div className="text-xs text-white font-medium">{worker.name}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export { TokenViewer, StageTimeline, LanguageSelector, ParseTree, CompilerWorkers };
