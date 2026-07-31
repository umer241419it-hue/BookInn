# Glossary

## Purpose
This document provides definitions for domain-specific business terms, acronyms, and technical terminology used across the **BookInn** project documentation.

---

## Technical & Domain Terms

| Term | Category | Definition |
|---|---|---|
| **BookInn** | Project | The Hotel Management System application name |
| **CORS** | Web Standard | Cross-Origin Resource Sharing (`cors` middleware) enabling browser clients on separate domains to access the API |
| **Date Overlap** | Domain Logic | The mathematical condition where an existing booking conflicts with a requested stay: `checkIn < requestedCheckOut AND checkOut > requestedCheckIn` |
| **Same-Day Turnover** | Domain Logic | The hotel policy allowing guest checkout and new guest checkin on the exact same date (checkout morning, checkin afternoon) using strict `<` and `>` operators |
| **Express.js** | Framework | Fast, unopinionated, minimalist web framework for Node.js |
| **JSON** | Format | JavaScript Object Notation used for HTTP API payload transmission |
| **MERN** | Architecture | Technology stack comprising MongoDB, Express.js, React (Not Implemented), Node.js |
| **MongoDB** | Database | Scalable NoSQL document database storing `rooms` and `bookings` |
| **Mongoose** | ODM | Object Data Modeling library providing schema validation, type casting, and query building for MongoDB |
| **ObjectId** | Database | 12-byte BSON data type serving as primary keys (`_id`) in MongoDB collections |
| **Populate** | Mongoose | Mongoose feature (`.populate("roomId")`) that automatically replaces referenced `ObjectId`s with full target documents |
| **REST** | Architecture | Representational State Transfer architectural style for Web APIs |
| **Room Capacity** | Domain Logic | Maximum number of guests permitted in a room |
| **Static Pricing** | Domain Logic | Room rate model where `price` per night is fixed per room without seasonal or dynamic variations |
