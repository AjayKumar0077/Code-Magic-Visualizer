import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-300 mb-4">An unexpected error occurred while rendering the app.</p>
            <pre className="text-xs bg-gray-900 p-3 rounded border border-gray-700 overflow-auto max-h-48">{String(this.state.error)}</pre>
            <button onClick={this.handleReset} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded">Reload View</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
