# Database — Collections

## Purpose
This document specifies the MongoDB collections created and managed by Mongoose in the `bookinn` database.

---

## What is Currently Implemented

Mongoose automatically maps schemas to lowercase, pluralized collection names in MongoDB:

| Mongoose Model | MongoDB Collection | Description | Primary Key | Indexes |
|---|---|---|---|---|
| `Room` | `rooms` | Stores room inventory | `_id` (`ObjectId`) | `_id_`, `number_1` (unique) |
| `Booking` | `bookings` | Stores guest room reservations | `_id` (`ObjectId`) | `_id_` |

---

## 1. `rooms` Collection
- **Mapped Model**: [[Backend/Models|Room.js]]
- **Description**: Contains room numbers, category type, nightly pricing, and maximum occupancy capacity.
- **Indexes**:
  - `_id_`: Default MongoDB primary key index on `_id`.
  - `number_1`: Unique index created by Mongoose for the `number` field.

---

## 2. `bookings` Collection
- **Mapped Model**: [[Backend/Models|Booking.js]]
- **Description**: Stores reservation records linking a guest's contact info and stay date range to a room ID.
- **Indexes**:
  - `_id_`: Default MongoDB primary key index on `_id`.

---

## Important Files Involved
- [models/Room.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/models/Room.js)
- [models/Booking.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/models/Booking.js)
