# BookInn Vault — Knowledge Base

Welcome to the official technical documentation for **BookInn**, a Hotel Management System backend built with Node.js, Express, and MongoDB (Mongoose).

> [!NOTE]
> This vault documents **only** the currently implemented code in the repository as of the latest build. Features or components not yet implemented are explicitly marked as **Not Implemented**.

---

## 🗺️ Documentation Map

### 📌 Core Architecture & Setup
- [[Project Overview]] — High-level summary of the system and scope.
- [[Architecture]] — System architecture, modular design pattern, and component interaction.
- [[Tech Stack]] — Runtime, frameworks, libraries, and database versions used.
- [[Folder Structure]] — Complete layout of backend code and configuration.

### ⚙️ Backend Documentation
- [[Backend/Overview|Backend Overview]] — Architecture of the Express backend server.
- [[Backend/Server|Server Initialization]] — Application bootstrapping (`server.js`).
- [[Backend/API Routes|API Routes]] — Endpoint definitions and route mapping.
- [[Backend/Controllers|Controllers]] — Request handlers (`roomController`, `bookingController`).
- [[Backend/Middleware|Middleware]] — Global middleware (`errorHandler`, CORS, JSON body parser).
- [[Backend/Models|Data Models]] — Mongoose schemas (`Room`, `Booking`).
- [[Backend/Utilities|Utilities]] — Core logic helper (`availability.js`).
- [[Backend/Request Flow|Request Flow]] — Sequence diagrams of request lifecycle.

### 🗄️ Database Documentation
- [[Database/Database Overview|Database Overview]] — MongoDB connection setup (`db.js`).
- [[Database/Collections|Collections]] — Details on `rooms` and `bookings` collections.
- [[Database/Schema|Schema Specifications]] — Detailed schema fields and validation rules.
- [[Database/Relationships|Relationships]] — References between `Booking` and `Room`.
- [[Database/Sample Documents|Sample Documents]] — JSON representations of stored documents.

### 📋 Feature Documentation
- [[Features/Rooms|Rooms Feature]] — Room management and query logic.
- [[Features/Bookings|Bookings Feature]] — Booking creation, conflict checks, and cancellation.
- [[Features/Dashboard|Dashboard]] — *(Not Implemented)*
- [[Features/Customers|Customers]] — *(Not Implemented)*
- [[Features/Staff|Staff]] — *(Not Implemented)*
- [[Features/Authentication|Authentication]] — *(Not Implemented)*
- [[Features/Other Features|Other Features]] — *(Not Implemented)*

### 🌐 Frontend Documentation
- [[Frontend/Overview|Frontend Overview]] — *(Not Implemented)*
- [[Frontend/Pages|Pages]] — *(Not Implemented)*
- [[Frontend/Components|Components]] — *(Not Implemented)*
- [[Frontend/Routing|Routing]] — *(Not Implemented)*
- [[Frontend/State Management|State Management]] — *(Not Implemented)*
- [[Frontend/UI Flow|UI Flow]] — *(Not Implemented)*

### 🔌 API Documentation
- [[API Documentation/Endpoints|Endpoints Summary]] — Detailed specification of all REST endpoints.
- [[API Documentation/Request Examples|Request Examples]] — Payloads for testing endpoints.
- [[API Documentation/Response Examples|Response Examples]] — JSON responses and HTTP status codes.

### 📚 References
- [[Glossary]] — Definitions of domain terms and technical acronyms used in the codebase.
