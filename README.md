
# 📞 VOXTREAM — Real-Time Chat, Audio & Video Calling App

A full-stack real-time communication web app built using **React + Vite**, **Node.js**, **Socket.IO**, **WebRTC**, and **MongoDB**. Users can create accounts, manage friendships, and communicate via chat, audio, and video calls. The system uses secure HTTP-only JWT authentication and scalable socket architecture with STUN/TURN support.

---

## 🚀 Features

### 🔐 Authentication
- Secure JWT-based login/signup
- HTTP-only cookies for access token
- Onboarding with full name, location, bio, hobbies

### 👥 Friends & Requests
- Send, accept, reject, cancel friend requests
- Bi-directional friendship logic
- Smart recommendations (users not friends and no pending requests)

### 💬 Real-Time Chat
- Socket.IO powered direct messaging
- In-memory chat delivery
- Chat history via backend API

### 📹 Audio/Video Calling
- Peer-to-peer connections using WebRTC
- STUN (Google, Twilio) support
- Call request/response/leave events over socket
- Remote stream management

### 🌐 Tech Stack
- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Express.js, MongoDB, Mongoose
- **Sockets:** Socket.IO with full event handler separation
- **WebRTC:** RTCPeerConnection with free STUN servers

---

## 🗂️ Project Structure

### Backend
```

/backend
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── friend.controller.js
│   └── chat.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── friend.routes.js
│   └── chat.routes.js
├── sockets/
│   ├── chatHandler.js
│   ├── callHandler.js
│   └── connectionHandler.js
├── models/
│   ├── userModel.js
│   └── friendRequestModel.js
├── middlewares/
│   └── auth.middleware.js
├── index.js
└── .env

```

### Frontend
```

/frontend
├── src/
│   ├── api/
│   ├── sockets/
│   ├── contexts/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx

````

---

## 🧪 Testing Plan

| Area | Method |
|------|--------|
| Auth | Register, login, logout with cookie inspection |
| Friend System | Test request flows: send, accept, reject, delete |
| Chat | Send messages and verify delivery in real-time |
| Call | Simulate audio/video call with multiple tabs/devices |
| Socket | Observe console logs for each socket event |

---

## 🖼️ Screenshots

> ⚠️ Add screenshots here after running the app. Suggested images:
- Signup/Login page
- Home dashboard with friends & requests
- Chat window
- Ongoing video call
- Socket logs in browser devtools

---

## ⚙️ How to Run

### 1. Clone the Repo
```bash
git clone https://github.com/shivammiyyy/VOXTREAM.git
cd VOXTREAM
````

### 2. Setup Environment Variables

Create `.env` in `/backend`:

```
PORT=5000
CLIENT_URL=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/connecthub
JWT_SECRET_KEY=your_jwt_secret
```

Create `.env` in `/frontend`:

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Install & Run

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 WebRTC Configuration

Uses public STUN servers:

```js
iceServers: [
  { urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"] }
]
```

TURN server support can be added for NAT traversal (optional).

---

## 📁 Notes

* Friend logic uses symmetrical arrays in both user docs.
* Chat messages are stored in-memory (not persisted).
* Socket handlers are modular and track:

  * Room creation/join/leave
  * Signal data
  * Call events
  * Notification events

---

## 🖼️ Screenshots

### 🔐 Signup Page
![Signup Page](./screenshots/signup.png)

### 🔑 Login Page
![Login Page](./ScreenShots/Screenshot%202025-07-29%20175654.png)

### 🏠 Dashboard / Home
![Dashboard](./screenshots/dashboard.png)

### 💬 Chat Page
![Chat Page](./screenshots/chat.png)

### 📞 Call Request Popup
![Call Request](./screenshots/call%20request.png)

### 🎥 Video Call Page
![Call Page](./screenshots/calling.png)

---

## 📧 Contact

Built by Shivammiyy.


