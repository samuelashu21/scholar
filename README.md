# AmazonEthiopia — B2C & C2C Ecommerce Platform

A full-featured mobile marketplace application built with the MERN stack and React Native (Expo). AmazonEthiopia enables businesses and individual users to list and sell products, while buyers can browse, purchase, and interact with sellers in real time.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

AmazonEthiopia is a **Business-to-Consumer (B2C)** and **Consumer-to-Consumer (C2C)** ecommerce platform:

- **B2C**: Businesses and verified sellers can list products that regular consumers browse and purchase.
- **C2C**: Everyday users can apply to become sellers, list their own products, and transact directly with other users — all within the same platform.

The platform features real-time messaging between buyers and sellers, PayPal payment processing, OTP-based email verification, image uploads via Cloudinary, and a full admin panel for platform management.

---

## Features

### 🛍️ Shopping & Discovery
- Browse products by category and subcategory
- Full-text product search with filters
- Product detail pages with image carousels, ratings, and reviews
- Wishlist — save products for later
- Like / favorite products
- Track product view counts

### 🛒 Ordering & Payments
- Shopping cart with quantity management
- Multi-step checkout: shipping address → payment method → order review
- PayPal payment integration
- Order history and order-status tracking

### 🤝 Seller Features (C2C)
- Any user can request to become a seller
- Seller subscription tiers: Free, 1 Month, 6 Months, 1 Year
- Seller dashboard with sales analytics
- Seller profile and store information
- Seller ratings and total-sales tracking
- Admin approval / rejection of seller applications

### 💬 Real-Time Messaging
- Socket.io–powered chat between buyers and sellers
- Typing indicators
- Message editing and deletion
- Message read status
- Threaded replies
- Online / offline presence and last-seen timestamps

### 🔐 Authentication & Security
- User registration with OTP email verification
- JWT-based login and session management
- Password hashing with bcryptjs
- Role-based access control (buyer | seller | admin)

### 🛠️ Admin Panel
- User management (list, edit, delete)
- Product management (create, edit, delete)
- Order management
- Category and subcategory management
- Seller-request review and approval

### 📸 Media & Notifications
- Product and profile image uploads via Cloudinary
- Push notifications
- Email notifications via Gmail SMTP

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js v5 | REST API framework |
| MongoDB + Mongoose | Database & ODM |
| Socket.io | Real-time communication |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password hashing |
| Multer + Cloudinary | File/image uploads |
| Nodemailer | Email / OTP sending |
| PayPal REST SDK | Payment processing |
| Validator.js | Input validation |

### Frontend
| Technology | Purpose |
|---|---|
| React Native | Cross-platform mobile UI |
| Expo (SDK 54) | Development toolchain & runtime |
| Expo Router | File-based navigation |
| Redux Toolkit + RTK Query | State management & data fetching |
| Redux Persist + Async Storage | Persistent local state |
| Socket.io-client | Real-time messaging |
| Expo Image Picker | Camera / gallery access |
| Expo Secure Store | Secure credential storage |
| react-native-toast-message | In-app notifications |
| dayjs | Date formatting |

---

## Prerequisites

Make sure the following are installed on your machine before proceeding:

