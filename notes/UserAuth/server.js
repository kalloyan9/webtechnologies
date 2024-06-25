const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');


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
  

const cookieParser = require('cookie-parser')
const express = require('express')
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.json());

// endpoint used for printing notes on the screen
app.post('/notes', async (req, res) => {
    console.log('Reached main server though middleware')
    let cookiesSplit =  await handleCookies(String(req.headers.cookie))
    // console.log(cookiesSplit)
    // let validNotes = notes.filter(note => note.username === cookiesSplit.username)
    // res.send(validNotes)

    const author = cookiesSplit.username;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM NOTES WHERE author = ?',
      [author]
    );

    console.log(rows);
    res.send(rows);
})

// DELETE endpoint to delete a note
app.delete('/notes', async (req, res) => {
    let cookiesSplit = await handleCookies(String(req.headers.cookie));
    const author = cookiesSplit.username;
    const { title } = req.body;
    console.log("Deleting title:", title, "by author:", author);

    if (!author || !title) {
        return res.sendStatus(400);
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
        'DELETE FROM NOTES WHERE title = ? AND author = ?',
        [title, author]
    );
    connection.release();

    res.sendStatus(200);
});

app.put('/notes', async (req, res) => {
    let cookiesSplit = await handleCookies(String(req.headers.cookie));
    const author = cookiesSplit.username;
    const { title } = req.body;
    // console.log("TITLEEEEEEEEEEEEEE:", req.body["title"]);
    const content = req.body["content"];

    if (!author || !title) {
        return res.sendStatus(400); // Bad request if author or title is missing
    }

    // check note existing:
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM NOTES WHERE author = ? AND title = ?',
      [author, title]
    );
    connection.release();

    // if existing - change
    if (rows.length > 0) {
        const [result] = await connection.query(
            'UPDATE NOTES SET content = ? WHERE title = ? AND author = ?',
            [content, title, author]
        );
        connection.release();
    } else { // not existing - create
        const [result] = await connection.query(
            'INSERT INTO NOTES (title, content, author) VALUES (?, ?, ?)',
            [title, content, author]
        );
        connection.release();
    }


    res.sendStatus(200); // Send status 200 on successful deletion
});


function handleCookies(cookiesString){


    const table = cookiesString.split("; ")
    .map(pair => pair.split("="));

    const result = Object.fromEntries(table);

   return result;
}








app.listen(3002);
