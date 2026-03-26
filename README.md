# ⚖️ LexFirma — A Complete Lawyer & Law Firm Website

A full-stack MERN web platform for connecting clients with lawyers, featuring real-time chat, video meetings, case management, and an admin dashboard.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB Atlas (Mongoose) |
| Real-time | Socket.io |
| Auth | JWT |
| Styling | Vanilla CSS (custom design system) |

---

## ✨ Features

- **Authentication** — Register/Login for Users, Lawyers, and Admins
- **Lawyer Listings** — Browse, filter, and view lawyer profiles by specialization
- **Real-Time Chat** — Socket.io based chat between clients and lawyers, persisted in MongoDB
- **Video Meetings** — Schedule and join video consultations
- **Case Management** — Lawyers can add, track, and publish cases
- **Contact System** — Clients can send contact form messages to lawyers
- **Admin Dashboard** — Manage users, lawyers, meetings, and platform activity
- **Legal News Feed** — Aggregated legal news (requires NewsAPI key)
- **AI Chatbot** — Rule-based legal assistant widget

---

## 📁 Project Structure

```
lawFirmWebsite/
├── backend/          # Express + TypeScript API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── index.ts  # Server + Socket.io entry
│   └── .env.example
└── frontend/         # React + Vite app
    └── src/
        ├── pages/
        ├── components/
        ├── context/
        └── services/
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account

### 1. Clone the repo
```bash
git clone https://github.com/ShubhamKumar6299/lexFirma-aCompleteLawerWebsite.git
cd lexFirma-aCompleteLawerWebsite
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see below)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Create frontend/.env
echo "VITE_API_URL=http://localhost:5001/api" > .env
npm run dev
```

---

## 🔑 Environment Variables

### `backend/.env`
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/lawfirm
JWT_SECRET=your_jwt_secret
PORT=5001
CLIENT_URL=http://localhost:5173
NEWS_API_KEY=your_newsapi_key         # optional
EMAIL_USER=your_email@gmail.com       # optional, for email features
EMAIL_PASS=your_app_password          # optional
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:5001/api
```

---

## 🌱 Seed Data

To populate the database with test users, lawyers, and cases:
```bash
cd backend
npx ts-node src/seed.ts
```

**Test Credentials:**

| Role | Email | Password |
|------|-------|----------|
| Admin | `dsashubham321@gmail.com` | `Admin@123` |
| Lawyer | `satyaanandsharma9534@gmail.com` | `Lawyer@123` |
| Client | `ashutosh887789@gmail.com` | `User@123` |

---

## 📡 API Overview

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Register, Login |
| `/api/lawyers` | Lawyer profiles and listings |
| `/api/cases` | Case management |
| `/api/chat` | Chat history and room management |
| `/api/meetings` | Schedule and manage meetings |
| `/api/messages` | Contact form inbox |
| `/api/admin` | Admin-only operations |

---

## 🔌 Real-Time Events (Socket.io)

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_room` | Client → Server | Join a chat room |
| `send_message` | Client → Server | Send a message (saved to DB) |
| `receive_message` | Server → Client | Broadcast message to room |

---

## 👤 Author

Built by [Shubham Kumar](https://github.com/ShubhamKumar6299)

---

## 📄 License

MIT
