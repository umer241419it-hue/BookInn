# Frontend — Components

## Purpose
This document records the reusable UI components implemented in the **hotel-frontend** application.

---

## Component Catalog

| Component | File Path | Purpose |
|---|---|---|
| **Sidebar** | [Sidebar.jsx](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/hotel-frontend/src/components/Sidebar.jsx) | Persistent left navigation panel on desktop, hamburger drawer toggle on mobile viewports. |
| **SearchForm** | [SearchForm.jsx](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/hotel-frontend/src/components/SearchForm.jsx) | Check-in and check-out date range picker with validation. |
| **FilterBar** | [FilterBar.jsx](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/hotel-frontend/src/components/FilterBar.jsx) | Icon-triggered popover panel for client-side filtering by Room Type, Capacity, and Price Range. |
| **RoomGrid** | [RoomGrid.jsx](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/hotel-frontend/src/components/RoomGrid.jsx) | Auto-filling CSS grid renderer displaying `RoomCard` items or empty state. |
| **RoomCard** | [RoomCard.jsx](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/hotel-frontend/src/components/RoomCard.jsx) | Individual room card with INR price formatting and "Book Room" trigger button. |
| **BookingModal** | [BookingModal.jsx](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/hotel-frontend/src/components/BookingModal.jsx) | Modal dialog for confirming booking details with specific HTTP status error handling (`409`, `400`, `500`). |
