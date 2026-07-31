# Database Overview

## Purpose
This document details the database architecture, connection setup, and database management configuration for **BookInn**.

---

## What is Currently Implemented

The application connects to a **MongoDB** database named `bookinn` using the **Mongoose** ODM library (`^8.24.2`).

### Database Connector (`config/db.js`)

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = module.exports = connectDB;
```

---

## How It Works
- The `connectDB()` function is triggered in [[Backend/Server|server.js]] prior to opening the HTTP port listener.
- It attempts connection using `process.env.MONGO_URI` (default: `mongodb://localhost:27017/bookinn`).
- On successful connection, it outputs `MongoDB connected: <host>` to standard output.
- On connection failure, it catches the exception, logs `DB connection failed: <message>`, and immediately terminates the Node process via `process.exit(1)`.

---

## Collections Summary

The `bookinn` database consists of two collections:
1. `rooms` — Stores physical hotel room specifications.
2. `bookings` — Stores customer stay reservations.

---

## Important Files Involved
- [config/db.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/config/db.js)
- [models/Room.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/models/Room.js)
- [models/Booking.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/models/Booking.js)

---

## Dependencies
- `mongoose` (`^8.24.2`)
- MongoDB Community Server (v8.x)
