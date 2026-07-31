# Tech Stack

## Purpose
This document records the exact technology stack, libraries, runtimes, and dependencies utilized across **hotel-backend** and **hotel-frontend**.

---

## Architecture Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Runtime** | Node.js | v22.x | Server-side JavaScript execution environment |
| **Backend Framework** | Express.js | `^4.21.0` | REST API routing and middleware framework |
| **Database** | MongoDB Server | v8.x | Document database |
| **ODM** | Mongoose | `^8.24.2` | Object Data Modeling & Schema validation |
| **Authentication** | `jsonwebtoken` & `bcryptjs` | `^9.0.2` / `^2.4.3` | JWT generation/verification & password hashing |
| **Frontend Framework** | React | `^18.3.1` | Client UI library |
| **Build Tool** | Vite | `^6.0.7` | Development server & production bundler |
| **Client Routing** | React Router | `^6.28.0` | Client-side page navigation |
| **HTTP Client** | Axios | `^1.7.9` | Promises-based HTTP client for API requests |

---

## Environment Variables (`hotel-backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bookinn
JWT_SECRET=supersecret_jwt_key_bookinn_2026_x89f2a
```

- `PORT`: Binds Express HTTP server port (defaults to `5000`).
- `MONGO_URI`: Connection string for MongoDB `bookinn` database.
- `JWT_SECRET`: Cryptographic secret key used to sign and verify JSON Web Tokens.
