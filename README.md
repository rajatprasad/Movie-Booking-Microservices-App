# 🎬 Movie Booking Microservices App

A scalable and robust movie ticket booking application built using **Node.js**, **TypeScript**, **MongoDB**, **Redis**, **RabbitMQ**, and **Express**—architected with microservices and API Gateway for modularity and scalability.

---

## 🧱 Microservices Architecture

This project follows a microservices architecture, separating business concerns into individual services:

### 🔧 Services

| Service         | Port  | Description                                  |
|----------------|-------|----------------------------------------------|
| **Auth**       | 8001  | Handles user authentication and JWT issuing  |
| **Movie**      | 8002  | Manages movies and showtimes                 |
| **Booking**    | 8003  | Handles ticket booking and cancellations     |
| **API Gateway**| 8000  | Single entry point that routes all requests  |

---

## 🚀 Features

- ✅ User signup/login with JWT
- 🎥 Movie and showtime management
- 🎟️ Secure seat booking with **Redis locking**
- 🔁 Atomic operations using **MongoDB Transactions**
- 🧵 Event-driven architecture via **RabbitMQ**
- 🔐 Authenticated requests only for protected routes
- 📉 Rate limiting and request timeout via API Gateway
- 📡 Service-to-service communication via HTTP proxy
- 📊 Health check endpoints for monitoring

---

## 🗂 Project Structure

- root/
- ├── api-gateway/
- ├── auth-service/
- ├── movie-service/
- ├── booking-service/
- ├── shared/ # Common utilities (e.g. RabbitMQ, Redis)
- └── README.md

---

## 🛠️ Tech Stack

- **Node.js** + **Express**
- **TypeScript**
- **MongoDB** (transactions)
- **Redis** (seat lock mechanism)
- **RabbitMQ** (event bus)
- **JWT Auth**
  
---

## 📬 API Overview
Auth
POST /signup — Create user

POST /login — Login and get token

Movies
GET /movies — List all movies

GET /movies/:id — Get single movie

POST /movies — Add a new movie

Booking
POST /bookings — Book tickets (requires JWT)

POST /bookings/:id/cancel — Cancel a booking

(All routes go through the API Gateway with /v1 prefix.)

## 🔒 Authentication Flow
Users sign up or log in to get a JWT token.

API Gateway validates JWT on protected routes.

User ID is injected via x-user-id header to booking service.

-----
