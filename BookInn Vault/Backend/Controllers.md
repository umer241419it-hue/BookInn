# Backend — Controllers

## Purpose
This document provides complete documentation for the controller functions in `roomController.js` and `bookingController.js`.

---

## What is Currently Implemented

Controllers manage request payload validation, status codes, database invocation, and response formatting.

---

## 1. Room Controller (`controllers/roomController.js`)

```javascript
const Room = require("../models/Room");
const { getBookedRoomIds } = require("../utils/availability");

// GET /api/rooms
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/rooms/available?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
const getAvailableRooms = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: "checkIn and checkOut query params are required" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: "checkOut must be after checkIn" });
    }

    // Get IDs of rooms that are booked during this range
    const bookedRoomIds = await getBookedRoomIds(checkInDate, checkOutDate);

    // Return all rooms NOT in that set
    const availableRooms = await Room.find({ _id: { $nin: bookedRoomIds } });
    res.status(200).json(availableRooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllRooms, getAvailableRooms };
```

### Controller Actions Detailed:
- `getAllRooms`: Queries `Room.find()` and returns `200 OK` with JSON array of rooms.
- `getAvailableRooms`: 
  1. Validates presence of `checkIn` & `checkOut` in `req.query` (`400 Bad Request` if missing).
  2. Converts dates and validates `checkOutDate > checkInDate` (`400 Bad Request` if invalid).
  3. Calls `getBookedRoomIds(checkInDate, checkOutDate)` from [[Backend/Utilities|availability.js]].
  4. Queries `Room.find({ _id: { $nin: bookedRoomIds } })`.
  5. Returns `200 OK` with JSON array of available room documents.

---

## 2. Booking Controller (`controllers/bookingController.js`)

```javascript
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { getBookedRoomIds } = require("../utils/availability");

// GET /api/bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("roomId");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { roomId, guestName, guestPhone, checkIn, checkOut } = req.body;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: "checkOut must be after checkIn" });
    }

    // Verify the room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Re-check availability using the SAME shared overlap logic
    const bookedRoomIds = await getBookedRoomIds(checkInDate, checkOutDate);
    const isBooked = bookedRoomIds.some((id) => id.toString() === roomId.toString());

    if (isBooked) {
      return res.status(409).json({ error: "Room is not available for the selected dates" });
    }

    // Create the booking
    const booking = await Booking.create({
      roomId,
      guestName,
      guestPhone,
      checkIn: checkInDate,
      checkOut: checkOutDate,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/bookings/:id
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllBookings, createBooking, cancelBooking };
```

### Controller Actions Detailed:
- `getAllBookings`: Queries `Booking.find().populate("roomId")` and returns `200 OK` with full populated room details.
- `createBooking`:
  1. Destructures `roomId`, `guestName`, `guestPhone`, `checkIn`, `checkOut` from `req.body`.
  2. Validates `checkOutDate > checkInDate` (`400 Bad Request` if invalid).
  3. Checks room existence via `Room.findById(roomId)` (`404 Not Found` if missing).
  4. Calls `getBookedRoomIds(checkInDate, checkOutDate)` and checks if `roomId` is in the returned list (`409 Conflict` if occupied).
  5. Inserts document via `Booking.create()` and returns `201 Created` with created object.
- `cancelBooking`:
  1. Deletes booking using `Booking.findByIdAndDelete(req.params.id)`.
  2. If null, returns `404 Not Found`.
  3. Returns `200 OK` with `{ "message": "Booking cancelled successfully" }`.

---

## Response Status Codes Summary

| Status Code | Scenario |
|---|---|
| `200 OK` | Successful fetch (`getAllRooms`, `getAvailableRooms`, `getAllBookings`, `cancelBooking`) |
| `201 Created` | Successful creation (`createBooking`) |
| `400 Bad Request` | Missing parameters or invalid date logic (`checkOut <= checkIn`) |
| `404 Not Found` | Room or Booking ID does not exist in database |
| `409 Conflict` | Room is already booked for requested overlapping dates |
| `500 Server Error` | Unexpected runtime error or database failure |

---

## Important Files Involved
- [controllers/roomController.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/controllers/roomController.js)
- [controllers/bookingController.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/controllers/bookingController.js)
- [utils/availability.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/utils/availability.js)
- [models/Room.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/models/Room.js)
- [models/Booking.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/models/Booking.js)
