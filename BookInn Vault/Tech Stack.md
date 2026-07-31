# Tech Stack

## Purpose
This document records the exact technology stack, libraries, runtimes, and dependencies currently utilized in the **BookInn** project.

---

## What is Currently Implemented

| Component Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Runtime** | Node.js | v22.x | Server-side JavaScript execution environment |
| **Framework** | Express.js | `^4.21.0` | Minimalist web application framework for routing & middleware |
| **Database** | MongoDB Server | v8.2.1 / v8.x | NoSQL Document Database |
| **ODM** | Mongoose | `^8.24.2` | Object Data Modeling library for MongoDB schema enforcement |
| **CORS Middleware** | `cors` | `^2.8.6` | Cross-Origin Resource Sharing handling |
| **Environment Manager** | `dotenv` | `^16.4.5` | Environment variable loader from `.env` file |
| **Dev Tooling** | `nodemon` | `^3.1.4` | Process monitoring and live restart on code changes |

---

## Environment Variables (`.env`)

The application expects the following environment variables configured in a `.env` file at the root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bookinn
```

- `PORT`: Binds HTTP server port (defaults to `5000` if not set).
- `MONGO_URI`: MongoDB connection string targeting the `bookinn` database.

---

## Dependencies Breakdown (`package.json`)

```json
{
  "name": "bookinn",
  "version": "1.0.0",
  "description": "Hotel Management System — MERN stack learning project",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.6",
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "mongoose": "^8.24.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

---

## Notes
- Mongoose is pinned to `^8.24.2` for compatibility with MongoDB Server 8.x.
- No frontend framework (React, Vue, etc.) is currently present in the codebase.
