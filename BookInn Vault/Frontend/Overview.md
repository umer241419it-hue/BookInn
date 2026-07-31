# Frontend Overview

## Purpose
This document provides the status and architecture of the client-side user interface layer for the **BookInn** system.

---

## Status: Implemented

The frontend is a single-page React application built with Vite and React Router 6, styled using Vanilla CSS with CSS variables (`:root`) for a warm, professional hospitality theme.

---

## Architecture State

- **Framework**: Vite + React 18 (JavaScript / JSX).
- **Styling**: Responsive Vanilla CSS (`index.css`) featuring a warm hospitality color palette (Navy `#1a2b3c`, Gold `#c9a35d`, Cream `#faf8f5`).
- **Routing**: React Router 6 handling client-side SPA transitions between `/` (Search Rooms) and `/bookings` (My Bookings).
- **API Communication**: Axios modules (`api/rooms.js`, `api/bookings.js`) targeting backend REST endpoints via Vite proxy (`/api`).
- **Currency**: `Intl.NumberFormat('en-IN')` formatting all price displays in Indian Rupees (`₹`).
