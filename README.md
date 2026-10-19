# System Integration Remediation App

A secure full-stack web app built with Next.js for the frontend and Laravel for the backend. It contains protected dashboard access, registration/login, password-reset, and MFA support. This project is designed to meet the remediation requirements for a system integration assignment.

## Features

- Next.js frontend with a responsive dashboard UI
- Laravel REST API with protected routes and Bearer token authentication
- SQLite database for local development and migrations
- User registration and secure login
- Password reset flow with time-limited tokens
- MFA using TOTP and QR-based authenticator enrollment
- Integrated map and weather UI with graceful fallback handling
- Safe environment-variable patterns for local and production deployment

## System Architecture

```text
+------------------+        HTTP/JSON        +-------------------+
| Next.js frontend | ----------------------> | Laravel API       |
| Vercel deploy    |                         | Render / PHP host |
+------------------+                         +-------------------+
                                                   |
                                                   v
                                           +-------------------+
                                           | SQLite / Supabase |
                                           | DB                |
                                           +-------------------+
                                                   |
                                                   v
                                           +-------------------+
                                           | Maps / Weather    |
                                           | External APIs     |
                                           +-------------------+
```

## Stack

- Frontend: Next.js, React, TypeScript
- Backend: PHP Laravel 13, Sanctum, Google2FA
- Database: SQLite for local development (compatible with standard Laravel migrations)
- External APIs: OpenStreetMap fallback + OpenWeatherMap API when a key is present

## Repository Structure

```text
SYSTEM INTERGRATIONN/
├── backend/                  # Laravel API
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── public/
│   ├── .env.example
│   └── composer.json
├── frontend/                 # Next.js app
│   ├── src/
│   ├── public/
│   ├── .env.example
│   └── package.json
├── .gitignore
├── README.md
└── .env.example            # root-level placeholders only
```

## Local Setup

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Install backend dependencies

```bash
cd ../backend
composer install
```

### 3. Configure environment files

Copy the example files before running the project.

```bash
cd frontend
copy .env.example .env.local

cd ../backend
copy .env.example .env
```

Update the environment variables as needed.

### 4. Create the database and run migrations

```bash
cd backend
php artisan migrate
```

### 5. Start the backend API

```bash
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```

### 6. Start the frontend

```bash
cd frontend
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Then open:

- Frontend: http://127.0.0.1:3000
- API: http://127.0.0.1:8000/api

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_MAPS_API_KEY=
NEXT_PUBLIC_WEATHER_API_KEY=
```

### Backend (.env)

```env
APP_NAME="System Integration App"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=
DB_CONNECTION=sqlite
DB_DATABASE="database/database.sqlite"
```

Do not commit real production credentials or secret keys. Keep only placeholders in documentation and example files.

## Database Setup

The project uses Laravel migrations to create the required tables. The default database is SQLite for local development, which is suitable for demonstration and testing. For production, the same migrations can be applied to Supabase or another approved provider by updating the DB settings in the Laravel environment file.

## API Endpoints

### Authentication

- POST /api/register
- POST /api/login
- POST /api/logout
- GET /api/me

### Password Reset

- POST /api/forgot-password
- POST /api/reset-password

### MFA

- POST /api/mfa/setup
- POST /api/mfa/verify

### Dashboard

- GET /api/dashboard

### Sample request

```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'
```

Sample response:

```json
{
  "message": "Login successful.",
  "token": "2|token-here",
  "user": {
    "id": 1,
    "name": "Demo User",
    "email": "demo@example.com"
  }
}
```

## Authentication and Security Notes

- Passwords are hashed with Laravel's Hash facade.
- Protected dashboard routes require a valid Bearer token.
- API requests are rate-limited for login and reset flows.
- MFA uses TOTP via Google2FA and QR code enrollment.
- Reset tokens are hashed before storage and expire after a short time window.
- CORS is configured for localhost and Vercel-style frontend origins.
- Production secrets should live in hosting environment variables, not in browser code.

## Password Reset and MFA Flow

1. User submits email on the frontend forgot-password page.
2. API generates a secure reset token and returns a reset link.
3. User enters a new password and confirmation on the reset-password page.
4. Laravel validates the token and updates the account password.
5. MFA enrollment generates a secret and QR code.
6. User scans the QR code in an authenticator app and verifies the generated TOTP code.

## Deployment Notes

### Frontend (Vercel)

- Import the Next.js project to Vercel.
- Set the project root to `frontend/`.
- Add environment variables in Vercel under Project Settings.
- Use the deployed Laravel API URL for `NEXT_PUBLIC_API_URL`.

### Backend (Render / Laravel-compatible host)

- Deploy the `backend/` folder to a PHP-compatible hosting provider.
- Set production environment variables for the database, app key, and frontend URL.
- Update CORS and API base URL values for the live environment.

## GitHub and Documentation Requirements

- Repository URL: Add your GitHub repository URL here after pushing the project.
- Live Vercel URL: Add your deployed Vercel URL here after deployment.
- Backend API URL: Add your production API URL here after deployment.

## Known Limitations

- The local implementation uses SQLite for development convenience.
- Real external map and weather keys should be added in production for live API use.
- A production-ready mail provider should be configured if the reset flow is moved beyond local demo mode.

## Author and Notes

This project is intended for educational remediation and local demonstration. It can be expanded into a production-grade deployment by adding a real email provider, a hosted database, and configured cloud credentials.
