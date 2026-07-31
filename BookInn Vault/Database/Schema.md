# Database — Schema Specifications

## Purpose
This document provides field-level schema definitions for all database collections in **BookInn**.

---

## What is Currently Implemented

---

## 1. `Room` Schema (`rooms` Collection)

```javascript
{
  number: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  capacity: { type: Number, required: true },
  createdAt: { type: Date }, // Auto-managed by timestamps: true
  updatedAt: { type: Date }  // Auto-managed by timestamps: true
}
```

### Field Specification Table:

| Field | Data Type | Validation / Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Auto-generated PK | Unique identifier |
| `number` | `String` | `required: true`, `unique: true` | Room number identifier (e.g. `"101"`) |
| `type` | `String` | `required: true` | Room category (e.g. `"Deluxe"`, `"Single"`) |
| `price` | `Number` | `required: true` | Static rate per night in local currency |
| `capacity` | `Number` | `required: true` | Maximum guest capacity |
| `createdAt` | `Date` | Auto-generated | Document creation timestamp |
| `updatedAt` | `Date` | Auto-generated | Document last update timestamp |

---

## 2. `Booking` Schema (`bookings` Collection)

```javascript
{
  roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  guestName: { type: String, required: true },
  guestPhone: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(value) { return value > this.checkIn; },
      message: "checkOut must be after checkIn"
    }
  },
  status: { type: String, default: "confirmed" },
  createdAt: { type: Date }, // Auto-managed by timestamps: true
  updatedAt: { type: Date }  // Auto-managed by timestamps: true
}
```

### Field Specification Table:

| Field | Data Type | Validation / Constraints | Description |
|---|---|---|---|
| `_id` | `ObjectId` | Auto-generated PK | Unique identifier |
| `roomId` | `ObjectId` | `required: true`, `ref: "Room"` | Foreign reference to `rooms._id` |
| `guestName` | `String` | `required: true` | Full name of reserving guest |
| `guestPhone` | `String` | `required: true` | Contact phone number |
| `checkIn` | `Date` | `required: true` | Arrival date |
| `checkOut` | `Date` | `required: true`, `validate: checkOut > checkIn` | Departure date |
| `status` | `String` | `default: "confirmed"` | Booking status string |
| `createdAt` | `Date` | Auto-generated | Document creation timestamp |
| `updatedAt` | `Date` | Auto-generated | Document last update timestamp |

---

## Important Files Involved
- [models/Room.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/models/Room.js)
- [models/Booking.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/models/Booking.js)
