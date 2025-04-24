# Req Catch

Catch a Request by its toe,

It won't holler

Just log to console,

## Features

- Logs all incoming requests to the terminal
- Serves mock JSON responses for GET requests based on URL patterns
- Supports URL path and query parameter matching
- CORS enabled for cross-origin requests
- Force specific HTTP status codes using the `_return` parameter
- Simulate network latency using the `_delay` parameter

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

## Forcing Status Codes

You can force the server to return a specific HTTP status code by adding the `_return` parameter to the URL. This is useful for testing error handling in client applications without having to create specific mock files.

### Usage

Add the `_return` parameter to the URL with the desired status code:

```
/api/endpoint?_return=500
```

### Examples

| Request URL | Response |
|-------------|----------|
| `/users?_return=404` | 404 Not Found response |
| `/products/123?_return=500` | 500 Internal Server Error response |
| `/orders?status=pending&_return=401` | 401 Unauthorized response |

When the `_return` parameter is present, the server will:
1. Return a response with the specified status code
2. Include a JSON body with a message indicating the forced status code
3. Skip the normal mock file lookup process

## Simulating Network Latency

You can simulate network latency or slow server responses by adding the `_delay` parameter to the URL. This is useful for testing loading states, timeouts, and other timing-related behaviors in client applications.

### Usage

Add the `_delay` parameter to the URL with the desired delay in milliseconds:

```
/api/endpoint?_delay=2000
```

### Examples

| Request URL | Response Behavior |
|-------------|-------------------|
| `/users?_delay=1000` | Response delayed by 1 second |
| `/products/123?_delay=3000` | Response delayed by 3 seconds |
| `/orders?status=pending&_delay=5000` | Response delayed by 5 seconds |

### Combining Parameters

You can combine the `_delay` parameter with the `_return` parameter to simulate slow error responses:

```
/api/endpoint?_delay=2000&_return=500
```

This will delay the response by 2 seconds and then return a 500 status code.
