# Yuva Attire — Premium Kids Fashion & Accessories E-Commerce

**Yuva Attire** is a full-stack, vibrant Kids Fashion, Footwear & Toys e-commerce platform built with **React JS (Vite + Tailwind CSS)** and **Node.js (Express + SQLite/JSON DB)**.

---

## 🌟 Key Features

### 🛍️ Premium Kids Store Experience
- **Kids Catalog & Categorization**: Boys, Girls, Baby/Infants (0-24M), Footwear (Light-up shoes, ballerinas), Montessori Wooden Toys, Bags & Party Wear.
- **Fast Age Filters**: `0-24 Months`, `2-4 Years`, `4-8 Years`, `8-12 Years`.
- **Search & Live Autocomplete**: Real-time matching for frocks, tuxedos, shoes, dino bags, toys.
- **Product Details & Quick View**: Multi-image gallery, Kids Size Chart Guide (Age vs Chest/Height), Color selector, Stock availability indicator.
- **Interactive Shopping Bag / Cart**: Quantity controls, discount coupon application (`WELCOME10`, `KIDSFEST20`, `YUVAVIP15`), price breakdown with VIP discount preview.
- **Wishlist / Shortlist**: 1-click heart shortlist toggle and "Move to Bag".

### 💳 Razorpay Payment Gateway Integration
- **Online Checkout**: Integration with Razorpay SDK and interactive test sandbox modal supporting Cards, UPI (GPay/PhonePe/Paytm), Netbanking, and Cash on Delivery (COD).
- **Payment Verification**: Cryptographic signature validation and automatic order creation with payment status logging.

### 👑 VIP Club Membership (₹1,000 / Year)
- **Flat Extra 15% OFF** on every single order (automatically calculated and applied).
- **Free Express Shipping** with no minimum order value.
- **Early 24-Hour Access** to sales and festive drops.
- **₹500 Birthday Gift Voucher**.
- Instant subscription via Razorpay with 365-day validity tracking.

### 📊 Backend Admin Management Dashboard (`/myadmin`)
- **Secure Admin Authentication**: Hidden administrative portal accessible exclusively via direct URL route `/myadmin`.
- **Store KPIs & Overview**: Total Revenue, Total Orders, Active VIP Members, Sold-Out & Low-Stock alerts.
- **Product Management**: Create new listings with image URLs, title, description, category, age group, price, discount price, sizes & stock per size, tags, fabric, and care instructions. Edit and delete products.
- **Real-Time Inventory Manager**: Automatic stock deduction on purchase, Sold-out toggle, Quick Add Stock (+5, +10).
- **Order Management**: View customer orders, update order status (`PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`) and Delhivery tracking numbers.
- **Payment & Transaction Tracker**: View all Razorpay payment records, Transaction IDs, Order IDs, Amount, Customer information, and Status (`SUCCESS`, `PENDING`, `FAILED`).
- **VIP Members Manager**: View all subscribed VIP customers and validity expiration dates.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# Root & Backend
npm install

# Frontend Client
npm install --prefix client
```

### 2. Start Both Backend & Frontend in Development Mode
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend UI**: `http://localhost:5173`

### 3. Production Build & Start
```bash
npm run build
npm start
```
The Node.js server will serve both the REST API and the built React frontend on `http://localhost:5000`.

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Notes |
|---|---|---|---|
| **Parent Customer** | `riya@example.com` | `password123` | Available on storefront login |
| **Store Admin** | *(Configured via `ADMIN_EMAIL`)* | *(Configured via `ADMIN_PASSWORD`)* | Access via direct URL `/myadmin` |

---

## 📂 Project Structure

