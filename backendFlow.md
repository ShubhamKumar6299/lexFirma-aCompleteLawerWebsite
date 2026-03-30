# 🏗️ LexFirma — Backend Architecture & Flow

---

## Step 1: Entry Point — `src/index.ts`

Everything boots from here:

1. `dotenv.config()` — loads `.env` variables into `process.env`
2. `connectDB()` — connects to MongoDB Atlas
3. An Express app is created and wrapped in a `http.Server`
4. **Socket.io** is mounted on the same HTTP server (shares port 5001 with REST API)
5. All REST routes are registered under `/api/*`
6. A cron job runs `refreshNews()` every 6 hours

---

## Step 2: Data Models — `src/models/`

Built first. They define the **shape of every document** stored in MongoDB via Mongoose schemas.

| Model | What it stores |
|-------|---------------|
| `User.ts` | Every person — `role: 'user' \| 'lawyer' \| 'admin'`, hashed password |
| `Lawyer.ts` | Lawyer profile — references `User` via `userId` (separate doc) |
| `Case.ts` | Legal cases — belongs to a `Lawyer` |
| `Meeting.ts` | Scheduled meetings between a client and a lawyer |
| `Message.ts` | Contact form messages (lawyer inbox) |
| `ChatMessage.ts` | Real-time socket messages, persisted per `roomId` |
| `Review.ts` | Client reviews for lawyers |
| `News.ts` | Cached legal news articles |

> **Key design decision:** `Lawyer` is a **separate document** from `User`.
> A lawyer has both a `User` doc (for auth/login) and a `Lawyer` doc (for profile info).
> They are linked by `userId`. This keeps auth logic clean and independent.

---

## Step 3: Middleware — `src/middleware/`

### `auth.ts` — JWT Guard
Every protected route runs through `protect` first:
```
Request comes in
  → Extract "Bearer <token>" from Authorization header
  → Verify token with JWT_SECRET
  → Find user in DB from token payload
  → Attach user to req.user
  → Call next() to proceed to the controller
```
Additional guards:
- `isAdmin` — blocks non-admins
- `isLawyer` — blocks non-lawyers

### `errorHandler.ts` — Global Error Handler
All controllers call `next(err)` on failure.
This middleware catches it and returns a clean JSON error response instead of crashing.

---

## Step 4: Controllers — `src/controllers/`

Pure business logic. Each function:
1. Reads `req.params`, `req.body`, or `req.user`
2. Queries or mutates the DB via Mongoose
3. Sends a JSON response or calls `next(err)`

### Auth Flow (`authController.ts`)
```
POST /api/auth/register
  → Validate input
  → Check if email already exists
  → Hash password with bcrypt
  → Save new User to DB
  → Sign JWT with user._id
  → Return token + user info

POST /api/auth/login
  → Find User by email
  → Compare submitted password with bcrypt hash
  → Sign JWT
  → Return token + user info
```

### Lawyer Flow (`lawyerController.ts`)
```
Register as Lawyer
  → Create User (role: 'lawyer')
  → Create linked Lawyer profile doc (specialization, experience, etc.)

GET /api/lawyers
  → Populate userId to get name & email
  → Apply query filters (specialization, location, name search)
  → Return paginated list
```

### Chat Flow (`chatRoomController.ts`)
```
GET /api/chat/:lawyerId/history
  → Build roomId = "room_" + [userId, lawyerId].sort().join("_")
  → Fetch all ChatMessage docs matching this roomId
  → Return messages + roomId to frontend

GET /api/chat/rooms  (lawyer only)
  → Find the Lawyer doc for the logged-in user
  → Aggregate ChatMessages: group by roomId, get last message & count
  → For each room: extract the other participant's userId from the roomId string
  → Look up that userId in the User model to get their name & email
  → Return enriched room list (used in Lawyer Dashboard → Chats tab)

GET /api/chat/room/:roomId/history
  → Fetch all ChatMessages for a raw roomId
  → Used by lawyers opening a conversation from their dashboard
```

> **Why sorted IDs for roomId?**
> `[userId, lawyerId].sort()` produces the same string regardless of who initiates the chat.
> So both the client and lawyer always compute the exact same room ID — no duplicates.

---

## Step 5: Real-Time Layer — Socket.io in `index.ts`

Runs **alongside** REST on the same port. Not a REST endpoint — it's a persistent WebSocket connection.

```
Client opens chat page
  → Connects to WebSocket at ws://localhost:5001
  → Emits 'join_room' with the roomId
  → Server does socket.join(roomId)

Client sends a message
  → Emits 'send_message' with { roomId, senderId, senderName, senderRole, content }

Server receives 'send_message'
  → Calls ChatMessage.create(data)   ← saved to MongoDB permanently
  → Calls io.to(roomId).emit('receive_message', savedMessage)
  → Both the sender AND the receiver (in the same room) get the message
```

> **Why broadcast to the whole room including sender?**
> The sender's optimistic message (shown immediately in UI) gets replaced by the
> server-confirmed version (with `_id` and `createdAt` from DB), via deduplication logic.

---

## Step 6: Routes — `src/routes/`

Thin wiring layer. Maps HTTP verbs + paths → middleware → controller.

```
POST   /api/auth/register        → public
POST   /api/auth/login           → public

GET    /api/lawyers              → public
GET    /api/lawyers/:id          → public
POST   /api/lawyers/register     → protect

GET    /api/cases                → public
POST   /api/cases                → protect + isLawyer

GET    /api/chat/rooms           → protect (lawyer fetches their chat list)
GET    /api/chat/room/:id/history → protect
GET    /api/chat/:lawyerId/history → protect

POST   /api/meetings             → protect
GET    /api/meetings             → protect

POST   /api/messages             → protect (contact form)
GET    /api/messages/inbox       → protect (lawyer reads inbox)

GET    /api/admin/*              → protect + isAdmin
```

---

## Step 7: Seed Script — `src/seed.ts`

One-shot script to populate the DB with test data.

```bash
npx ts-node src/seed.ts
```

Creates:
- 3 client users, 2 lawyer users, 1 admin user
- Linked Lawyer profile docs for each lawyer user
- Sample cases for each lawyer

---

## Full Request Lifecycle

### REST Request
```
Browser / Postman
  → HTTP Request
  → Express Router
  → protect() middleware (JWT check)
  → Controller function
  → Mongoose Model
  → MongoDB Atlas
  → JSON Response back
```

### Real-Time Chat Message
```
Browser (Socket.io client)
  → emit('send_message', data)
  → Socket.io Server (index.ts)
      ├─→ ChatMessage.create()  → MongoDB Atlas  [persist]
      └─→ io.to(roomId).emit('receive_message')  → All clients in room  [broadcast]
```

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────┐
│                  Frontend (React)                │
│   REST calls via axios          Socket.io client │
└───────────┬────────────────────────────┬─────────┘
            │ HTTP                       │ WebSocket
            ▼                            ▼
┌──────────────────────────────────────────────────┐
│          Backend (Node.js + Express)             │
│                                                  │
│  ┌─────────────┐     ┌──────────────────────┐   │
│  │ REST Routes │     │  Socket.io Server    │   │
│  │ /api/*      │     │  send_message event  │   │
│  └──────┬──────┘     └──────────┬───────────┘   │
│         │                       │                │
│  ┌──────▼──────────────────────▼───────────┐    │
│  │           Mongoose Models               │    │
│  └──────────────────┬────────────────────  ┘    │
└─────────────────────┼────────────────────────────┘
                      │
                      ▼
            ┌──────────────────┐
            │  MongoDB Atlas   │
            └──────────────────┘
```
