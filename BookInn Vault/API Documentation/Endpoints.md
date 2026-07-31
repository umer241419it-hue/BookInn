# API Documentation — Endpoints

## Purpose
This document provides a comprehensive REST API specification for all endpoints currently implemented in **BookInn**.

---

## What is Currently Implemented

The API exposes 5 HTTP endpoints divided into two resources: **Rooms** (`/api/rooms`) and **Bookings** (`/api/bookings`).

---

## Endpoint Summary Table

| Resource | Method | Path | Controller Handler | Purpose |
|---|---|---|---|---|
| Rooms | `GET` | `/api/rooms` | `getAllRooms` | Fetch all room documents |
| Rooms | `GET` | `/api/rooms/available` | `getAvailableRooms` | Fetch rooms available for a date range |
| Bookings | `GET` | `/api/bookings` | `getAllBookings` | Fetch all bookings populated with room data |
| Bookings | `POST` | `/api/bookings` | `createBooking` | Create a new room reservation |
| Bookings | `DELETE` | `/api/bookings/:id` | `cancelBooking` | Delete a booking by ID |

---

## 1. GET `/api/rooms`
- **Method**: `GET`
- **Path**: `/api/rooms`
- **Controller**: `getAllRooms` ([[Backend/Controllers|roomController.js]])
- **Query Params**: None
- **Request Body**: None
- **Database Interaction**: `Room.find()`
- **Success Response**: `200 OK` — Array of room objects

---

## 2. GET `/api/rooms/available`
- **Method**: `GET`
- **Path**: `/api/rooms/available`
- **Controller**: `getAvailableRooms` ([[Backend/Controllers|roomController.js]])
- **Query Params**:
  - `checkIn` (`String`, required, format `YYYY-MM-DD`)
  - `checkOut` (`String`, required, format `YYYY-MM-DD`)
- **Request Body**: None
- **Database Interaction**: 
  - `Booking.find({ status: "confirmed", checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } })`
  - `Room.find({ _id: { $nin: bookedRoomIds } })`
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "checkIn and checkOut query params are required" }`
  - `400 Bad Request`: `{ "error": "checkOut must be after checkIn" }`
- **Success Response**: `200 OK` — Array of available room objects

---

## 3. GET `/api/bookings`
- **Method**: `GET`
- **Path**: `/api/bookings`
- **Controller**: `getAllBookings` ([[Backend/Controllers|bookingController.js]])
- **Query Params**: None
- **Request Body**: None
- **Database Interaction**: `Booking.find().populate("roomId")`
- **Success Response**: `200 OK` — Array of booking objects with populated `roomId` details

---

## 4. POST `/api/bookings`
- **Method**: `POST`
- **Path**: `/api/bookings`
- **Controller**: `createBooking` ([[Backend/Controllers|bookingController.js]])
- **Query Params**: None
- **Request Body** (`application/json`):
  ```json
  {
    "roomId": "6a6b54e74de56a2fb9ad10a9",
    "guestName": "Alice",
    "guestPhone": "9876543210",
    "checkIn": "2025-08-05",
    "checkOut": "2025-08-10"
  }
  ```
- **Database Interaction**:
  - `Room.findById(roomId)`
  - `Booking.find(...)` availability conflict check
  - `Booking.create(...)`
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "checkOut must be after checkIn" }`
  - `404 Not Found`: `{ "error": "Room not found" }`
  - `409 Conflict`: `{ "error": "Room is not available for the selected dates" }`
- **Success Response**: `201 Created` — Created booking object

---

## 5. DELETE `/api/bookings/:id`
- **Method**: `DELETE`
- **Path**: `/api/bookings/:id`
- **Controller**: `cancelBooking` ([[Backend/Controllers|bookingController.js]])
- **URL Parameters**:
  - `id` (`ObjectId`, required) — Booking document `_id`
- **Request Body**: None
- **Database Interaction**: `Booking.findByIdAndDelete(req.params.id)`
- **Error Responses**:
  - `404 Not Found`: `{ "error": "Booking not found" }`
- **Success Response**: `200 OK` — `{ "message": "Booking cancelled successfully" }`

---

## Important Files Involved
- [routes/roomRoutes.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/routes/roomRoutes.js)
- [routes/bookingRoutes.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/routes/bookingRoutes.js)
- [controllers/roomController.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/controllers/roomController.js)
- [controllers/bookingController.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/controllers/bookingController.js)
