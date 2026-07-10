const express = require('express');
const cors = require('cors');
const path = require('path');
const { initLocal } = require('../lib/db');

const app = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8090';
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/ai', require('./routes/ai'));

// Serve static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 8090;

if (process.env.VERCEL !== '1') {
  initLocal();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
