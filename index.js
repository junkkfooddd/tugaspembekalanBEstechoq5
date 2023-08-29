const express = require('express');
const app = express();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = mysql.createConnection({
  host: 'localhost',   // Ganti dengan host database Anda
  user: 'root',        // Ganti dengan username database Anda
  password: 'muhammaD33',  // Ganti dengan password database Anda
  database: 'todo_app'  // Ganti dengan nama database Anda
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to database');
  }
});

app.use(express.json());

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  // Hash password using bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user into database
  const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(insertQuery, [username, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error creating user:', err);
      res.status(500).json({ error: 'Failed to create user' });
    } else {
      res.status(201).json({ message: 'User created successfully' });
    }
  });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Retrieve user from database
  const selectQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(selectQuery, [username], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      res.status(500).json({ error: 'Failed to fetch user' });
    } else {
      if (results.length > 0) {
        const user = results[0];

        // Compare hashed password
        const match = await bcrypt.compare(password, user.password);

        if (match) {
          // Generate JWT
          const token = jwt.sign({ userId: user.id }, 'your-secret-key');
          res.json({ token });
        } else {
          res.status(401).json({ error: 'Authentication failed' });
        }
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  });
});

function authenticateToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.userId = decoded.userId;
    next();
  });
}

app.post('/api/add-task', authenticateToken, (req, res) => {
  const { task } = req.body;
  const userId = req.userId; // This is set in the authenticateToken middleware

  // Insert task into tasks table
  const insertTaskQuery = 'INSERT INTO tasks (user_id, task, completed) VALUES (?, ?, false)';
  db.query(insertTaskQuery, [userId, task], (err, result) => {
    if (err) {
      console.error('Error adding task:', err);
      res.status(500).json({ error: 'Failed to add task' });
    } else {
      res.status(201).json({ message: 'Task added successfully' });
    }
  });
});

// Add the new route to register "kipuw"
app.post('/api/register-kipuw', async (req, res) => {
  console.log('Received request to /api/register-kipuw...');
  
  const username = 'kipuw';
  const password = 'muhammaD33';

  console.log('Attempting to register user "kipuw"...');

  // Hash password using bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user into database
  const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(insertQuery, [username, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error creating user:', err);
      res.status(500).json({ error: 'Failed to create user' });
    } else {
      console.log('User "kipuw" registered successfully.');
      res.status(201).json({ message: 'User created successfully' });
    }
  });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
