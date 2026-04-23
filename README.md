# PAF-Smart-Campus-Operations-Hub

Advanced implementation added for:
- Google OAuth2 login integration
- Role-based authorization (ADMIN, STAFF, STUDENT)
- Notifications management APIs and UI
- Spring Boot backend + React frontend integration

## Project Modules

- `booking-system`: Spring Boot backend with Security, OAuth2, JWT, Role Management, Notifications
- `smart-campus-frontend`: React + Vite frontend for login, notifications, and role admin panel

## Backend Features (`booking-system`)

- OAuth2 login via Google at `/oauth2/authorization/google`
- OAuth success handler generates JWT and redirects to frontend callback
- JWT-protected REST APIs
- Role-based API access:
	- `ROLE_ADMIN`: full access including role management
	- `ROLE_STAFF`: create notifications
	- `ROLE_STUDENT`: read notifications
- Seeded users:
	- `admin@smartcampus.com` (`ROLE_ADMIN`)
	- `staff@smartcampus.com` (`ROLE_STAFF`)

### Main API Endpoints

- `GET /api/me` - current authenticated user profile
- `GET /api/notifications` - list current user notifications + unread count
- `POST /api/notifications` - create notification (ADMIN or STAFF)
- `PATCH /api/notifications/{notificationId}/read?read=true|false` - mark notification read/unread
- `GET /api/admin/users` - list users (ADMIN only)
- `PATCH /api/admin/users/{email}/role` - update user role (ADMIN only)

## Google OAuth Setup

Update `booking-system/src/main/resources/application.properties`:

- `spring.security.oauth2.client.registration.google.client-id`
- `spring.security.oauth2.client.registration.google.client-secret`

In Google Cloud Console, add authorized redirect URI:

- `http://localhost:8080/login/oauth2/code/google`

## Run Backend

```powershell
cd booking-system
./mvnw.cmd spring-boot:run
```

Backend default URL: `http://localhost:8080`

## Run Frontend

```powershell
cd smart-campus-frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Frontend Environment (Optional)

You can override defaults by creating `.env` in `smart-campus-frontend`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_OAUTH_ENTRY_URL=http://localhost:8080/oauth2/authorization/google
```
