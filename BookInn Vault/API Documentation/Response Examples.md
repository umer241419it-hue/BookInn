# API Documentation — Response Examples

## Purpose
This document provides exact JSON response payload examples for successful and error responses across all API endpoints in **BookInn**.

---

## What is Currently Implemented

---

## 1. GET `/api/rooms`

### Status: `200 OK`
```json
[
  {
    "_id": "6a6b54e74de56a2fb9ad10a9",
    "number": "101",
    "type": "Deluxe",
    "price": 3000,
    "capacity": 2,
    "createdAt": "2026-07-30T13:43:03.933Z",
    "updatedAt": "2026-07-30T13:43:03.933Z",
    "__v": 0
  },
  {
    "_id": "6a6b54e74de56a2fb9ad10ac",
    "number": "202",
    "type": "Single",
    "price": 1500,
    "capacity": 1,
    "createdAt": "2026-07-30T13:43:03.943Z",
    "updatedAt": "2026-07-30T13:43:03.943Z",
    "__v": 0
  }
]
```

---

## 2. GET `/api/rooms/available`

### Status: `200 OK` (Room 101 occupied, returning only Room 202)
```json
[
  {
    "_id": "6a6b54e74de56a2fb9ad10ac",
    "number": "202",
    "type": "Single",
    "price": 1500,
    "capacity": 1,
    "createdAt": "2026-07-30T13:43:03.943Z",
    "updatedAt": "2026-07-30T13:43:03.943Z",
    "__v": 0
  }
]
```

### Status: `400 Bad Request` (Missing Params)
```json
{
  "error": "checkIn and checkOut query params are required"
}
```

### Status: `400 Bad Request` (CheckOut <= CheckIn)
```json
{
  "error": "checkOut must be after checkIn"
}
```

---

## 3. GET `/api/bookings`

### Status: `200 OK`
```json
[
  {
    "_id": "6a6b6448b32d851f9ecdc9f0",
    "roomId": {
      "_id": "6a6b54e74de56a2fb9ad10a9",
      "number": "101",
      "type": "Deluxe",
      "price": 3000,
      "capacity": 2,
      "createdAt": "2026-07-30T13:43:03.933Z",
      "updatedAt": "2026-07-30T13:43:03.933Z",
      "__v": 0
    },
    "guestName": "Alice",
    "guestPhone": "9876543210",
    "checkIn": "2025-08-05T00:00:00.000Z",
    "checkOut": "2025-08-10T00:00:00.000Z",
    "status": "confirmed",
    "createdAt": "2026-07-30T14:48:40.215Z",
    "updatedAt": "2026-07-30T14:48:40.215Z",
    "__v": 0
  }
]
```

---

## 4. POST `/api/bookings`

### Status: `201 Created`
```json
{
  "roomId": "6a6b54e74de56a2fb9ad10a9",
  "guestName": "Alice",
  "guestPhone": "9876543210",
  "checkIn": "2025-08-05T00:00:00.000Z",
  "checkOut": "2025-08-10T00:00:00.000Z",
  "status": "confirmed",
  "_id": "6a6b6448b32d851f9ecdc9f0",
  "createdAt": "2026-07-30T14:48:40.215Z",
  "updatedAt": "2026-07-30T14:48:40.215Z",
  "__v": 0
}
```

### Status: `404 Not Found` (Room ID missing from DB)
```json
{
  "error": "Room not found"
}
```

### Status: `409 Conflict` (Dates overlap existing booking)
```json
{
  "error": "Room is not available for the selected dates"
}
```

---

## 5. DELETE `/api/bookings/:id`

### Status: `200 OK`
```json
{
  "message": "Booking cancelled successfully"
}
```

### Status: `404 Not Found`
```json
{
  "error": "Booking not found"
}
```

---

## 6. Global Error Handler Output (`middleware/errorHandler.js`)

### Status: `500 Internal Server Error`
```json
{
  "success": false,
  "message": "Cast to ObjectId failed for value \"123\" (type string) at path \"_id\" for model \"Booking\"",
  "stack": "CastError: Cast to ObjectId failed..."
}
```
*(Note: `stack` is omitted when `NODE_ENV === "production"`)*

---

## Important Files Involved
- [controllers/roomController.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/controllers/roomController.js)
- [controllers/bookingController.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/controllers/bookingController.js)
- [middleware/errorHandler.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/middleware/errorHandler.js)
