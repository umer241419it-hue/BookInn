# Frontend — Pages

## Purpose
This document details the main page view containers implemented in **hotel-frontend**.

---

## Implemented Pages

### 1. Search Page (`SearchPage.jsx`)
- **Route**: `/`
- **Purpose**: Primary interface for checking room availability, filtering by room attributes, and launching room reservation modals.
- **State**: `rooms`, `loading`, `error`, `searchDates`, `selectedRoom`, `selectedType`, `minPrice`, `maxPrice`, `minCapacity`.

### 2. Bookings Page (`BookingsPage.jsx`)
- **Route**: `/bookings`
- **Purpose**: Displays user and system reservations fetched from `GET /api/bookings`. Supports cancellation via `DELETE /api/bookings/:id`.
- **State**: `bookings`, `loading`, `error`, `successMsg`.
