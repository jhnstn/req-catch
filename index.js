const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.argv[2] || 3000;

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`Received ${req.method} request to ${req.url}`);
    next();
});

// Middleware to parse JSON and URL-encoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log request body
app.use((req, res, next) => {
    if (Object.keys(req.body).length > 0) {
        console.log("Request Body:", req.body);
    }
    next();
});

// Basic route to handle any request
app.all("*", (req, res) => {
    res.send("Request received. Check the server logs.");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
