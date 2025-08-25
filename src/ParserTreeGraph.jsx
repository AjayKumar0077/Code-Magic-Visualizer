import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Parser Tree Graph - Live AST Visualization
 * Shows the actual structure of parsed code with 17 children nodes
 */

const ParserTreeGraph = ({ code, onNodeClick, selectedNode }) => {
  const [treeData, setTreeData] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);


  // Removed default mocked AST generator (replaced by dynamic AST)

  // Replace default mocked tree with auto-generated AST from user input
  const generateDynamicAST = (sourceCode) => {
    const trimmed = (sourceCode || '').trim();
    const root = {
      id: 'root',
      type: 'Program',
      label: 'Program',
      children: [],
      level: 0,
      position: { x: 400, y: 50 },
      description: trimmed ? 'Root of the program - auto AST from your code' : 'Root of the program - empty',
      properties: { sourceType: 'script' }
    };

    if (!trimmed) {
      return { ...root, allNodes: [root] };
    }

    // Simple JS-like heuristic parser
    const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const children = [];
    let idx = 0;
    const gridPos = () => { const col = idx % 4; const row = Math.floor(idx / 4); idx += 1; return { x: 100 + col * 200, y: 150 + row * 120 }; };

    const addChild = (node) => { children.push(node); root.children.push(node.id); };

    lines.forEach((line, i) => {
      // function foo(a, b) { ... }
      const fn = line.match(/^function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)/);
      if (fn) {
        const name = fn[1];
        const params = fn[2].split(',').map(s => s.trim()).filter(Boolean);
        const pos = gridPos();
        addChild({ id: `fn_${i}`, type: 'FunctionDeclaration', label: name, children: params.map((p, k) => `param_${i}_${k}`), level: 1, position: pos, description: `Function: ${name}`, properties: { params } });
        params.forEach((p, k) => children.push({ id: `param_${i}_${k}`, type: 'Identifier', label: p, children: [], level: 2, position: { x: pos.x, y: pos.y + 60 + k * 22 }, description: `Parameter: ${p}`, properties: {} }));
        return;
      }
      // let/const/var name = init;
      const vd = line.match(/^(let|const|var)\s+([A-Za-z_][A-Za-z0-9_]*)(\s*=\s*(.*?))?;?$/);
      if (vd) {
        const kind = vd[1]; const name = vd[2]; const init = vd[4] || null; const pos = gridPos();
        addChild({ id: `var_${i}`, type: 'VariableDeclaration', label: name, children: init ? [`init_${i}`] : [], level: 1, position: pos, description: `Variable: ${name}`, properties: { kind, init } });
        if (init) children.push({ id: `init_${i}`, type: 'Init', label: String(init).slice(0, 16), children: [], level: 2, position: { x: pos.x, y: pos.y + 60 }, description: `Initializer: ${init}`, properties: {} });
        return;
      }
      // return expr;
      const rt = line.match(/^return\s+(.+);?$/);
      if (rt) { const arg = rt[1]; addChild({ id: `ret_${i}`, type: 'ReturnStatement', label: `return ${arg.slice(0, 16)}`, children: [], level: 1, position: gridPos(), description: `Return: ${arg}`, properties: {} }); return; }
      // call like foo(x, y)
      const call = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\((.*)\);?$/);
      if (call) {
        const callee = call[1]; const args = call[2].split(',').map(s => s.trim()).filter(Boolean); const pos = gridPos();
        addChild({ id: `call_${i}`, type: 'CallExpression', label: `${callee}(…)`, children: args.map((a, k) => `arg_${i}_${k}`), level: 1, position: pos, description: `Call: ${callee}`, properties: { args } });
        args.forEach((a, k) => children.push({ id: `arg_${i}_${k}`, type: 'Argument', label: a.slice(0, 12), children: [], level: 2, position: { x: pos.x, y: pos.y + 60 + k * 20 }, description: `Argument: ${a}`, properties: {} }));
        return;
      }
      // generic expression fallback
      const asg = line.replace(/[;]+$/, '').trim();
      if (asg) addChild({ id: `expr_${i}`, type: 'ExpressionStatement', label: asg.slice(0, 16), children: [], level: 1, position: gridPos(), description: `Expression: ${asg}`, properties: {} });
    });

    return { ...root, allNodes: [root, ...children] };
  };

  useEffect(() => {
    const ast = generateDynamicAST(code);
    setTreeData(ast);
  }, [code]);

  const renderNode = (node, isSelected, isHovered) => {
    const nodeColors = {
      Program: '#3B82F6',
      FunctionDeclaration: '#10B981',
      VariableDeclaration: '#F59E0B',
      ExpressionStatement: '#EF4444',
      ReturnStatement: '#8B5CF6',
      BinaryExpression: '#06B6D4',
      default: '#6B7280'
    };

    const color = nodeColors[node.type] || nodeColors.default;
    const scale = isSelected ? 1.2 : isHovered ? 1.1 : 1;

    return (
      <g key={node.id}>
        <motion.circle
          cx={node.position.x}
          cy={node.position.y}
          r={25}
          fill={color}
          stroke={isSelected ? '#FFFFFF' : color}
          strokeWidth={isSelected ? 3 : 2}
          className="cursor-pointer"
          style={{ scale }}
          onClick={() => onNodeClick(node)}
          onMouseEnter={() => setHoveredNode(node)}
          onMouseLeave={() => setHoveredNode(null)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        />
        
        <text
          x={node.position.x}
          y={node.position.y + 5}
          textAnchor="middle"
          className="text-xs fill-white font-bold pointer-events-none"
        >
          {node.label.substring(0, 8)}
        </text>
        
        <text
          x={node.position.x}
          y={node.position.y + 40}
          textAnchor="middle"
          className="text-xs fill-gray-300 pointer-events-none"
        >
          {node.type}
        </text>
      </g>
    );
  };

  const renderConnections = (parent, children) => {
    return children.map(child => (
      <line
        key={`${parent.id}-${child.id}`}
        x1={parent.position.x}
        y1={parent.position.y + 25}
        x2={child.position.x}
        y2={child.position.y - 25}
        stroke="#4B5563"
        strokeWidth={1}
        className="opacity-60"
      />
    ));
  };

  if (!treeData) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 h-full flex items-center justify-center">
        <div className="text-gray-400">Enter code to see parser tree...</div>
      </div>
    );
  }

  const rootNode = treeData;
  const childNodes = treeData.allNodes?.filter(node => node.level === 1) || [];

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold text-lg">Parser Tree - Live AST</h3>
        <div className="text-sm text-gray-400">
          {childNodes.length} children nodes
        </div>
      </div>
      
      <div className="flex-grow bg-gray-900 rounded-lg p-4 overflow-auto">
        <svg 
          width="800" 
          height="600" 
          className="w-full"
          viewBox={`0 0 800 600`}
        >
          {/* Render connections */}
          {renderConnections(rootNode, childNodes)}
          
          {/* Render root node */}
          {renderNode(rootNode, selectedNode?.id === rootNode.id, hoveredNode?.id === rootNode.id)}
          
          {/* Render child nodes */}
          {childNodes.map(child => 
            renderNode(
              child, 
              selectedNode?.id === child.id, 
              hoveredNode?.id === child.id
            )
          )}
        </svg>
      </div>
      
      {/* Node details panel */}
      {(selectedNode || hoveredNode) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-gray-700 rounded-lg"
        >
          <h4 className="text-white font-semibold mb-2">
            {(selectedNode || hoveredNode).label}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">Type:</span>
              <span className="text-white ml-2">{(selectedNode || hoveredNode).type}</span>
            </div>
            <div>
              <span className="text-gray-400">Level:</span>
              <span className="text-white ml-2">{(selectedNode || hoveredNode).level}</span>
            </div>
            <div>
              <span className="text-gray-400">Children:</span>
              <span className="text-white ml-2">{(selectedNode || hoveredNode).children?.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-400">ID:</span>
              <span className="text-white ml-2">{(selectedNode || hoveredNode).id}</span>
            </div>
          </div>
          <p className="text-gray-300 text-sm mt-2">
            {(selectedNode || hoveredNode).description}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ParserTreeGraph;
