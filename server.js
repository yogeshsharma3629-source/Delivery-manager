const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Database Connection Config
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Yogesh22',
  database: 'delivery_db'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL Database successfully!');
  }
});

// 1. LOGIN API ENDPOINT
app.post('/api/login', (req, res) => {
  const { tourId, password } = req.body;

  if (!tourId || !password) {
    return res.status(400).json({ success: false, message: 'Tour ID and Password are required' });
  }

  const sql = 'SELECT driver_name FROM drivers WHERE tour_id = ? AND password = ?';
  db.query(sql, [tourId, password], (err, results) => {
    if (err) {
      console.error('Login query error:', err);
      return res.status(500).json({ success: false, message: 'Database query error' });
    }

    if (results.length > 0) {
      res.json({ success: true, driverName: results[0].driver_name });
    } else {
      res.json({ success: false, message: 'Invalid Tour ID or Password' });
    }
  });
});

// 2. GET DELIVERIES FILTERED BY LOGGED-IN TOUR ID
app.get('/api/deliveries', (req, res) => {
  const tourId = req.query.tourId;

  if (!tourId) {
    return res.status(400).json({ success: false, message: 'Tour ID query parameter is required' });
  }

  // Filters by tour_id column so drivers only see their assigned tour
  const sql = 'SELECT * FROM deliveries WHERE tour_id = ? ORDER BY plz ASC, address ASC';

  db.query(sql, [tourId], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ success: false, message: 'Database query error' });
    }

    const formattedDeliveries = results.map(item => ({
      ...item,
      map_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.address}, ${item.plz}`)}`
    }));

    res.json({ success: true, deliveries: formattedDeliveries });
  });
});

// START SERVER
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});