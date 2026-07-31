# Authentication & Role-Based Access Control (RBAC)

## Purpose
This document details the authentication mechanism, user management, and security controls enforced in the **BookInn** system.

---

## Status: Implemented

Authentication is fully functional on the backend via JSON Web Tokens (JWT) and `bcryptjs` password hashing.

---

## Implementation Overview

### 1. User Entity (`User.js`)
- `name`: Full name of the user.
- `email`: Unique email address used for login.
- `password`: Hashed string (never saved or returned in plaintext).
- `role`: Enum `['user', 'admin']` (defaults to `'user'`).

### 2. Password Security (`bcryptjs`)
- Pre-save Mongoose hook hashes passwords with salt factor 10 before saving to database.
- `user.matchPassword(enteredPassword)` compares plaintext login passwords against stored hash safely.

### 3. JWT Token Architecture
- Token payload contains `{ id: user._id, role: user.role }`.
- Signed using `JWT_SECRET` configured in environment variables.
- Required in client HTTP headers for protected endpoints:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```

### 4. Middleware Security Guards (`middleware/auth.js`)
- **`protect`**: Verifies token presence and validity in HTTP Authorization header; populates `req.user`. Returns `401 Unauthorized` if invalid/missing.
- **`adminOnly`**: Ensures `req.user.role === 'admin'`. Returns `403 Forbidden` if non-admin user attempts access.

---

## API Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register new account & return JWT token |
| `POST` | `/api/auth/login` | Public | Authenticate credentials & return JWT token |
