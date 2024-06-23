"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var mysql = require("mysql2/promise");
var app = express();
var PORT = 3000;
// MySQL Connection Pool
var pool = mysql.createPool({
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
app.post('/notes', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, content, author, connection, result, insertId, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, title = _a.title, content = _a.content, author = _a.author;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, pool.getConnection()];
            case 2:
                connection = _b.sent();
                return [4 /*yield*/, connection.query('INSERT INTO NOTES (title, content, author) VALUES (?, ?, ?)', [title, content, author])];
            case 3:
                result = (_b.sent())[0];
                connection.release(); // Release connection back to the pool
                insertId = result.insertId;
                if (insertId) {
                    res.status(201).json({ message: 'Note created successfully', noteId: insertId });
                }
                else {
                    throw new Error('Insert failed or insertId not available');
                }
                return [3 /*break*/, 5];
            case 4:
                error_1 = _b.sent();
                console.error('Error inserting note:', error_1);
                res.status(500).json({ message: 'Error inserting note' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Endpoint to handle GET requests to fetch all notes
app.get('/notes', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, rows, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, pool.getConnection()];
            case 1:
                connection = _a.sent();
                return [4 /*yield*/, connection.query('SELECT * FROM NOTES')];
            case 2:
                rows = (_a.sent())[0];
                connection.release(); // Release connection back to the pool
                res.status(200).json(rows);
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error('Error fetching notes:', error_2);
                res.status(500).json({ message: 'Error fetching notes' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Endpoint to handle GET requests to fetch a note by ID
app.get('/notes/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var noteId, connection, rows, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                noteId = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, pool.getConnection()];
            case 2:
                connection = _a.sent();
                return [4 /*yield*/, connection.query('SELECT * FROM NOTES WHERE id = ?', [noteId])];
            case 3:
                rows = (_a.sent())[0];
                connection.release(); // Release connection back to the pool
                if (rows.length === 1) {
                    res.status(200).json(rows[0]);
                }
                else {
                    res.status(404).json({ message: 'Note not found' });
                }
                return [3 /*break*/, 5];
            case 4:
                error_3 = _a.sent();
                console.error('Error fetching note:', error_3);
                res.status(500).json({ message: 'Error fetching note' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Endpoint to handle PUT requests to update a note by ID
app.put('/notes/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var noteId, _a, title, content, author, connection, result, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                noteId = req.params.id;
                _a = req.body, title = _a.title, content = _a.content, author = _a.author;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, pool.getConnection()];
            case 2:
                connection = _b.sent();
                return [4 /*yield*/, connection.query('UPDATE NOTES SET title = ?, content = ?, author = ? WHERE id = ?', [title, content, author, noteId])];
            case 3:
                result = (_b.sent())[0];
                connection.release(); // Release connection back to the pool
                if (result.affectedRows === 1) {
                    res.status(200).json({ message: 'Note updated successfully' });
                }
                else {
                    res.status(404).json({ message: 'Note not found or no changes made' });
                }
                return [3 /*break*/, 5];
            case 4:
                error_4 = _b.sent();
                console.error('Error updating note:', error_4);
                res.status(500).json({ message: 'Error updating note' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Endpoint to handle DELETE requests to delete a note by ID
app.delete('/notes/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var noteId, connection, result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                noteId = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, pool.getConnection()];
            case 2:
                connection = _a.sent();
                return [4 /*yield*/, connection.query('DELETE FROM NOTES WHERE id = ?', [noteId])];
            case 3:
                result = (_a.sent())[0];
                connection.release(); // Release connection back to the pool
                if (result.affectedRows === 1) {
                    res.status(200).json({ message: 'Note deleted successfully' });
                }
                else {
                    res.status(404).json({ message: 'Note not found or already deleted' });
                }
                return [3 /*break*/, 5];
            case 4:
                error_5 = _a.sent();
                console.error('Error deleting note:', error_5);
                res.status(500).json({ message: 'Error deleting note' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Start the server
app.listen(PORT, function () {
    console.log("Server is running on http://localhost:".concat(PORT));
});
