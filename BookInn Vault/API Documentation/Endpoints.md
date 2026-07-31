# REST API Endpoints

## Authentication Routes (`/api/auth`)

| Method | Endpoint | Protection | Request Body | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | `{ name, email, password, role? }` | Registers a new user account & returns JWT token |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | Authenticates credentials & returns JWT token |

---

## Room Routes (`/api/rooms`)

| Method | Endpoint | Protection | Query Params | Description |
|---|---|---|---|---|
| `GET` | `/api/rooms` | Public | None | Returns list of all rooms |
| `GET` | `/api/rooms/available` | Public | `checkIn`, `checkOut` | Returns rooms available in date range |

---

## Booking Routes (`/api/bookings`)

| Method | Endpoint | Protection | Body / Params | Description |
|---|---|---|---|---|
| `GET` | `/api/bookings/my-bookings` | Bearer JWT | None | Returns bookings for authenticated user |
| `GET` | `/api/bookings` | Bearer JWT + Admin | None | Returns all bookings in the system |
| `POST` | `/api/bookings` | Bearer JWT | `{ roomId, guestName, guestPhone, checkIn, checkOut }` | Creates a new room reservation |
| `DELETE` | `/api/bookings/:id` | Bearer JWT | `:id` (Booking ID) | Cancels a booking (User own or Admin) |