- [Node.js](https://nodejs.org/) ≥ 18
- [npm](https://www.npmjs.com/) ≥ 9 (or yarn)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (or a local MongoDB instance)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- A physical Android / iOS device or an emulator / simulator
- [Cloudinary](https://cloudinary.com/) account (for image uploads)
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) enabled (for OTP emails)
- [PayPal Developer](https://developer.paypal.com/) account (for payment processing)

---

## Getting Started

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Copy the example environment file and fill in your values
cp .env.example .env   # then edit .env (see Environment Variables section)

# 4. (Optional) Seed the database with sample data
npm run data:import

# 5. Start the development server (auto-reloads on changes)
npm run server

# 6. Or start in production mode
npm start
```

The backend API will be available at **http://localhost:9090**.

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Expo development server
npm start

# Available platform-specific commands:
npm run android   # Open on Android emulator / device
npm run ios       # Open on iOS simulator / device
npm run web       # Open in a web browser
```

Scan the QR code with the [Expo Go](https://expo.dev/client) app on your device, or press `a` / `i` in the terminal to launch the Android / iOS emulator.

> **Note:** Update the API base URL inside the frontend code to point to your backend server's IP address or hostname before running on a physical device.

---

## Environment Variables


---

---

## API Endpoints

All endpoints are prefixed with `/api`.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| **Users** | | | |
| POST | `/users/register` | Register a new user (sends OTP) | Public |
| POST | `/users/verify-otp` | Verify OTP and activate account | Public |
| POST | `/users/login` | Login and receive JWT | Public |
| GET | `/users/profile` | Get current user profile | 🔒 User |
| PUT | `/users/profile` | Update current user profile | 🔒 User |
| POST | `/users/seller-request` | Submit a seller application | 🔒 User |
| GET | `/users` | List all users | 🔒 Admin |
| GET | `/users/:id` | Get user by ID | 🔒 Admin |
| PUT | `/users/:id` | Update user by ID | 🔒 Admin |
| DELETE | `/users/:id` | Delete user | 🔒 Admin |
| **Products** | | | |
| GET | `/products` | List / search products | Public |
| POST | `/products` | Create a product | 🔒 Seller/Admin |
| GET | `/products/:id` | Get product details | Public |
| PUT | `/products/:id` | Update a product | 🔒 Seller/Admin |
| DELETE | `/products/:id` | Delete a product | 🔒 Seller/Admin |
| POST | `/products/:id/reviews` | Submit a product review | 🔒 User |
| **Orders** | | | |
| POST | `/orders` | Place a new order | 🔒 User |
| GET | `/orders/myorders` | Get current user's orders | 🔒 User |
| GET | `/orders/:id` | Get order by ID | 🔒 User |
| PUT | `/orders/:id/pay` | Mark order as paid | 🔒 User |
| GET | `/orders` | List all orders | 🔒 Admin |
| PUT | `/orders/:id/deliver` | Mark order as delivered | 🔒 Admin |
| **Categories** | | | |
| GET | `/categories` | List all categories | Public |
| POST | `/categories` | Create a category | 🔒 Admin |
| GET | `/subcategories` | List all subcategories | Public |
| POST | `/subcategories` | Create a subcategory | 🔒 Admin |
| **Wishlist** | | | |
| GET | `/wishlist` | Get current user's wishlist | 🔒 User |
| POST | `/wishlist` | Add product to wishlist | 🔒 User |
| DELETE | `/wishlist/:id` | Remove product from wishlist | 🔒 User |
| **Chats** | | | |
| GET | `/chats` | Get user's chat list | 🔒 User |
| GET | `/chats/:chatId` | Get messages in a chat | 🔒 User |
| POST | `/chats` | Send a message | 🔒 User |
| **Uploads** | | | |
| POST | `/upload` | Upload product image to Cloudinary | 🔒 Seller/Admin |
| POST | `/uploadprofile` | Upload profile image to Cloudinary | 🔒 User |
| **Payments** | | | |
| GET | `/paypal/config` | Get PayPal client ID | 🔒 User |

### Real-Time Socket Events (Socket.io)

| Event | Direction | Description |
|---|---|---|
| `userOnline` | Client → Server | Mark user as online |
| `userOffline` | Client → Server | Mark user as offline |
| `joinRoom` | Client → Server | Join a chat room |
| `typing` | Client → Server | Broadcast typing status |
| `newMessage` | Client → Server | Send a new message |
| `editMessage` | Client → Server | Edit an existing message |
| `deleteMessage` | Client → Server | Delete a message |

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Commit** your changes with a descriptive message:
   ```bash
   git commit -m "feat: add your feature description"
   ```
3. **Push** to your fork and open a **Pull Request** against the `main` branch.
4. Ensure your code follows the existing style and that the app runs without errors on both Android and iOS.

---

## License

This project is licensed under the **ISC License**. See the [LICENSE](LICENSE) file for details.
