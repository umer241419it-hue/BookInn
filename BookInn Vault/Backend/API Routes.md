# Backend — API Routes

## Purpose
This document details the route mapping layer in the **BookInn** application.

---

## What is Currently Implemented

Routes strictly map HTTP verbs and endpoint paths to controller functions. There is no business logic inside route handlers.

### Implemented Routers:
1. `routes/roomRoutes.js` mounted at `/api/rooms`
2. `routes/bookingRoutes.js` mounted at `/api/bookings`

---

## 1. Room Routes (`routes/roomRoutes.js`)

```javascript
const express = require("express");
const router = express.Router();
const { getAllRooms, getAvailableRooms } = require("../controllers/roomController");

router.get("/", getAllRooms);
router.get("/available", getAvailableRooms);

module.exports = router;
```

### Route Table:

| HTTP Verb | Full Path | Route Handler | Description |
|---|---|---|---|
| `GET` | `/api/rooms` | `getAllRooms` | Retrieves all room documents |
| `GET` | `/api/rooms/available` | `getAvailableRooms` | Retrieves rooms available for a specified `checkIn` and `checkOut` range |

---

## 2. Booking Routes (`routes/bookingRoutes.js`)

```javascript
const express = require("express");
const router = express.Router();
const { getAllBookings, createBooking, cancelBooking } = require("../controllers/bookingController");

router.get("/", getAllBookings);
router.post("/", createBooking);
router.delete("/:id", cancelBooking);

module.exports = router;
```

### Route Table:

| HTTP Verb | Full Path | Route Handler | Description |
|---|---|---|---|
| `GET` | `/api/bookings` | `getAllBookings` | Retrieves all bookings populated with room data |
| `POST` | `/api/bookings` | `createBooking` | Validates dates & availability, creates a booking |
| `DELETE` | `/api/bookings/:id` | `cancelBooking` | Deletes a booking document by ID |

---

## How It Works
1. Express receives an incoming HTTP request at a specific URL path.
2. `server.js` evaluates path prefixes (`/api/rooms` or `/api/bookings`) and delegates to the appropriate router module.
3. The router matches the path (`/`, `/available`, `/:id`) and HTTP method (`GET`, `POST`, `DELETE`).
4. The router forwards execution directly to the bound controller method in [[Backend/Controllers|roomController.js]] or [[Backend/Controllers|bookingController.js]].

---

## Important Files Involved
- [routes/roomRoutes.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/routes/roomRoutes.js)
- [routes/bookingRoutes.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/routes/bookingRoutes.js)
- [controllers/roomController.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/controllers/roomController.js)
- [controllers/bookingController.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/controllers/bookingController.js)

---

## Dependencies
- `express.Router()`
