import { Request, Response, Application } from 'express';
import express = require('express');
import * as mysql from 'mysql2/promise';
import { OkPacket, RowDataPacket } from 'mysql2';

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
    const [result] = await connection.query<OkPacket>(
      'INSERT INTO NOTES (title, content, author) VALUES (?, ?, ?)',
      [title, content, author]
    );

    connection.release(); // Release connection back to the pool

    // Extract the insertId from the ResultSetHeader
    const insertId = result.insertId;

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

// Endpoint to handle GET requests to fetch all notes
app.get('/notes', async (req: Request, res: Response) => {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Query all notes from NOTES table
    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM NOTES');

    connection.release(); // Release connection back to the pool

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// Endpoint to handle GET requests to fetch a note by ID
app.get('/notes/:id', async (req: Request, res: Response) => {
  const noteId = req.params.id;

  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Query note from NOTES table by ID
    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM NOTES WHERE id = ?', [noteId]);

    connection.release(); // Release connection back to the pool

    if (rows.length === 1) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ message: 'Error fetching note' });
  }
});

// Endpoint to handle PUT requests to update a note by ID
app.put('/notes/:id', async (req: Request, res: Response) => {
  const noteId = req.params.id;
  const { title, content, author } = req.body;

  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Update note in NOTES table
    const [result] = await connection.query<OkPacket>(
      'UPDATE NOTES SET title = ?, content = ?, author = ? WHERE id = ?',
      [title, content, author, noteId]
    );

    connection.release(); // Release connection back to the pool

    if (result.affectedRows === 1) {
      res.status(200).json({ message: 'Note updated successfully' });
    } else {
      res.status(404).json({ message: 'Note not found or no changes made' });
    }
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Error updating note' });
  }
});

// Endpoint to handle DELETE requests to delete a note by ID
app.delete('/notes/:id', async (req: Request, res: Response) => {
  const noteId = req.params.id;

  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Delete note from NOTES table by ID
    const [result] = await connection.query<OkPacket>('DELETE FROM NOTES WHERE id = ?', [noteId]);

    connection.release(); // Release connection back to the pool

    if (result.affectedRows === 1) {
      res.status(200).json({ message: 'Note deleted successfully' });
    } else {
      res.status(404).json({ message: 'Note not found or already deleted' });
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Error deleting note' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
