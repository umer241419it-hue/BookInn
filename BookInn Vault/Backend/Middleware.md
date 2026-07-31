# Middleware

## Purpose
This document records custom and global middleware modules used in `hotel-backend`.

---

## Active Middleware

### 1. Auth Guard Middleware (`middleware/auth.js`)
- `protect`: Extracts `Bearer <token>` from HTTP Authorization header. Decodes JWT using `JWT_SECRET` and populates `req.user = { id: decoded.id, role: decoded.role }`. Returns `401 Unauthorized` if token is missing or invalid.
- `adminOnly`: Inspects `req.user.role === 'admin'`. Passes execution to next handler if true; returns `403 Forbidden` otherwise.

### 2. Global Error Handler (`middleware/errorHandler.js`)
- Catches unhandled application errors and formats standard JSON error payload:
  ```json
  {
    "error": "Error description message"
  }
  ```

### 3. Built-in & Third-Party Middleware
- `cors()`: Enables cross-origin HTTP requests.
- `express.json()`: Parses incoming JSON payload bodies.
