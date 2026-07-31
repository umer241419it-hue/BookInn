# Backend — Utilities

## Purpose
This document details shared utility modules and helper functions in the **BookInn** application.

---

## What is Currently Implemented

The application currently contains one core utility module: `utils/availability.js`.

---

## Availability Utility (`utils/availability.js`)

```javascript
const Booking = require("../models/Booking");

/**
 * Find all room IDs that have a confirmed booking overlapping the given date range.
 *
 * Overlap logic (strict < and >):
 *   An existing booking conflicts when it starts BEFORE the requested checkout
 *   AND ends AFTER the requested checkin.
 *   Same-day checkout/checkin is allowed (checkout morning, checkin afternoon).
 *
 * @param {Date} checkIn  - requested check-in date
 * @param {Date} checkOut - requested check-out date
 * @returns {Array<ObjectId>} array of room IDs that are booked (unavailable)
 */
const getBookedRoomIds = async (checkIn, checkOut) => {
  const conflictingBookings = await Booking.find({
    status: "confirmed",
    checkIn: { $lt: checkOut },   // existing starts before our checkout
    checkOut: { $gt: checkIn },   // existing ends after our checkin
  }).select("roomId");

  return conflictingBookings.map((b) => b.roomId);
};

module.exports = { getBookedRoomIds };
```

---

## Mathematical Overlap Logic

Two date ranges overlap if and only if:
$$\text{Existing.checkIn} < \text{Requested.checkOut} \quad \text{AND} \quad \text{Existing.checkOut} > \text{Requested.checkIn}$$

### Why Strict Inequality (`$lt` / `$gt`) is Used:
- **Same-Day Checkout/Checkin**: If Guest A checks out on `2025-08-10` and Guest B checks in on `2025-08-10`:
  - `Existing.checkOut` (`2025-08-10`) `$gt` `Requested.checkIn` (`2025-08-10`) resolves to **`false`**.
  - No conflict is recorded. Room is available for Guest B.

---

## Usage in Codebase
`getBookedRoomIds` is invoked by:
1. `roomController.js` in `getAvailableRooms` to exclude occupied rooms via `Room.find({ _id: { $nin: bookedRoomIds } })`.
2. `bookingController.js` in `createBooking` to verify the requested room is not occupied before inserting a new booking (`409 Conflict` if occupied).

---

## Important Files Involved
- [utils/availability.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/utils/availability.js)
- [controllers/roomController.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/controllers/roomController.js)
- [controllers/bookingController.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/controllers/bookingController.js)
- [models/Booking.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/models/Booking.js)

---

## Dependencies
- `./models/Booking`
