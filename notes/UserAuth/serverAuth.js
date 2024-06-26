require('dotenv').config()

const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()
const jwt = require('jsonwebtoken')
const { join } = require('path');
const cwd = process.cwd();
const public = join(cwd, 'public');
const axios = require('axios');
const mysql = require('mysql2/promise');

app.use(express.json())
app.use(express.static(public));
app.use(cookieParser());
// let registeredUsers = [
//     {
//       username: 'Tosho',
//       email: 'tosho@gmail.com',
//       password: 'toshoPass'
//     }
//   ]
let refreshTokens = []

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

async function initializeDatabase() {
    const poolForInit = mysql.createPool({
        host: 'localhost',
        user: 'dev',
        password: '123',
      });

    await poolForInit.query(`CREATE DATABASE IF NOT EXISTS mydatabase`);
    await poolForInit.query(`USE mydatabase`);
  
    await poolForInit.query(`
    CREATE TABLE IF NOT EXISTS USERS (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE
    )
    `);
  
    await poolForInit.query(`
    CREATE TABLE IF NOT EXISTS NOTES (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        FOREIGN KEY (author) REFERENCES USERS(username)
    )
    `);

    poolForInit.end();  
    console.log('Database and tables initialized');
}
  

const indexHtml = join(cwd, 'public', 'index.html');
const loggedHtml = join(cwd, 'public', 'logged.html');

app.get('/', (req, res) => {
    res.sendFile(indexHtml)
})

app.get('/logged', (req, res) => {
    res.sendFile(loggedHtml);
});

app.post('/register', async (req, res) => {
    // console.log(req.body);
    //get data from request
    let userData = req.body;
    if(userData.password === '' || userData.email === '' || userData.username === ''){
        return res.status(403).json({error: 'Invalid email/password/username'})
    }

    //check if credentials exist 
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM USERS WHERE username = ? OR email = ?',
      [userData.username, userData.email]
    );
    connection.release(); // Release connection back to the pool
    if (rows.length > 0) {
        console.log('user exists')
        //send res
        res.status(403).json({error: 'User with the same username / email already exists'})
    }else{
        console.log('user does not exist')

        // Add user to database
        const [result] = await connection.query(
            'INSERT INTO USERS (username, password, email) VALUES (?, ?, ?)',
            [userData.username, userData.password, userData.email]
         ); 
        
        //generate token and resfresh token
        let access_token = generateAccessToken({username: userData.username});
        // console.log(access_token);        

        res.cookie('access_token', access_token, {
            httpOnly: true
        })

        let refresh_token = generateRefreshToken({username: userData.username});
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true
        })
        refreshTokens.push(refresh_token);
        // console.log(refreshTokens);

        res.cookie('username', userData.username)


        res.json({success: true, redirect: 'http://localhost:3001/logged'})
    }
    
})

app.post('/login', async  (req, res) => {
    // console.log(req.body);
    //get data from request
    let userData = req.body;
    if(userData.password === null || userData.email === null){
        return res.status(403).json({error: 'Invalid email/password'})
    }

    //check if credentials exist 
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM USERS WHERE email = ? AND password = ?',
      [userData.email, userData.password]
    );
    connection.release(); // Release connection back to the pool
    
    if (rows.length > 0) {
        console.log('valid login credentials')
        console.log(rows[0].username);
        const username = rows[0].username;
        //send res
        let access_token = generateAccessToken({username: username});

        
        res.cookie('access_token', access_token, {
            httpOnly: true
        })

        let refresh_token = generateRefreshToken({username: username});
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true
        })
        refreshTokens.push(refresh_token);
        // console.log(refreshTokens);

        res.cookie('username', username)


        res.json({success: true, redirect: 'http://localhost:3001/logged'})
    }else{
        console.log('invalid login credentials')
        

        res.status(403).json({error: 'Invalid email/password'})

    }
    
})

//

app.post('/continue', authenticateToken, (req, res) => {
    console.log('attempted to continute session')
    res.json({success: true, redirect: 'http://localhost:3001/logged'})
})

//

app.post('/logout', authenticateToken, (req, res) => {
    console.log(`attempted to log out`);
    let cookiesSplit = handleCookies(req.headers.cookie);
    refreshTokens = refreshTokens.filter(token => token != String(cookiesSplit.refresh_token));
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('username')
    res.json({success: true, redirect: 'http://localhost:3001/'})
})

app.all('/api/*',  authenticateToken , async (req, res) => {
    console.log('call to main server')
    console.log(req.user)
    if(req.body.url){
        const response = await axios({
            user: req.user,
            method: req.method,
            url: `http://localhost:3002${req.body.url}`,
            data: req.body,
            headers: {
                'Authorization': `Bearer ${req.cookies.access_token}`,
                'Cookie': req.headers.cookie
            },
            withCredentials: true
        })
        res.json(response.data)
    } else{
        console.log('Incorrect request attempt')
    }


})

function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1min'
    })
}

function generateRefreshToken(user){
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
}

function authenticateToken(req, res, next){
    let cookiesSplit = handleCookies(req.headers.cookie)
    if(cookiesSplit.access_token == null) return res.sendStatus(401)

    jwt.verify(cookiesSplit.access_token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        console.log(err)
        if(err){
            if(cookiesSplit.refresh_token == null) return res.sendStatus(401);
            if(!refreshTokens.includes(cookiesSplit.refresh_token)) return res.sendStatus(403);
            jwt.verify(cookiesSplit.refresh_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                console.log('token expired. Generating new token')
                const access_token = generateAccessToken({username: cookiesSplit.username})
                console.log(access_token)
                res.cookie('access_token', access_token, {
                    httpOnly: true
                })
            })
        }
        console.log('ok token')
        req.user = user
        next()
    })
}


function handleCookies(cookiesString){


    const table = cookiesString.split("; ") 
    .map(pair => pair.split("="));

    const result = Object.fromEntries(table);

   return result;
}

initializeDatabase().then(() =>  {
    app.listen(3001);
})
