# Data Models

## Purpose
This document specifies the Mongoose schema structures implemented in `hotel-backend/models/`.

---

## Model Specifications

### 1. User Model (`User.js`)
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  timestamps: true
}
```
- **Pre-save Hook**: Hashes plaintext password using `bcryptjs` (salt factor 10).
- **Methods**: `matchPassword(enteredPassword)`.

### 2. Booking Model (`Booking.js`)
```javascript
{
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  guestName: { type: String, required: true },
  guestPhone: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  status: { type: String, default: "confirmed" },
  timestamps: true
}
```

### 3. Room Model (`Room.js`)
```javascript
{
  number: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  capacity: { type: Number, required: true },
  timestamps: true
}
```