```
Yuva-Attire/
├── client/                      # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/AuthModal.jsx
│   │   │   ├── cart/CartDrawer.jsx
│   │   │   └── common/Header.jsx, Footer.jsx, Logo.jsx, ProductCard.jsx, QuickViewModal.jsx, RazorpayModal.jsx
│   │   ├── context/AuthContext.jsx, CartContext.jsx, WishlistContext.jsx
│   │   ├── pages/
│   │   │   ├── admin/AdminDashboardPage.jsx
│   │   │   ├── HomePage.jsx, ShopPage.jsx, ProductDetailPage.jsx, CheckoutPage.jsx
│   │   │   ├── OrderSuccessPage.jsx, WishlistPage.jsx, VipClubPage.jsx, UserProfilePage.jsx
│   │   ├── App.jsx & main.jsx
│   ├── index.html, vite.config.js, tailwind.config.js
├── server/                      # Node.js + Express REST API Backend
│   ├── data/database.json       # Persistent Database Store
│   ├── middleware/auth.js       # JWT & Admin Verification Middleware
│   ├── routes/
│   │   ├── admin.js             # Dashboard Analytics KPIs
│   │   ├── auth.js              # Register, Login, Profile & Address
│   │   ├── coupons.js           # Coupon Codes & Validation
│   │   ├── orders.js            # Order Placement & Auto-Inventory Deduction
│   │   ├── payments.js          # Razorpay Order Creation & Verification
│   │   ├── products.js          # Product Catalog, CRUD & Inventory
│   │   ├── vip.js               # VIP Club Membership Subscription
│   │   └── wishlist.js          # Shortlist / Wishlist Persistence
│   ├── db.js                    # Database Operations
│   ├── index.js                 # Express Application Entry
│   └── seedData.js              # Initial Kids Catalog
├── test_e2e.js                  # Automated 12-Step End-to-End Test Suite
├── Dockerfile                   # Production Container Image
├── render.yaml                  # 1-Click Render Cloud Deployment Blueprint
├── .env.example                 # Environment Variables Template
└── package.json
```

---

## 🌐 Online Deployment Guide

You can deploy Yuva Attire to production using any of the following approaches:

### 🌟 Option 1: 1-Click Deployment on Render (Easiest & Recommended)
The Node.js server automatically builds and serves the React frontend along with the REST API.

1. **Push your code to GitHub / GitLab**.
2. Go to [Render.com](https://render.com/) and click **New + > Web Service**.
3. Connect your Git repository.
4. Configure the settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add **Environment Variables** in Render Dashboard:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: *(A random 32+ character string)*
   - `RAZORPAY_KEY_ID`: *(Your live or test Razorpay Key ID from [Razorpay Dashboard](https://dashboard.razorpay.com/))*
   - `RAZORPAY_KEY_SECRET`: *(Your Razorpay Key Secret)*
6. Click **Deploy Web Service**. Your store will be live on `https://your-app-name.onrender.com`.

---

### 🚂 Option 2: Deploy on Railway
1. Go to [Railway.app](https://railway.app/) and create a **New Project > Deploy from GitHub Repo**.
2. Railway will automatically detect Node.js and run `npm run build` and `npm start`.
3. In **Variables**, add:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `your_random_secret_key`
   - `RAZORPAY_KEY_ID`: `your_key_id`
   - `RAZORPAY_KEY_SECRET`: `your_key_secret`
4. In **Settings > Networking**, click **Generate Domain** to get a public URL.

---

### 🐳 Option 3: Deploy with Docker (AWS EC2 / DigitalOcean / VPS)
A multi-stage [`Dockerfile`](Dockerfile:1) is included in the project.

```bash
# 1. Build the Docker container
docker build -t yuva-attire .

# 2. Run the container
docker run -d \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET="your_production_jwt_secret" \
  -e RAZORPAY_KEY_ID="rzp_live_your_key_id" \
  -e RAZORPAY_KEY_SECRET="your_razorpay_secret" \
  --name yuva-attire-app \
  yuva-attire
```

---

### ⚡ Option 4: Split Deployment (Vercel Frontend + Render/Railway API)
If you prefer hosting the React frontend on **Vercel** and the Node API on a separate server:

1. **Deploy Backend**: Deploy the `/server` to Render or Railway and note your backend URL (e.g., `https://api.yuvaattire.com`).
2. **Deploy Frontend**:
   - Go to [Vercel.com](https://vercel.com/) and import the repository.
   - Set **Root Directory** to `client`.
   - In `client/vite.config.js` or `.env`, point API requests to your deployed backend URL.
