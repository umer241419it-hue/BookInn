# API Routes

## Purpose
This document maps HTTP request paths to their corresponding router files in `hotel-backend/routes/`.

---

## Router Mapping

```
server.js
  ├── app.use("/api/auth", authRoutes)
  ├── app.use("/api/rooms", roomRoutes)
  └── app.use("/api/bookings", bookingRoutes)
```

---

## Endpoint Details

### 1. Auth Router (`authRoutes.js`)
- `POST /api/auth/signup` -> `signup` (Public)
- `POST /api/auth/login` -> `login` (Public)

### 2. Room Router (`roomRoutes.js`)
- `GET /api/rooms` -> `getAllRooms` (Public)
- `GET /api/rooms/available` -> `getAvailableRooms` (Public)

### 3. Booking Router (`bookingRoutes.js`)
- `GET /api/bookings/my-bookings` -> `protect`, `getMyBookings` (User/Protected)
- `GET /api/bookings` -> `protect`, `adminOnly`, `getAllBookings` (Admin Only)
- `POST /api/bookings` -> `protect`, `createBooking` (User/Protected)
- `DELETE /api/bookings/:id` -> `protect`, `cancelBooking` (Owner or Admin)
