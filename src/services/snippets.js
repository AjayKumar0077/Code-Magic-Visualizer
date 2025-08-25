export async function saveSnippet({ code, language = 'python', meta = {} }) {
  const res = await fetch('/api/snippets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language, meta })
  });
  if (!res.ok) throw new Error('Failed to save snippet');
  return res.json();
}

export async function loadSnippet(id) {
  const res = await fetch(`/api/snippets/${id}`);
  if (!res.ok) throw new Error('Snippet not found');
  return res.json();
}
