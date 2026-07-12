<<<<<<< HEAD
# 🚗 Car Dealership Inventory System

A full-stack Car Dealership Inventory Management System built using **Java Spring Boot**, **React**, and **MongoDB**, following **Test-Driven Development (TDD)** principles and clean architecture practices.

The system enables users to browse vehicles, search inventory, purchase vehicles, and allows administrators to manage dealership inventory securely through role-based authentication.

---

## 🔐 Authentication & Authorization

* User Registration
* User Login
* JWT Authentication
* Role-Based Access Control (USER, ADMIN)
* Protected REST APIs
* Password Encryption using BCrypt

---

## 🚘 Vehicle Management

* Add New Vehicle
* View Available Vehicles
* Search Vehicles by:
  * Make
  * Model
  * Category
  * Price Range
* Update Vehicle Information
* Delete Vehicles (Admin Only)

---

## 📦 Inventory Management

* Purchase Vehicles
* Automatic Stock Reduction
* Prevent Purchasing Out-of-Stock Vehicles
* Restock Vehicles (Admin Only)
* Inventory Validation

---

## 💻 Frontend Features

* Premium Responsive User Interface (Glassmorphism & animations)
* Vehicle Dashboard
* Search & Filtering
* Authentication Pages (Login, Register)
* Admin Management Panel (Add, edit, delete, restock)
* Protected Routes
* Purchase Button Disabled for Out-of-Stock Vehicles

---

## 🏗 System Architecture

```text
Frontend (React + TypeScript)
              ↓
        REST API Calls
              ↓
Backend (Spring Boot)
              ↓
        Controller Layer
              ↓
         Service Layer
              ↓
      Repository Layer
              ↓
Spring Data MongoDB
              ↓
         MongoDB Atlas
```

---

## 🛠 Tech Stack

### Frontend
* React.js
* TypeScript
* Vite
* Tailwind CSS
* Axios
* React Router DOM
* React Query
* Vitest & React Testing Library (Testing)

### Backend
* Java 22
* Spring Boot 3
* Spring MVC
* Spring Security
* Spring Data MongoDB
* JWT Authentication
* Maven (Maven wrapper included)
* Lombok
* JUnit 5 & Mockito (Testing)

---

## 🔑 Environment Variables

### Backend (`backend/.env` or system environment variables)
```env
MONGODB_URI=mongodb://localhost:27017/car_dealership
JWT_SECRET=9a4f2c8d3b7a1e5f8c3d6b2a1c5d8e7f9a4f2c8d3b7a1e5f8c3d6b2a1c5d8e7f
JWT_EXPIRATION=86400000
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8080/api
```

---

## ⚙️ Installation & Running

### 1. Database Setup
Ensure you have MongoDB running locally on default port `27017` or supply a custom Atlas connection URI in `MONGODB_URI`.

### 2. Backend Setup
Navigate to the `backend` folder and run the Maven wrapper:
```bash
cd backend
# Build and run
.\mvnw spring-boot:run
```
Application URL: `http://localhost:8080`
API Documentation (Swagger UI): `http://localhost:8080/swagger-ui/index.html`

### 3. Frontend Setup
Navigate to the `frontend` folder and run:
```bash
cd frontend
npm install
npm run dev
```
Frontend URL: `http://localhost:5173`

---

## 🧪 Running Tests

### Backend Tests (JUnit 5 + Mockito)
```bash
cd backend
.\mvnw test
```

### Frontend Tests (Vitest + React Testing Library)
```bash
cd frontend
npm run test
```
=======
# Car-Inventory-System
>>>>>>> 61cf4af1929381588745953e944ffb3cf2e6ee1d
