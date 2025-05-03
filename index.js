// Initializing Express App
const express = require("express");
const { Pool } = require("pg");
const bcrypt = require('bcrypt');
require("dotenv").config();

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// creating db connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// resgistration route
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    // hasing of pass
    const hashedPassword = await bcrypt.hash(password, 10);
    const match = await bcrypt.compare(password, hashedPassword);
    console.log(match);
    console.log(hashedPassword);

    const insert_query = 'INSERT INTO users(username , email , password) VALUES ($1,$2,$3)';
    try {
        await pool.query(insert_query, [username, email, hashedPassword]);
        res.send("Data Inserted Successfully");
    } catch (error) {
        res.send("Username or Email Already Exits");
    }
});

// login route
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const fetch_query = 'SELECT password FROM users WHERE username = $1';
        const result = await pool.query(fetch_query, [username]);
        if (result.rows.length == 0) { // username not present means user not exits 
            res.send("User doesn't exits , Register 1st and then login ");
        }
        else {
            let loginStatus = await bcrypt.compare(password, result.rows[0].password); // loginStatus: true => success else failed
            let loginQuery = `INSERT INTO users_login_details values ($1,NOW(),$2)`;
            try {
                await pool.query(loginQuery, [username, loginStatus]);
            } catch (error) {
                console.log("Unable to insert user login details");
            }
            if (loginStatus) { // comparing password with hashed password in database
                res.redirect("/home/" + username);
            } else { // condition of wrong password entered
                const getPasswordCnt = 'SELECT pswcnt FROM users WHERE username = $1';
                // getting the password count 
                try {
                    let cnt = await pool.query(getPasswordCnt, [username]);
                    let pswcnt = cnt.rows[0].pswcnt;
                    pswcnt++;
                    // updating count as attempt failed
                    if (pswcnt >= 5) {
                        try {
                            const update_query = `UPDATE users SET pswcnt = $1 , isblock = true where username = $2`;
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
        }
    } catch (error) {
        res.status(500).send("Unable to login due to internal server error");
    }
});

// home route to welcome user
app.get("/home/:user", async (req, res) => {

    let username = req.params.user;

    try {
        // check if user id block or not
        let block_query = `SELECT isblock from users where username= $1`;
        let result = await pool.query(block_query, [username]);
        return res.send(result.rows[0].isblock ? "User is Block" : `Welcome ${username}`);
    } catch {
        res.status(500).send(`Internal Sever Error During login`);
    }
})

app.listen(port, () => {
    console.log(`Server started and listening on port ${port}`);
});