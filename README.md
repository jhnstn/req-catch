# Req Catch

Catch a Request by its toe,

It won't holler 

But will log to console,

## Features

- Logs all incoming requests to the terminal
- Serves mock JSON responses for GET requests based on URL patterns
- Supports URL path and query parameter matching
- CORS enabled for cross-origin requests

## Installation

```bash
npm install
```

## Usage

Start the server on the default port (3000):

```bash
npm start
```

Or specify a custom port:

```bash
npm start 8080
```

## Mock Responses

The server can serve mock JSON responses for GET requests. It works by converting the request URL to a filename and looking for a matching JSON file in the `mocks` directory.

### URL to Filename Conversion Rules

1. Forward slashes (`/`) in the URL path are converted to underscores (`_`)
2. Query parameters are appended with double hyphens (`--`) between each parameter
3. The root path (`/`) is converted to `root.json`

### Examples

| Request URL | Mock Filename |
|-------------|---------------|
| `/` | `root.json` |
| `/users/123` | `users_123.json` |
| `/products?category=electronics` | `products--category=electronics.json` |
| `/orders/456?status=pending&sort=date` | `orders_456--status=pending--sort=date.json` |

### Creating Mock Responses

1. Create a JSON file in the `mocks` directory following the naming convention
2. The file should contain valid JSON that represents the desired response
3. When a matching request is received, the server will return the contents of the file

## Response Behavior

- If a matching mock file is found, its contents are returned with a 200 status code
- If no matching file is found, a 404 error is returned
- If the mock file contains invalid JSON, a 500 error is returned
