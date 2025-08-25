import React, { useEffect, useState } from 'react';

export default function Gallery() {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/snippets');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        if (!cancelled) setSnippets(data);
      } catch (e) {
        if (!cancelled) setError('Could not load snippets');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="p-4 text-gray-400">Loading gallery…</div>;
  if (error) return <div className="p-4 text-red-400">{error}</div>;

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold">Public Snippets</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {snippets.map((s) => (
          <a key={s.id} href={`/?snippet=${s.id}&tab=pythonlab`} className="block bg-gray-800 border border-gray-700 rounded p-3 hover:border-blue-500">
            <div className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleString()}</div>
            <div className="text-sm mt-1 font-medium">{s.language?.toUpperCase() || 'PYTHON'}</div>
            <pre className="mt-2 text-xs text-gray-300 max-h-24 overflow-hidden whitespace-pre-wrap">{(s.code || '').slice(0, 400)}</pre>
          </a>
        ))}
      </div>
    </div>
  );
}
