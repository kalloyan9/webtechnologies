const express = require('express');
const expressModule = require('express');
const ExpressRequest = expressModule.Request;
const ExpressResponse = expressModule.Response;
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const NOTES_FILE_PATH = './notes.json';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_NO_CONTENT = 204;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

if (!fs.existsSync(NOTES_FILE_PATH)) {
  fs.writeFileSync(NOTES_FILE_PATH, '[]');
}

app.get('/api/notes', (req, res) => {
  try {
    const data = fs.readFileSync(NOTES_FILE_PATH, 'utf-8');
    const notes = JSON.parse(data);
    res.status(HTTP_STATUS_OK).json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Error fetching notes');
  }
});

app.post('/api/notes', (req, res) => {
  try {
    const { content } = req.body;
    const data = fs.readFileSync(NOTES_FILE_PATH, 'utf-8');
    const notes = JSON.parse(data);
    const newNote = { id: notes.length + 1, content };
    notes.push(newNote);
    fs.writeFileSync(NOTES_FILE_PATH, JSON.stringify(notes));
    res.status(HTTP_STATUS_CREATED).json(newNote);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Error creating note');
  }
});

app.put('/api/notes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const data = fs.readFileSync(NOTES_FILE_PATH, 'utf-8');
    let notes = JSON.parse(data);
    const index = notes.findIndex(note => note.id === parseInt(id));
    if (index !== -1) {
      notes[index].content = content;
      fs.writeFileSync(NOTES_FILE_PATH, JSON.stringify(notes));
      res.status(HTTP_STATUS_OK).json(notes[index]);
    } else {
      res.status(HTTP_STATUS_NOT_FOUND).send('Note not found');
    }
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Error updating note');
  }
});

app.delete('/api/notes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = fs.readFileSync(NOTES_FILE_PATH, 'utf-8');
    let notes = JSON.parse(data);
    const filteredNotes = notes.filter(note => note.id !== parseInt(id));
    if (filteredNotes.length < notes.length) {
      fs.writeFileSync(NOTES_FILE_PATH, JSON.stringify(filteredNotes));
      res.sendStatus(HTTP_STATUS_NO_CONTENT);
    } else {
      res.status(HTTP_STATUS_NOT_FOUND).send('Note not found');
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Error deleting note');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
