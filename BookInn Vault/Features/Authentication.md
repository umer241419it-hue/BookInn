# Features — Authentication

## Purpose
This document details user authentication and authorization mechanisms in **BookInn**.

---

## What is Currently Implemented

> [!IMPORTANT]
> **Status: Not Implemented**
> 
> There is **no authentication or authorization middleware** (such as JWT, Sessions, Passport, OAuth, or bcrypt password hashing) in the current codebase.

---

## Current Access Model
- All REST API endpoints (`/api/rooms`, `/api/bookings`) are publicly accessible without API keys or authentication headers.
- CORS middleware (`cors()`) is configured globally in [[Backend/Server|server.js]].

---

## Notes
- Refer to [[Backend/Middleware]] for configured middleware stack.
