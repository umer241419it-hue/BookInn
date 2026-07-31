# Folder Structure

## Purpose
This page maps out the physical folder and file organization of the **BookInn** system, covering both `hotel-backend` and `hotel-frontend`.

---

## Workspace Layout

Below is the complete tree layout of the project root directory:

```
BookInn/
│
├── hotel-backend/             # Express.js REST API Backend
│   ├── config/
│   │   └── db.js              # MongoDB connection setup using Mongoose
│   ├── controllers/
│   │   ├── authController.js  # JWT signup & login handlers
│   │   ├── bookingController.js# Booking logic & ownership enforcement
│   │   └── roomController.js   # Room catalog & availability search
│   ├── middleware/
│   │   ├── auth.js            # protect & adminOnly JWT authorization
│   │   └── errorHandler.js    # Global error handler
│   ├── models/
│   │   ├── Booking.js         # Booking entity schema (refs Room & User)
│   │   ├── Room.js            # Room entity schema
│   │   └── User.js            # User schema with bcrypt password hashing
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth routes
│   │   ├── bookingRoutes.js   # /api/bookings routes
│   │   └── roomRoutes.js      # /api/rooms routes
│   ├── utils/
│   │   └── availability.js    # Shared date overlap helper
│   ├── .env                   # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── .env.example           # Sample environment template
│   ├── package.json           # Backend dependencies
│   └── server.js              # Express app entry point
│
├── hotel-frontend/            # React + Vite Client Application
│   ├── src/
│   │   ├── api/
│   │   │   ├── bookings.js    # Axios API helpers for bookings
│   │   │   └── rooms.js       # Axios API helpers for rooms
│   │   ├── components/
│   │   │   ├── BookingModal.jsx# Modal form for confirming room booking
│   │   │   ├── FilterBar.jsx   # Icon-triggered room filter popup panel
│   │   │   ├── RoomCard.jsx   # Individual room card display
│   │   │   ├── RoomGrid.jsx   # Auto-fit grid container
│   │   │   ├── SearchForm.jsx # Check-in/check-out search form
│   │   │   └── Sidebar.jsx    # Persistent left nav / mobile drawer
│   │   ├── pages/
│   │   │   ├── BookingsPage.jsx# User/Admin reservations view
│   │   │   └── SearchPage.jsx # Main stateful search & filter page
│   │   ├── utils/
│   │   │   └── formatCurrency.js# INR currency formatting helper
│   │   ├── App.jsx            # Main app shell & React Router routes
│   │   ├── main.jsx           # React DOM entry point
│   │   └── index.css          # Hospitality design system & CSS variables
│   ├── index.html             # Client HTML root
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite config with backend proxy (/api)
│
├── BookInn Vault/             # Obsidian Technical Documentation Base
└── .gitignore                 # Workspace exclusion file
```
