# 🚀 SmartBiz — Small Business Digital Tool

A full-stack hackathon-ready MVP for small businesses. Replace manual operations with a clean SaaS dashboard.

## ✨ Features

| Feature | Status |
|--------|--------|
| 🔐 JWT Authentication (login/signup) | ✅ |
| 📊 Dashboard with sales charts | ✅ |
| 📦 Inventory CRUD + low stock alerts | ✅ |
| 🧾 Billing system + stock auto-reduction | ✅ |
| 📋 Order history with item breakdown | ✅ |
| 🤖 AI Assistant (OpenAI + smart fallback) | ✅ |
| 🎤 Voice input for AI | ✅ |
| 📱 Fully responsive (mobile + desktop) | ✅ |

---

## 🗂️ Folder Structure

```
smart-business-digital-tool/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Bill.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── billing.js
│   │   ├── dashboard.js
│   │   └── ai.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── seed.js
│   └── .env
└── frontend/
    └── src/
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── components/Layout.jsx
        └── pages/
            ├── Login.jsx
            ├── Signup.jsx
            ├── Dashboard.jsx
            ├── Inventory.jsx
            ├── Billing.jsx
            ├── History.jsx
            └── AIAssistant.jsx
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongod`)
- (Optional) OpenAI API Key

### 1. Backend Setup

```bash
cd backend
npm install
```

Configure `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart_business
JWT_SECRET=your_super_secret_jwt_key_here
OPENAI_API_KEY=sk-...    # Optional — fallback AI works without it
```

Seed demo data (optional):
```bash
node seed.js
```

Start backend:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open: **http://localhost:3000**

---

## 🧪 Demo Account

After running `node seed.js`:
- **Email:** demo@smartbiz.com
- **Password:** demo1234

Or use the **"Try Demo Account"** button on the login page.

---

## 🔌 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login + get JWT |
| GET | `/api/products` | List all products |
| POST | `/api/products` | Add product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/billing` | Create bill + reduce stock |
| GET | `/api/billing` | Get all bills |
| GET | `/api/dashboard` | Get dashboard stats |
| POST | `/api/ai/chat` | AI assistant chat |

---

## 🗃️ Database Schema

### User
```js
{ name, email, password (hashed), businessName }
```

### Product
```js
{ name, price, quantity, category, description, user (ref) }
```

### Bill
```js
{
  billNumber, customerName, paymentMethod, status,
  totalAmount, user (ref),
  items: [{ productName, price, quantity, subtotal }]
}
```

---

## 🤖 AI Assistant

- With OpenAI key → GPT-3.5 Turbo with full business context
- Without key → Smart rule-based fallback (still fully functional!)
- Voice input → Web Speech API (Chrome/Edge)

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite + Tailwind CSS v4 + Recharts + Lucide
- **Backend:** Node.js + Express + Mongoose
- **Database:** MongoDB
- **Auth:** JWT + bcrypt
- **AI:** OpenAI GPT-3.5 Turbo
