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


let notes = [
    {
        username: 'Tosho',
        title: 'Title1',
        text: 'This is my note'
    },
    {
        username: 'Misho',
        title: 'Title2',
        text: 'This is my note (Misho)'
    },
    {
        username: 'Tosho',
        title: 'Title 3',
        text: 'Here is another note'
    }
]

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
    const { title } = req.body; // Extract title from req.body
    console.log("Deleting title:", title, "by author:", author);

    if (!author || !title) {
        return res.sendStatus(400); // Bad request if author or title is missing
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
        'DELETE FROM NOTES WHERE title = ? AND author = ?',
        [title, author]
    );
    connection.release();

    res.sendStatus(200); // Send status 200 on successful deletion
});

app.put('/notes', async (req, res) => {
    let cookiesSplit = await handleCookies(String(req.headers.cookie));
    const author = cookiesSplit.username;
    const { title } = req.body; // Extract title and newContent from req.body
    const newContent = "sasa";
    console.log("Changing title:", title, "by author:", author, "with new content:", newContent);

    if (!author || !title) {
        return res.sendStatus(400); // Bad request if author or title is missing
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
        'UPDATE NOTES SET content = ? WHERE title = ? AND author = ?',
        [newContent, title, author]
    );
    connection.release();

    res.sendStatus(200); // Send status 200 on successful deletion
});


function handleCookies(cookiesString){


    const table = cookiesString.split("; ")
    .map(pair => pair.split("="));

    const result = Object.fromEntries(table);

   return result;
}








app.listen(3002);
