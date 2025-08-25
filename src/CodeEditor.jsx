import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, onChange, isCompiling, language = 'javascript' }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      // Configure Monaco Editor for better performance
      const editor = editorRef.current;
      editor.updateOptions({
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        renderLineHighlight: 'gutter',
        automaticLayout: true,
        fontSize: 16, // Larger font for kids
        lineHeight: 24, // More spacing
      });
    }
  }, []);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Custom theme for better visibility
    monaco.editor.defineTheme('compiler-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '569cd6' },
        { token: 'string', foreground: 'ce9178' },
        { token: 'comment', foreground: '6a9955' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'identifier', foreground: '9cdcfe' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264f78',
        'editor.lineHighlightBackground': '#2a2d2e',
      }
    });
    
    monaco.editor.setTheme('compiler-theme');
  };

  const defaultJavaScriptCode = `// Welcome to the Compiler Visualizer! 🎉
// This is JavaScript - a language computers understand!

function sayHello(name) {
  console.log("Hello, " + name + "! 🌟");
}

// Let's call our function
sayHello("Young Coder");

// Try some math!
let age = 10;
let nextYear = age + 1;
console.log("Next year you'll be " + nextYear + " years old! 🎂");`;

  const defaultPythonCode = `# Welcome to Python Programming! 🐍
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
    print(f"Coding is awesome! #{i + 1} 🚀")`;

  const defaultJavaCode = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World! ☕");
    }
}`;

  const defaultCppCode = `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World! ⚡" << endl;
    return 0;
}`;

  const defaultCCode = `#include <stdio.h>

int main() {
    printf("Hello, World! 🔧\n");
    return 0;
}`;

  const getDefaultCode = () => {
    switch (language) {
      case 'python':
        return defaultPythonCode;
      case 'java':
        return defaultJavaCode;
      case 'cpp':
        return defaultCppCode;
      case 'c':
        return defaultCCode;
      default:
        return defaultJavaScriptCode;
    }
  };

  return (
    <div className="h-full bg-editor-bg border-r border-gray-700">
      <div className="flex items-center justify-between p-3 bg-editor-sidebar border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex items-center space-x-4">
          <h2 className="text-sm font-medium text-gray-300">
            {language === 'python' ? '🐍 main.py' :
             language === 'java' ? '☕ Main.java' :
             language === 'cpp' ? '⚡ main.cpp' :
             language === 'c' ? '🔧 main.c' : '📝 main.js'}
          </h2>
        </div>
        <div className="w-12"></div>
      </div>
      
      <div className="relative h-[calc(100%-60px)]">
        {isCompiling && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-stage-primary bg-opacity-20 h-1">
            <div className="h-full bg-stage-primary animate-pulse"></div>
          </div>
        )}
        
        <Editor
          height="100%"
          defaultLanguage="javascript"
          language={language}
          value={code || getDefaultCode()}
          onChange={onChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 16, // Larger font for kids
            fontFamily: 'Consolas, Monaco, Courier New, monospace',
            readOnly: isCompiling,
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            selectOnLineNumbers: true,
            roundedSelection: false,
            automaticLayout: true,
            lineHeight: 24, // More spacing for readability
            wordWrap: 'on',
            contextmenu: false, // Disable right-click for simplicity
          }}

        />
      </div>
    </div>
  );
};

export default CodeEditor;
