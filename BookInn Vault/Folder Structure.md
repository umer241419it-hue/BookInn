# Folder Structure

## Purpose
This page maps out the physical folder and file organization of the **BookInn** backend repository.

---

## What is Currently Implemented

Below is the complete tree layout of the project root directory:

```
BookInn/
│
├── config/
│   └── db.js                 # MongoDB connection setup using Mongoose
│
├── controllers/
│   ├── bookingController.js   # Request handlers for /api/bookings endpoints
│   └── roomController.js      # Request handlers for /api/rooms endpoints
│
├── middleware/
│   └── errorHandler.js       # Central error handling middleware
│
├── models/
│   ├── Booking.js            # Mongoose schema and model for Booking entity
│   └── Room.js               # Mongoose schema and model for Room entity
│
├── routes/
│   ├── bookingRoutes.js      # Express router mapping /api/bookings routes
│   └── roomRoutes.js         # Express router mapping /api/rooms routes
│
├── utils/
│   └── availability.js       # Shared date overlap detection utility
│
├── BookInn Vault/            # Obsidian Documentation Knowledge Base
│   ├── Home.md
│   └── ...
│
├── .env                      # Local environment configurations (ignored by git)
├── .env.example              # Sample environment template
├── .gitignore                # Git exclusion file
├── package.json              # NPM manifest & script definitions
├── package-lock.json         # Locked dependency tree
└── server.js                 # Application bootstrap entry point
```

---

## Directory Descriptions

| Directory | Purpose | Key Files |
|---|---|---|
| `config/` | Environment & database initialization | `db.js` |
| `controllers/` | HTTP request processing and response formatting | `roomController.js`, `bookingController.js` |
| `middleware/` | Global application middleware | `errorHandler.js` |
| `models/` | Database collection schemas & data validation | `Room.js`, `Booking.js` |
| `routes/` | HTTP endpoint definitions & router mounting | `roomRoutes.js`, `bookingRoutes.js` |
| `utils/` | Decoupled domain helper logic | `availability.js` |
| `BookInn Vault/` | System technical documentation in Markdown | Vault files |

---

## Notes
- All backend functional modules are contained within `config`, `controllers`, `middleware`, `models`, `routes`, and `utils`.
- There is no `src/`, `public/`, or client-side frontend folder in the workspace.
