# API Documentation — Request Examples

## Purpose
This document provides exact HTTP request examples (cURL and Node.js `http`/`fetch`) for testing all API endpoints in **BookInn**.

---

## What is Currently Implemented

---

## 1. GET All Rooms (`GET /api/rooms`)

### cURL:
```bash
curl -X GET http://localhost:5000/api/rooms
```

---

## 2. GET Available Rooms (`GET /api/rooms/available`)

### cURL:
```bash
curl -X GET "http://localhost:5000/api/rooms/available?checkIn=2025-08-05&checkOut=2025-08-10"
```

---

## 3. GET All Bookings (`GET /api/bookings`)

### cURL:
```bash
curl -X GET http://localhost:5000/api/bookings
```

---

## 4. POST Create Booking (`POST /api/bookings`)

### cURL:
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "6a6b54e74de56a2fb9ad10a9",
    "guestName": "Alice",
    "guestPhone": "9876543210",
    "checkIn": "2025-08-05",
    "checkOut": "2025-08-10"
  }'
```

---

## 5. DELETE Cancel Booking (`DELETE /api/bookings/:id`)

### cURL:
```bash
curl -X DELETE http://localhost:5000/api/bookings/6a6b6448b32d851f9ecdc9f0
```

---

## Node.js HTTP Native Request Script Example

```javascript
const http = require("http");

const data = JSON.stringify({
  roomId: "6a6b54e74de56a2fb9ad10a9",
  guestName: "Alice",
  guestPhone: "9876543210",
  checkIn: "2025-08-05",
  checkOut: "2025-08-10"
});

const req = http.request(
  {
    hostname: "localhost",
    port: 5000,
    path: "/api/bookings",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data)
    }
  },
  (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      console.log("Status Code:", res.statusCode);
      console.log("Response Body:", JSON.parse(body));
    });
  }
);

req.write(data);
req.end();
```

---

## Important Files Involved
- [routes/roomRoutes.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/routes/roomRoutes.js)
- [routes/bookingRoutes.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/routes/bookingRoutes.js)
