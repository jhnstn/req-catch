const express = require("express");
const bodyParser = require("body-parser");
const chalk = require("chalk");

const app = express();
const port = process.argv[2] || 3000;

// CORS middleware to allow cross-origin requests from the specified origin
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    // Handle OPTIONS requests
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// Middleware to log requests
app.use((req, res, next) => {
    console.log(
        chalk.blue.bold(`Received ${chalk.green(req.method)} request to ${chalk.yellow(req.url)}`)
    );
    next();
});

// Middleware to parse JSON and URL-encoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log request body
app.use((req, res, next) => {
    if (Object.keys(req.body).length > 0) {
        console.log(chalk.magenta.bold("Request Body:"));
        console.log(chalk.cyan(JSON.stringify(req.body, null, 2)));
    }
    next();
});

// Basic route to handle any request
app.all("*", (req, res) => {
    res.send("Request received. Check the server logs.");
});

app.listen(port, () => {
    console.log(chalk.green.bold(`Server running on ${chalk.underline(`http://localhost:${port}`)}`));
});
