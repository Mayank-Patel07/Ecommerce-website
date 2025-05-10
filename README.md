# 🛍️ E-commerce Website (MERN Stack)

This is a full-featured **E-commerce Website** built using the **MERN stack (MongoDB, Express, React, Node.js)**. It includes complete user authentication, secure data handling, and a responsive UI for browsing and purchasing products.

---

## 📝 Project Description

This MERN-based e-commerce platform allows users to **register, log in securely**, **browse and purchase products**, **view order history**, and **manage their profile**. All user data and transactions are **end-to-end encrypted** using industry-standard practices with **JWT** and **bcrypt**.

---

## 🚀 Technologies Used

### 🧩 Stack
- **MongoDB** – NoSQL database
- **Express.js** – RESTful API backend
- **React.js** – Frontend user interface
- **Node.js** – Backend runtime

### 📚 Libraries & Tools
- **Axios** – For HTTP requests from the frontend
- **React Hook Form** – Form handling and validation
- **Express** – Backend server framework
- **Mongoose** – ODM for MongoDB
- **bcrypt** – Password hashing
- **jsonwebtoken (JWT)** – Token-based authentication
- **dotenv** – Environment variable management

---

🔧 Features
🔐 User Authentication:

Secure sign-up and login with JWT & bcrypt

Protected routes and role-based access

🛍️ Product Browsing:

Users can browse, filter, and view product details

💳 Ordering System:

Users can place orders and view order history

👤 Profile Management:

Edit personal details and track past orders

📱 Responsive Design:

Mobile-friendly UI built with modern components

## 📁 Project Structure

```bash
ecommerce-project/
├── frontend/                         # React Frontend (Vite or CRA)
│   ├── public/
│   ├── src/
│   │   ├── assets/                  # Static files like images, styles
│   │   ├── context/                 # Global context (Auth, Cart)
│   │   ├── product/                 # Product-related pages/components
│   │   ├── root/                    # Layouts and shared components
│   │   ├── user/                    # User pages (Profile, Orders)
│   │   └── App.jsx / main.jsx
│   └── package.json
├── backend/                          # Node.js + Express Backend
│   ├── models/                      # Mongoose schemas (User, Product, Order)
│   ├── routes/                      # Express routes (auth, product, order)
│   ├── middleware/                 # Auth middleware, error handling
│   ├── server.js
│   └── .env
├── README.md
└── package.json
