# Aura Backend

This is the Node.js/Express backend for Aura, your mental health diary app. It uses MongoDB for data storage and provides APIs for authentication, diary entries, and user data.

## Features
- User authentication (register/login)
- CRUD APIs for diary entries
- User profile APIs
- JWT-based authentication

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your `.env` file (see `.env` for example values).
3. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and get JWT
- `GET /api/user` — Get user profile (auth required)
- `PUT /api/user` — Update user profile (auth required)
- `POST /api/diary` — Create diary entry (auth required)
- `GET /api/diary` — Get all diary entries (auth required)
- `GET /api/diary/:id` — Get single diary entry (auth required)
- `PUT /api/diary/:id` — Update diary entry (auth required)
- `DELETE /api/diary/:id` — Delete diary entry (auth required)

## Folder Structure
- `src/models` — Mongoose models
- `src/controllers` — Route controllers
- `src/routes` — Express routes
- `src/middleware` — Middleware (auth)
- `src/server.js` — Entry point

## Integration
Connect your React/Vite frontend to these endpoints for authentication, diary management, and user data.
