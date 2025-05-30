const express = require("express");
const bodyParser = require("body-parser");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.argv[2] || 3000;

// CORS middleware to allow cross-origin requests from the specified origin
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
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

// Function to extract _return parameter from query string
const extractReturnParam = (queryString) => {
    if (!queryString) return null;

    const params = queryString.split('&');
    for (const param of params) {
        if (param.startsWith('_return=')) {
            const statusCode = parseInt(param.split('=')[1], 10);
            return isNaN(statusCode) ? null : statusCode;
        }
    }
    return null;
};

// Function to extract _delay parameter from query string
const extractDelayParam = (queryString) => {
    if (!queryString) return null;

    const params = queryString.split('&');
    for (const param of params) {
        if (param.startsWith('_delay=')) {
            const delay = parseInt(param.split('=')[1], 10);
            return isNaN(delay) ? null : delay;
        }
    }
    return null;
};

// Function to convert URL to filename
const urlToFilename = (url) => {
    // Split URL into path and query parts
    const [urlPath, queryString] = url.split('?');

    // Replace slashes with underscores in the path
    let filename = urlPath.replace(/\//g, '_');

    // If there's a query string, process it
    if (queryString) {
        // Split query params and join with '--'
        const queryParams = queryString.split('&');
        filename += '--' + queryParams.join('--');
    }

    // Remove leading underscore if present (from the root path '/')
    if (filename.startsWith('_')) {
        filename = filename.substring(1);
    }

    // If filename is empty (for root path with no query), use 'root'
    if (!filename) {
        filename = 'root';
    }

    return filename + '.json';
};

// Mock response handler for GET requests
app.get("*", (req, res) => {
    // Extract query string
    const [_, queryString] = req.url.split('?');

    // Check for _delay parameter
    const delayMs = extractDelayParam(queryString);

    // Check for _return parameter
    const returnStatusCode = extractReturnParam(queryString);

    // Function to send the response (used for both immediate and delayed responses)
    const sendResponse = () => {
        if (returnStatusCode) {
            console.log(chalk.yellow.bold(`Found _return parameter with status code: ${chalk.cyan(returnStatusCode)}`));
            return res.status(returnStatusCode).json({
                message: `Forced response with status code ${returnStatusCode}`,
                originalUrl: req.url
            });
        }

        // Convert URL to filename
        const mockFilename = urlToFilename(req.url);
        const mockFilePath = path.join(__dirname, 'mocks', mockFilename);

        console.log(chalk.yellow.bold(`Looking for mock file: ${chalk.cyan(mockFilename)}`));

        // Check if mock file exists
        fs.access(mockFilePath, fs.constants.F_OK, (err) => {
            if (err) {
                // File doesn't exist
                console.log(chalk.red.bold(`Mock file not found: ${chalk.cyan(mockFilename)}`));
                return res.status(404).json({ error: "Not found" });
            }

            // Read and return the mock file
            fs.readFile(mockFilePath, 'utf8', (err, data) => {
                if (err) {
                    console.log(chalk.red.bold(`Error reading mock file: ${chalk.cyan(mockFilename)}`));
                    return res.status(500).json({ error: "Server error" });
                }

                try {
                    // Parse JSON content
                    const jsonData = JSON.parse(data);
                    console.log(chalk.green.bold(`Serving mock response from: ${chalk.cyan(mockFilename)}`));
                    res.json(jsonData);
                } catch (e) {
                    console.log(chalk.red.bold(`Invalid JSON in mock file: ${chalk.cyan(mockFilename)}`));
                    res.status(500).json({ error: "Invalid mock data" });
                }
            });
        });
    };

    // If delay parameter is present, wait for the specified time before sending the response
    if (delayMs) {
        const delaySeconds = (delayMs / 1000).toFixed(1);
        console.log(chalk.yellow.bold(`Found _delay parameter, delaying response by ${chalk.cyan(delayMs)}ms (${chalk.cyan(delaySeconds)} seconds)`));
        console.log(chalk.yellow(`Delaying request for ${chalk.cyan(delaySeconds)} seconds...`));
        setTimeout(() => {
            console.log(chalk.green(`Delay complete, sending response now`));
            sendResponse();
        }, delayMs);
    } else {
        // Otherwise, send the response immediately
        sendResponse();
    }
});

// Handler for PUT requests
app.put("*", (req, res) => {
    // Extract query string
    const [_, queryString] = req.url.split('?');

    // Check for _delay parameter
    const delayMs = extractDelayParam(queryString);

    // Check for _return parameter
    const returnStatusCode = extractReturnParam(queryString);

    // Function to send the response
    const sendResponse = () => {
        if (returnStatusCode) {
            console.log(chalk.yellow.bold(`Found _return parameter with status code: ${chalk.cyan(returnStatusCode)}`));
            return res.status(returnStatusCode).json({
                message: `Forced response with status code ${returnStatusCode}`,
                originalUrl: req.url
            });
        }

        console.log(chalk.green.bold(`Handling PUT request to ${chalk.yellow(req.url)}`));
        res.sendStatus(200);
    };

    // If delay parameter is present, wait for the specified time before sending the response
    if (delayMs) {
        const delaySeconds = (delayMs / 1000).toFixed(1);
        console.log(chalk.yellow.bold(`Found _delay parameter, delaying response by ${chalk.cyan(delayMs)}ms (${chalk.cyan(delaySeconds)} seconds)`));
        console.log(chalk.yellow(`Delaying request for ${chalk.cyan(delaySeconds)} seconds...`));
        setTimeout(() => {
            console.log(chalk.green(`Delay complete, sending response now`));
            sendResponse();
        }, delayMs);
    } else {
        // Otherwise, send the response immediately
        sendResponse();
    }
});

// Handler for DELETE requests
app.delete("*", (req, res) => {
    // Extract query string
    const [_, queryString] = req.url.split('?');

    // Check for _delay parameter
    const delayMs = extractDelayParam(queryString);

    // Check for _return parameter
    const returnStatusCode = extractReturnParam(queryString);

    // Function to send the response
    const sendResponse = () => {
        if (returnStatusCode) {
            console.log(chalk.yellow.bold(`Found _return parameter with status code: ${chalk.cyan(returnStatusCode)}`));
            return res.status(returnStatusCode).json({
                message: `Forced response with status code ${returnStatusCode}`,
                originalUrl: req.url
            });
        }

        console.log(chalk.green.bold(`Handling DELETE request to ${chalk.yellow(req.url)}`));
        res.sendStatus(200);
    };

    // If delay parameter is present, wait for the specified time before sending the response
    if (delayMs) {
        const delaySeconds = (delayMs / 1000).toFixed(1);
        console.log(chalk.yellow.bold(`Found _delay parameter, delaying response by ${chalk.cyan(delayMs)}ms (${chalk.cyan(delaySeconds)} seconds)`));
        console.log(chalk.yellow(`Delaying request for ${chalk.cyan(delaySeconds)} seconds...`));
        setTimeout(() => {
            console.log(chalk.green(`Delay complete, sending response now`));
            sendResponse();
        }, delayMs);
    } else {
        // Otherwise, send the response immediately
        sendResponse();
    }
});

// Fallback route for other non-GET/PUT/DELETE requests
app.all("*", (req, res) => {
    // Extract query string
    const [_, queryString] = req.url.split('?');

    // Check for _delay parameter
    const delayMs = extractDelayParam(queryString);

    // Check for _return parameter
    const returnStatusCode = extractReturnParam(queryString);

    // Function to send the response
    const sendResponse = () => {
        if (returnStatusCode) {
            console.log(chalk.yellow.bold(`Found _return parameter with status code: ${chalk.cyan(returnStatusCode)}`));
            return res.status(returnStatusCode).json({
                message: `Forced response with status code ${returnStatusCode}`,
                originalUrl: req.url
            });
        }

        res.send("Request received. Check the server logs.");
    };

    // If delay parameter is present, wait for the specified time before sending the response
    if (delayMs) {
        const delaySeconds = (delayMs / 1000).toFixed(1);
        console.log(chalk.yellow.bold(`Found _delay parameter, delaying response by ${chalk.cyan(delayMs)}ms (${chalk.cyan(delaySeconds)} seconds)`));
        console.log(chalk.yellow(`Delaying request for ${chalk.cyan(delaySeconds)} seconds...`));
        setTimeout(() => {
            console.log(chalk.green(`Delay complete, sending response now`));
            sendResponse();
        }, delayMs);
    } else {
        // Otherwise, send the response immediately
        sendResponse();
    }
});

app.listen(port, () => {
    console.log(chalk.green.bold(`Server running on ${chalk.underline(`http://localhost:${port}`)}`));
});
