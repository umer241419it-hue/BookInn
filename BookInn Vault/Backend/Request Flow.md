# Backend — Request Flow

## Purpose
This document provides end-to-end request lifecycle sequence diagrams for all primary operations in **BookInn**.

---

## What is Currently Implemented

The diagrams below represent the actual execution pathways of HTTP requests through Express routers, controllers, shared utilities, and MongoDB ODM queries.

---

## 1. Get Available Rooms Flow (`GET /api/rooms/available`)

```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant Express as server.js
    participant Router as roomRoutes.js
    participant Controller as roomController.js
    participant Util as utils/availability.js
    participant BookingModel as Booking Model
    participant RoomModel as Room Model
    participant DB as MongoDB

    Client->>Express: GET /api/rooms/available?checkIn=2025-08-05&checkOut=2025-08-10
    Express->>Router: Route match /api/rooms
    Router->>Controller: getAvailableRooms(req, res)
    Controller->>Controller: Validate query params & dates (checkOut > checkIn)
    alt Invalid Params / Dates
        Controller-->>Client: 400 Bad Request { error: "..." }
    else Valid Params
        Controller->>Util: getBookedRoomIds(checkInDate, checkOutDate)
        Util->>BookingModel: find({ status: "confirmed", checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } })
        BookingModel->>DB: Query bookings
        DB-->>BookingModel: Return conflicting booking docs
        BookingModel-->>Util: Return array of ObjectIds
        Util-->>Controller: Return bookedRoomIds array
        Controller->>RoomModel: find({ _id: { $nin: bookedRoomIds } })
        RoomModel->>DB: Query available rooms
        DB-->>RoomModel: Return room docs
        RoomModel-->>Controller: Return room objects
        Controller-->>Client: 200 OK [ room objects ]
    end
```

---

## 2. Create Booking Flow (`POST /api/bookings`)

```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant Express as server.js
    participant Router as bookingRoutes.js
    participant Controller as bookingController.js
    participant Util as utils/availability.js
    participant RoomModel as Room Model
    participant BookingModel as Booking Model
    participant DB as MongoDB

    Client->>Express: POST /api/bookings { roomId, guestName, guestPhone, checkIn, checkOut }
    Express->>Router: Route match /api/bookings
    Router->>Controller: createBooking(req, res)
    Controller->>Controller: Validate checkOut > checkIn
    alt Date invalid
        Controller-->>Client: 400 Bad Request { error: "checkOut must be after checkIn" }
    else Date valid
        Controller->>RoomModel: findById(roomId)
        RoomModel->>DB: Query room by ID
        DB-->>RoomModel: Return room or null
        alt Room not found
            Controller-->>Client: 404 Not Found { error: "Room not found" }
        else Room exists
            Controller->>Util: getBookedRoomIds(checkInDate, checkOutDate)
            Util->>BookingModel: find conflicting bookings query
            BookingModel->>DB: Execute query
            DB-->>BookingModel: Return bookings
            BookingModel-->>Util: Return ObjectIds
            Util-->>Controller: Return bookedRoomIds array
            alt roomId is in bookedRoomIds
                Controller-->>Client: 409 Conflict { error: "Room is not available..." }
            else Room is available
                Controller->>BookingModel: create({ roomId, guestName, guestPhone, checkIn, checkOut })
                BookingModel->>DB: Insert booking document
                DB-->>BookingModel: Saved document
                BookingModel-->>Controller: Created booking object
                Controller-->>Client: 201 Created booking object
            end
        end
    end
```

---

## 3. Cancel Booking Flow (`DELETE /api/bookings/:id`)

```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant Express as server.js
    participant Router as bookingRoutes.js
    participant Controller as bookingController.js
    participant BookingModel as Booking Model
    participant DB as MongoDB

    Client->>Express: DELETE /api/bookings/6a6b6448b32d851f9ecdc9f0
    Express->>Router: Route match /api/bookings/:id
    Router->>Controller: cancelBooking(req, res)
    Controller->>BookingModel: findByIdAndDelete(req.params.id)
    BookingModel->>DB: Delete document by ID
    DB-->>BookingModel: Deleted object or null
    BookingModel-->>Controller: Result
    alt Booking not found
        Controller-->>Client: 404 Not Found { error: "Booking not found" }
    else Booking deleted
        Controller-->>Client: 200 OK { message: "Booking cancelled successfully" }
    end
```

---

## Important Files Involved
- [server.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/server.js)
- [routes/roomRoutes.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/routes/roomRoutes.js)
- [routes/bookingRoutes.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/routes/bookingRoutes.js)
- [controllers/roomController.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/controllers/roomController.js)
- [controllers/bookingController.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/controllers/bookingController.js)
- [utils/availability.js](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/utils/availability.js)
