// Initializing Express App
const express = require("express");
const { Pool } = require("pg");
// const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { get } = require("http");
const { couldStartTrivia } = require("typescript");

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const prisma = new PrismaClient();

// creating db connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: 'coffee',
    port: 5432,
    max: 10
});

// home route
app.get("/", (req, res) => {
    res.render("home.ejs");
});

// getData Route
app.get("/register", (req, res) => {
    res.render("getUser.ejs");
});

// resgistration route
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    // hasing of pass
    // const hashedPassword = await bcrypt.hash(password, 10);
    // const match = await bcrypt.compare(password, hashedPassword);
    // const accessToken = jwt.sign(JSON.stringify(user), process.env.TOKEN_SECRET);
    // console.log(match);
    // console.log(hashedPassword);


    const insert_query = 'INSERT INTO users(username , email , password) VALUES ($1,$2,$3)';
    try {
        await pool.query(insert_query, [username, email, password]);
        res.send("Data Inserted Successfully");
    } catch (error) {
        res.send("Username or Email Already Exits");
    }
});

// login get info route 
app.get("/login", (req, res) => {
    res.render("getLoginInfo.ejs");
});

// login route
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const fetch_query = 'SELECT password FROM users WHERE username = $1';
        const result = await pool.query(fetch_query, [username]);
        if (result.rows.length == 0) {
            res.send("User doesn't exits , Register 1st and then login ");
        }
        else if (result.rows[0].password === password) {
            res.redirect("/home/" + username);
        } else {


            const getPasswordCnt = 'SELECT pswcnt FROM users WHERE username = $1';
            // getting the password count 
            try {
                let cnt = await pool.query(getPasswordCnt, [username]);
                let pswcnt = cnt.rows[0].pswcnt;
                pswcnt++;
                // updating count as attempt failed
                if (pswcnt >= 5) {
                    try {
                        const update_query = `UPDATE users SET pswcnt = $1 where username = $2`;
                        let updated = await pool.query(update_query, [pswcnt, username]);
                    } catch (error) {
                        console.log("Unable to update cnt");
                    }
                } else {
                    try {
                        const update_query = `UPDATE users SET pswcnt = $1  where username = $2;`;
                        let updated = await pool.query(update_query, [pswcnt, username]);
                    } catch (error) {
                        console.log("Unable to update cnt");
                    }
                }

            } catch (error) {
                console.log("unable to get count");
            }
            res.send("Wrong Password Entered");
        }
    } catch (error) {
        res.send("Unable to login");
    }
});


app.get("/home/:user", async (req, res) => {

    let username = req.params.user;

    try {
        // check if user id block or not
        let block_query = `SELECT isblock from users where username= $1`;
        let result = await pool.query(block_query, [username]);
        console.log(result.rows[0].isblock);
        if (result.rows[0].isblock == true) {
            res.send("User is Block");
        }
        else {
            res.send(`Welcome ${username}`);
        }
    } catch {
        res.send(`Welcome ${username}`);
    }
})

app.listen(port, () => {
    console.log(`Server started and listening on port ${port}`);
});