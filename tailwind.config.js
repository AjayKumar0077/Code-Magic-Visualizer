/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'editor-bg': '#1e1e1e',
        'editor-sidebar': '#252526',
        'terminal-bg': '#0c0c0c',
        'stage-primary': '#007acc',
        'stage-secondary': '#4fc1ff',
        'token-keyword': '#569cd6',
        'token-string': '#ce9178',
        'token-comment': '#6a9955',
        'token-number': '#b5cea8',
      },
      fontFamily: {
        'mono': ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounce 1s ease-in-out 3',
      }
    },
  },
  plugins: [],
}
