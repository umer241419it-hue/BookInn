# BookInn Vault — Knowledge Base

Welcome to the official technical documentation for **BookInn**, a Hotel Management System featuring an Express REST API backend and a Vite + React frontend.

---

## 🗺️ Documentation Map

### 📌 Core Architecture & Setup
- [[Project Overview]] — High-level summary of the system and scope.
- [[Architecture]] — System architecture, modular design pattern, and component interaction.
- [[Tech Stack]] — Runtime, frameworks, libraries, and database versions used.
- [[Folder Structure]] — Complete layout of backend code and frontend application.

### ⚙️ Backend Documentation
- [[Backend/Overview|Backend Overview]] — Architecture of the Express backend server.
- [[Backend/Server|Server Initialization]] — Application bootstrapping (`server.js`).
- [[Backend/API Routes|API Routes]] — Endpoint definitions and route mapping.
- [[Backend/Controllers|Controllers]] — Request handlers (`roomController`, `bookingController`, `authController`).
- [[Backend/Middleware|Middleware]] — Global middleware (`auth.js`, `errorHandler`, CORS).
- [[Backend/Models|Data Models]] — Mongoose schemas (`Room`, `Booking`, `User`).
- [[Backend/Utilities|Utilities]] — Core logic helper (`availability.js`).
- [[Backend/Request Flow|Request Flow]] — Sequence diagrams of request lifecycle.

### 🗄️ Database Documentation
- [[Database/Database Overview|Database Overview]] — MongoDB connection setup (`db.js`).
- [[Database/Collections|Collections]] — Details on `rooms`, `bookings`, and `users` collections.
- [[Database/Schema|Schema Specifications]] — Detailed schema fields and validation rules.
- [[Database/Relationships|Relationships]] — References between `Booking`, `Room`, and `User`.
- [[Database/Sample Documents|Sample Documents]] — JSON representations of stored documents.

### 📋 Feature Documentation
- [[Features/Rooms|Rooms Feature]] — Room management and query logic.
- [[Features/Bookings|Bookings Feature]] — Booking creation, conflict checks, and cancellation.
- [[Features/Authentication|Authentication & RBAC]] — JWT signup/login, password hashing, and user roles (`user`, `admin`).
- [[Features/Dashboard|Dashboard]] — *(Planned / In Progress)*
- [[Features/Customers|Customers]] — *(Planned)*
- [[Features/Staff|Staff]] — *(Planned)*

### 🌐 Frontend Documentation
- [[Frontend/Overview|Frontend Overview]] — React 18 + Vite SPA architecture and hospitality theme.
- [[Frontend/Pages|Pages]] — Page views (`SearchPage`, `BookingsPage`).
- [[Frontend/Components|Components]] — Reusable UI components (`Sidebar`, `SearchForm`, `FilterBar`, `RoomCard`, `RoomGrid`, `BookingModal`).
- [[Frontend/Routing|Routing]] — Client-side routing with `react-router-dom` 6.

### 🔌 API Documentation
- [[API Documentation/Endpoints|Endpoints Summary]] — Detailed specification of all REST endpoints.
- [[API Documentation/Request Examples|Request Examples]] — Payloads for testing endpoints.
- [[API Documentation/Response Examples|Response Examples]] — JSON responses and HTTP status codes.

### 📚 References
- [[Glossary]] — Definitions of domain terms and technical acronyms used in the codebase.
