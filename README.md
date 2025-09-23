# Sonic Chat Hub

A full‑stack, real‑time chat application with one‑to‑one and group conversations, rich media sharing (images/videos), read receipts, online presence, message and chat deletion, and group admin controls (add/remove members, rename group). The system is split into services and modern React frontends, with production‑ready features and AWS EC2 deployment guidance.


## Features

- Authentication
  - OTP-based login flow (request OTP, verify OTP)
  - JWT persisted in localStorage
  - User profile update (name, avatar)
- Chat
  - One-to-one chats and group chats
  - Real-time messaging via Socket.IO
  - Media messages (image/video) with S3 storage
  - Read receipts (single/double ticks)
  - Online/Offline presence
  - Delete messages (sender or group admin)
  - Delete chats (participants or group admin)
  - Group admin tools: add/remove members, rename group
  - Typing indicator ready (socket room architecture in place)
- UI/UX
  - Modern React (Vite) + Tailwind + shadcn/ui
  - Responsive layout: sidebar + chat panel
  - Profile dialog, create chat/group dialogs, group info dialog with member list


## Tech Stack

- Frontend
  - React 18 (Vite)
  - TypeScript
  - Tailwind CSS + shadcn/ui
  - Socket.IO client
- Backend (chatService)
  - Node.js + Express + TypeScript
  - MongoDB + Mongoose
  - Socket.IO server (real-time messaging and presence)
  - Multer S3 storage (AWS S3 for media)
- Backend (userService)
  - Node.js + Express + TypeScript
  - MongoDB + Mongoose
  - (Includes OTP endpoints and profile update)
- Optional service
  - emailService (RabbitMQ, etc.)
- Infra/DevOps
  - AWS S3 (media)
  - AWS EC2 (deployment)
  - Nginx (reverse proxy)
  - PM2 (process manager)


## Repository structure

- backend/
  - chatService/
    - src/
      - config/ (db, env, http, s3, socket, multer)
      - controllers/ (chat.controller.ts)
      - middleware/ (auth, async handler)
      - models/ (chat.model.ts, message.model.ts)
      - routes/ (chat.route.ts)
      - index.ts
  - userService/
    - src/
      - controller/ (user.controller.ts)
      - routes/ (user.route.ts)
      - middleware/, models/, config/
    - index.ts
  - emailService/ (optional)
- frontend/ (UI option A)
- sonic-chat-hub/ (UI option B, main updated frontend)
  - src/
    - components/ (ChatPanel, Sidebar, MessageBubble, MessageInput, etc.)
    - contexts/ (AuthContext, ChatContext)
    - services/ (userService.ts)
    - types/ (chat.ts)
    - pages/, hooks/, lib/


## Environment variables

Each service has its own env configuration. The following are the important ones:

chatService
- MONGODB_URI: MongoDB connection string
- PORT: default 5002
- USER_SERVICE_URL: URL to userService (e.g. http://localhost:5000)
- AWS_S3_BUCKET_NAME: S3 bucket for media
- AWS_ACCESS_KEY_ID: AWS access key
- AWS_SECRET_ACCESS_KEY: AWS secret
- AWS_REGION: AWS region
- CORS_ORIGIN: e.g. http://localhost:5173 (frontend)

userService
- MONGODB_URI: MongoDB URI
- PORT: default 5000
- JWT_SECRET: Secret for signing tokens
- EMAIL_* and OTP settings if applicable

frontend(s)
- VITE_API_CHAT_URL: e.g. http://localhost:5002
- VITE_API_USER_URL: e.g. http://localhost:5000


## Local development

1) Start databases/services
- MongoDB running locally or via Docker
- AWS S3 credentials set in environment

2) Start userService
```
cd backend/userService
npm install
npm run dev
```

3) Start chatService
```
cd backend/chatService
npm install
npm run dev
```

4) Start frontend (sonic-chat-hub)
```
cd sonic-chat-hub
npm install
npm run dev
```
Open http://localhost:5173


## API Endpoints (chatService)
Base: /api/v1/chat

Chats
- POST /create
  - body: { otherUserId: string }
  - creates a direct chat or returns existing { chatId }
- POST /group
  - body: { name: string, members: string[] }
  - creates a group chat with current user as admin → { chatId }
- GET /all
  - returns list of chats (latestMessage, unseenCount, etc.)
