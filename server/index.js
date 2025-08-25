const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'snippets.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({}), 'utf-8');

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const readAll = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const writeAll = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/snippets', (req, res) => {
  const all = readAll();
  const list = Object.values(all)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 100);
  res.json(list);
});

app.post('/api/snippets', (req, res) => {
  const { code = '', language = 'python', meta = {} } = req.body || {};
  if (typeof code !== 'string' || code.length > 200000) {
    return res.status(400).json({ error: 'Invalid code' });
  }
  const id = nanoid(10);
  const all = readAll();
  const now = Date.now();
  all[id] = { id, code, language, meta, createdAt: now };
  writeAll(all);
  res.json({ id });
});

app.get('/api/snippets/:id', (req, res) => {
  const { id } = req.params;
  const all = readAll();
  const snip = all[id];
  if (!snip) return res.status(404).json({ error: 'Not found' });
  res.json(snip);
});

app.listen(PORT, () => {
  console.log(`Snippet server listening on http://localhost:${PORT}`);
});
