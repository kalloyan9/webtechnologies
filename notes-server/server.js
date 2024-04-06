var express = require('express');
var expressModule = require('express'); // Import express module
var ExpressRequest = expressModule.Request; // Extract Request from express module
var ExpressResponse = expressModule.Response; // Extract Response from express module
var fs = require('fs');
var path = require('path');
var app = express();
app.use(express.json());
var NOTES_FILE_PATH = './notes.json';
var HTTP_STATUS_OK = 200;
var HTTP_STATUS_CREATED = 201;
var HTTP_STATUS_NOT_FOUND = 404;
var HTTP_STATUS_NO_CONTENT = 204;
var HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
if (!fs.existsSync(NOTES_FILE_PATH)) {
    fs.writeFileSync(NOTES_FILE_PATH, '[]');
}
app.get('/api/notes', function (req, res) {
    try {
        var data = fs.readFileSync(NOTES_FILE_PATH, 'utf-8');
        var notes = JSON.parse(data);
        res.status(HTTP_STATUS_OK).json(notes);
    }
    catch (error) {
        console.error('Error fetching notes:', error);
        res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Error fetching notes');
    }
});
app.post('/api/notes', function (req, res) {
    try {
        var content = req.body.content;
        var data = fs.readFileSync(NOTES_FILE_PATH, 'utf-8');
        var notes = JSON.parse(data);
        var newNote = { id: notes.length + 1, content: content };
        notes.push(newNote);
        fs.writeFileSync(NOTES_FILE_PATH, JSON.stringify(notes));
        res.status(HTTP_STATUS_CREATED).json(newNote);
    }
    catch (error) {
        console.error('Error creating note:', error);
        res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Error creating note');
    }
});
app.put('/api/notes/:id', function (req, res) {
    try {
        var id_1 = req.params.id;
        var content = req.body.content;
        var data = fs.readFileSync(NOTES_FILE_PATH, 'utf-8');
        var notes = JSON.parse(data);
        var index = notes.findIndex(function (note) { return note.id === parseInt(id_1); });
        if (index !== -1) {
            notes[index].content = content;
            fs.writeFileSync(NOTES_FILE_PATH, JSON.stringify(notes));
            res.status(HTTP_STATUS_OK).json(notes[index]);
        }
        else {
            res.status(HTTP_STATUS_NOT_FOUND).send('Note not found');
        }
    }
    catch (error) {
        console.error('Error updating note:', error);
        res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Error updating note');
    }
});
app.delete('/api/notes/:id', function (req, res) {
    try {
        var id_2 = req.params.id;
        var data = fs.readFileSync(NOTES_FILE_PATH, 'utf-8');
        var notes = JSON.parse(data);
        var filteredNotes = notes.filter(function (note) { return note.id !== parseInt(id_2); });
        if (filteredNotes.length < notes.length) {
            fs.writeFileSync(NOTES_FILE_PATH, JSON.stringify(filteredNotes));
            res.sendStatus(HTTP_STATUS_NO_CONTENT);
        }
        else {
            res.status(HTTP_STATUS_NOT_FOUND).send('Note not found');
        }
    }
    catch (error) {
        console.error('Error deleting note:', error);
        res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send('Error deleting note');
    }
});
var PORT = 3000;
app.listen(PORT, function () {
    console.log("Server is running on port ".concat(PORT));
});
