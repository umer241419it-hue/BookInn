# Controllers

## Purpose
This document details the controller modules located in `hotel-backend/controllers/`.

---

## Controller Modules

### 1. Auth Controller (`authController.js`)
- `signup(req, res)`: Validates input, checks existing email, hashes password with `bcryptjs`, creates `User` document, and returns signed JWT token.
- `login(req, res)`: Verifies user email and matches password using `bcrypt.compare`. Returns signed JWT token if credentials are valid.

### 2. Booking Controller (`bookingController.js`)
- `createBooking(req, res)`: Pulls `userId` from authenticated `req.user.id`. Validates check-in/out dates, verifies room existence, re-checks date overlap conflict, and creates booking record.
- `getMyBookings(req, res)`: Retrieves reservations where `userId` matches `req.user.id`, populated with room details.
- `getAllBookings(req, res)`: Retrieves all system bookings populated with room and user details (restricted to Admin role).
- `cancelBooking(req, res)`: Validates booking existence and enforces ownership rule (`booking.userId === req.user.id` or `req.user.role === 'admin'`) before deleting record.

### 3. Room Controller (`roomController.js`)
- `getAllRooms(req, res)`: Returns list of all rooms in database.
- `getAvailableRooms(req, res)`: Filters out rooms with booked date overlaps using `getBookedRoomIds(checkIn, checkOut)`.
