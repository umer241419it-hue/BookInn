# Database — Sample Documents

## Purpose
This document provides valid, real sample JSON document representations matching the MongoDB database structure for **BookInn**.

---

## What is Currently Implemented

---

## 1. `rooms` Collection Sample Document

```json
{
  "_id": "6a6b54e74de56a2fb9ad10a9",
  "number": "101",
  "type": "Deluxe",
  "price": 3000,
  "capacity": 2,
  "createdAt": "2026-07-30T13:43:03.933Z",
  "updatedAt": "2026-07-30T13:43:03.933Z",
  "__v": 0
}
```

---

## 2. `bookings` Collection Sample Document (Unpopulated)

```json
{
  "_id": "6a6b6448b32d851f9ecdc9f0",
  "roomId": "6a6b54e74de56a2fb9ad10a9",
  "guestName": "Alice",
  "guestPhone": "9876543210",
  "checkIn": "2025-08-05T00:00:00.000Z",
  "checkOut": "2025-08-10T00:00:00.000Z",
  "status": "confirmed",
  "createdAt": "2026-07-30T14:48:40.215Z",
  "updatedAt": "2026-07-30T14:48:40.215Z",
  "__v": 0
}
```

---

## 3. `bookings` Collection Sample Document (Populated)

```json
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
```

---

## Important Files Involved
- [models/Room.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/models/Room.js)
- [models/Booking.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/models/Booking.js)
