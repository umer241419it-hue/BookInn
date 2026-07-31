# Backend Overview

## Purpose
This document outlines the architecture and runtime configuration of the **hotel-backend** Express application.

---

## Status: Active & Functional

The backend is built as a RESTful HTTP API running on Node.js v22 and Express 4.x, connected to MongoDB via Mongoose.

---

## Architectural Principles

1. **Modular MVC Pattern**: Separates concerns into `models/`, `controllers/`, `routes/`, `middleware/`, and `config/`.
2. **Stateless JWT Security**: Requests to protected routes require a `Bearer <token>` HTTP Authorization header, verified by `protect` middleware.
3. **Role-Based Access Control (RBAC)**: Supports `user` and `admin` roles enforced via `adminOnly` middleware guard.
4. **Data Overlap Safety**: Double-booking protection enforced server-side before persisting booking records.
