const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;   // Use dynamic port for Heroku

// Middleware
app.use(cors());
app.use(express.json());

// Serve audio files statically
app.use('/audio', express.static(path.join(__dirname, 'public/audio')));

// Connect to SQLite database
const dbPath = path.join(__dirname, 'tamil_alphabets.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// API Routes

// Get all alphabets
app.get('/api/alphabets', (req, res) => {
  db.all('SELECT * FROM tamil_alphabets ORDER BY display_order', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get alphabets by category
app.get('/api/alphabets/category/:category', (req, res) => {
  const { category } = req.params;
  db.all(
    'SELECT * FROM tamil_alphabets WHERE category = ? ORDER BY display_order',
    [category],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get single alphabet by ID
app.get('/api/alphabets/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM tamil_alphabets WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Serve React app in production (optional if frontend is deployed separately)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
