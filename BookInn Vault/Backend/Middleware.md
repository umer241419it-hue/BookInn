# Backend — Middleware

## Purpose
This document records middleware functions used in the **BookInn** application.

---

## What is Currently Implemented

The application utilizes three middleware functions:
1. `cors()` — Cross-Origin Resource Sharing.
2. `express.json()` — Body parser for JSON request payloads.
3. `middleware/errorHandler.js` — Custom centralized error handler.

---

## 1. Global Pre-Routing Middleware (`server.js`)

```javascript
app.use(cors());
app.use(express.json());
```
- `cors()` allows frontend applications hosted on different domains/ports to execute HTTP requests against this server.
- `express.json()` populates `req.body` with parsed JSON payloads for `POST` requests.

---

## 2. Centralized Error Handler (`middleware/errorHandler.js`)

```javascript
/**
 * Central error-handling middleware.
 *
 * Express recognises a middleware with 4 params as an error handler.
 * Any time you call next(error) in a controller, Express skips to here.
 */
const errorHandler = (err, req, res, next) => {
  // Mongoose validation errors come with err.name === 'ValidationError'
  // Mongoose cast errors (bad ObjectId) come with err.name === 'CastError'
  // For now, a simple handler — you can refine this later.

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
    // Only show the stack trace in development
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = errorHandler;
```

---

## How It Works
- Express identifies `errorHandler` as error handling middleware because it accepts **4 parameters**: `(err, req, res, next)`.
- If a route handler invokes `next(error)`, Express bypasses subsequent route handlers and delegates control to `errorHandler`.
- It evaluates `res.statusCode`. If `200`, it defaults to `500`.
- It returns JSON formatted as:
  ```json
  {
    "success": false,
    "message": "Error details",
    "stack": "Stack trace (only if NODE_ENV !== 'production')"
  }
  ```

---

## Important Files Involved
- [middleware/errorHandler.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/middleware/errorHandler.js)
- [server.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/server.js)

---

## Dependencies
- `express`
- `cors`
