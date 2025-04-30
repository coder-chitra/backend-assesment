// Initializing Express App
const express = require("express");
const { Pool } = require("pg");
const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    const insert_query = 'INSERT INTO users(username , email , password) VALUES ($1,$2,$3)';
    console.log(insert_query);
    console.log(username, email, password);
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
    console.log(username, password);
    const fetch_query = 'SELECT password FROM users WHERE username = $1';
    try {
        const result = await pool.query(fetch_query, [username]);
        if (result.rows.length == 0) {
            res.send("User doesn't exits , Register 1st and then login ");
        }
        else if (result.rows[0].password === password) {
            res.redirect("/home/" + username);
        } else {
            res.send("Wrong Password Entered");
        }
    } catch (error) {
        res.send("Unable to login");
    }
});

app.get("/home/:user", (req, res) => {
    let user = req.params.user;
    res.send(`Welcome ${user}`);
})

app.listen(port, () => {
    console.log(`Server started and listening on port ${port}`);
});