- GET /:chatId
  - returns { messages, user } and marks incoming (others') unseen messages as seen; emits messagesSeen
- DELETE /:chatId
  - deletes chat (and media) if authorized

Messages
- POST /send
  - headers: Authorization
  - multipart/form-data: file (optional image/video), fields: chatId, text (optional)
  - returns { message, sender }
  - emits newMessage to chat room + recipients
- DELETE /msg/:msgId
  - delete message if sender or group admin; removes media if any

Group management
- POST /:chatId/members
  - body: { userId: string } - add member (admin only)
- DELETE /:chatId/members
  - body: { userId: string } - remove member (admin only)
- PATCH /:chatId/name
  - body: { name: string } - rename group (admin only)


## API Endpoints (userService)
Base: /api/v1

- POST /login
  - body: { email }
  - sends OTP
- POST /verify
  - body: { email, otp }
  - returns { token, user }
- PUT /update-profile
  - headers: Authorization (Bearer)
  - multipart/form-data: name (optional), profilePicture (optional)
  - returns { token?, user }
- GET /
  - returns all users (used by frontends for selection)
- GET /:id
  - returns a user by id (used by chatService for chat lists)


## Socket events

Connection
- Client connects to Socket.IO server with query { userId }
- Server emits
  - onlineUsers: string[] (initial presence list)
  - userStatus: { userId, isOnline } on connect/disconnect of any user

Rooms
- Client emits joinChat(chatId) when a chat is selected (and on reconnect)

Messaging
- Server emits newMessage(message) to chat room and recipients
- Server emits messagesSeen { chatId, seenBy, messageIds } when messages get marked as seen

Client handling (frontend)
- On newMessage → append to chat messages (dedup by id in reducer)
- On messagesSeen → update seen/seenAt in state to flip ticks
- On onlineUsers → initialize online set
- On userStatus → maintain online set in real-time


## Frontend key flows (sonic-chat-hub)

- AuthContext
  - Handles OTP login, token persistence, profile update
- ChatContext
  - Loads chats
  - Sets active chat and fetches messages
  - Real-time wiring to join rooms, handle newMessage, presence, read receipts
  - sendMessage, sendMedia
  - deleteMessage, deleteChat
  - Group admin: addUserToGroup, removeUserFromGroup, renameGroup
- ChatPanel
  - Header: name/avatar (direct) or group name + member count, admin crown if current user is admin
  - Info dialog: direct user details, or group members list with admin controls
  - Media upload buttons (image/video)
  - Delete chat confirmation dialog
  - Message list with read ticks and per-message delete


## Deployment on AWS EC2 (reference)

1) Provision EC2
- Ubuntu 22.04+, t3.small+ recommended
- Security Groups: allow 22 (SSH), 80/443 (HTTP/HTTPS). Lock down 5000/5002 to internal if proxied with Nginx.

2) Install dependencies
```
sudo apt update -y
sudo apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
```

3) Clone repo and build
```
cd /var/www
sudo git clone <your-repo-url> chat-application
cd chat-application
```
- Set environment variables for chatService and userService (create .env files or export)
- Build and start services with PM2
```
cd backend/userService
npm ci
npm run build
pm2 start dist/index.js --name user-service

cd ../../chatService
npm ci
npm run build
pm2 start dist/index.js --name chat-service

pm2 save
```

4) Frontend build & serve
- Option A: Build and serve statics via Nginx
```
cd /var/www/chat-application/sonic-chat-hub
npm ci
npm run build
# output in dist/
```
- Configure Nginx
```
sudo tee /etc/nginx/sites-available/chat.conf > /dev/null <<'NGX'
server {
  listen 80;
  server_name your-domain-or-ec2-public-dns;

  location /api-chat/ {
    proxy_pass http://127.0.0.1:5002/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }

  location /api-user/ {
    proxy_pass http://127.0.0.1:5000/;
    proxy_set_header Host $host;
  }

  location /socket.io/ {
    proxy_pass http://127.0.0.1:5002/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }

  root /var/www/chat-application/sonic-chat-hub/dist;
  index index.html;
  location / {
    try_files $uri /index.html;
  }
}
NGX

sudo ln -s /etc/nginx/sites-available/chat.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```
- Adjust your frontend env (Vite) to hit /api-chat and /api-user paths

5) SSL (optional but recommended)
- Attach a domain, use Certbot to provision TLS

6) Zero-downtime
- Use PM2 for process restarts and pm2 startup for boot persistence


## Notes
- Ensure CORS origin allows your frontend domain in chatService Socket.IO config
- Ensure S3 bucket policy allows PutObject and DeleteObject for your key
- Prefer reverse proxy paths (/api-chat, /api-user) to avoid CORS and to upgrade WebSocket connections through Nginx


## License
