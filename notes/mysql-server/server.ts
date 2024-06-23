import { Request, Response, Application } from 'express';
import express = require('express');
import * as mysql from 'mysql2/promise';

const app = express();
const PORT = 3000;

// MySQL Connection Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'dev',
  password: '123',
  database: 'mydatabase',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to handle POST requests to create a note
app.post('/notes', async (req: Request, res: Response) => {
  const { title, content, author } = req.body;

  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Insert into NOTES table
    const [result] = await connection.query(
      'INSERT INTO NOTES (title, content, author) VALUES (?, ?, ?)',
      [title, content, author]
    );

    connection.release(); // Release connection back to the pool

    // Extract the insertId from the ResultSetHeader
    const insertId = (result as any)?.insertId;

    if (insertId) {
      res.status(201).json({ message: 'Note created successfully', noteId: insertId });
    } else {
      throw new Error('Insert failed or insertId not available');
    }
  } catch (error) {
    console.error('Error inserting note:', error);
    res.status(500).json({ message: 'Error inserting note' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
