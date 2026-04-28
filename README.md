# PAF Smart Campus Operations Hub

Central repository for the Smart Campus Operations Hub: a Spring Boot backend (booking-system / role-management) and a React + Vite frontend (smart-campus-frontend).

## Overview

- Modern authentication via Google OAuth2.
- Role-based access control (ADMIN, STAFF, STUDENT).
- Notifications engine with REST APIs and UI management pages.
- Frontend built with React + Vite and Tailwind CSS.

Design & ownership:

- Role management, notifications, and auth management: Dharana Thilakarathna
- Facility catalog and resource management: Pathmi Thotawatta
- Booking and conflict checking: Abdhullah
- Ticketing, technician updates, and attachments: Hiran Mendis

## Repository Layout

- `backend/role-management` — Spring Boot module (artifact: `booking-system`).
- `Frontend` — React + Vite frontend application.

## Quick Start (Development)

Prerequisites:

- Java 17+ and Git (backend)
- Node.js 18+ and npm (frontend)

Start the backend (role-management module):

Windows (PowerShell/CMD):

```powershell
cd backend/role-management
.\mvnw.cmd spring-boot:run
```

macOS/Linux:

```bash
cd backend/role-management
./mvnw spring-boot:run
```

Backend default URL: http://localhost:8081

Start the frontend:

```bash
cd Frontend
npm install
npm run dev
```

Frontend default URL: http://localhost:5173

## Build for Production

Backend (package):

```bash
cd backend/role-management
./mvnw clean package
```

Frontend (build):

```bash
cd Frontend
npm run build
```

## Configuration

The backend module exposes configuration in `backend/role-management/src/main/resources/application.properties` (example keys):

- `server.port` — defaults to `8081` for the role-management module.
- `spring.security.oauth2.client.registration.google.client-id`
- `spring.security.oauth2.client.registration.google.client-secret`
- `app.security.jwt.secret` — JWT signing secret (set a secure value in production).
- `spring.data.mongodb.uri` — MongoDB connection string.

Frontend runtime can be configured via environment variables (create a `.env` in `Frontend`):

- `VITE_API_BASE_URL` — e.g. `http://localhost:8081/api`
- `VITE_OAUTH_ENTRY_URL` — e.g. `http://localhost:8081/oauth2/authorization/google`

## Important Notes

- The role-management backend is configured to run on port `8081` by default to avoid conflicts with other local services.
- Ensure Google OAuth credentials and redirect URIs are configured in Google Cloud Console to match the backend and frontend URLs.

## Features & API Endpoints (high level)

- `GET /api/me` — current authenticated user profile
- `GET /api/notifications` — list notifications for the current user
- `POST /api/notifications` — create notification (ADMIN or STAFF)
- `PATCH /api/notifications/{id}/read` — mark notification read/unread
- `GET /api/admin/users` — list users (ADMIN only)

## Where to look next

- Backend source: `backend/role-management/src/main/java` and resources.
- Frontend source: `Frontend/src`.

If you want, I can run the project locally or update the README with screenshots or API examples.

## Credits & API endpoints by owner

The following mapping is extracted from the backend controllers (backend/role-management/src/main/java/com/smartcampus/booking_system/controller) and shows which endpoints are owned by which team member.

Dharana Thilakarathna — Role management, Notifications, Auth

- Auth endpoints (AuthController):
	- `GET /api/me`
	- `POST /api/public/login`
	- `POST /api/public/admin/login`

- Notifications endpoints (NotificationController):
	- `GET /api/notifications`
	- `GET /api/notifications/sent`
	- `POST /api/notifications`
	- `PATCH /api/notifications/{notificationId}/read`
	- `PUT /api/notifications/{id}`
	- `DELETE /api/notifications/{id}`

- Admin / Role management endpoints (AdminController):
	- `GET /api/admin/users`
	- `POST /api/admin/users`
	- `PATCH /api/admin/users/{email}/role`
	- `DELETE /api/admin/users/{email}`
	- `PUT /api/admin/users/{email}`

Pathmi Thotawatta — Facility catalog & Resource management

- Resource endpoints (ResourceController):
	- `GET /api/resources` (supports query params: `type`, `location`, `minCapacity`)
	- `GET /api/resources/{id}`
	- `POST /api/resources` (ADMIN)
	- `PUT /api/resources/{id}` (ADMIN)
	- `DELETE /api/resources/{id}` (ADMIN)

Abdhullah — Booking & conflict checking

- Booking endpoints (BookingController):
	- `GET /api/bookings` (ADMIN)
	- `GET /api/bookings/my`
	- `POST /api/bookings` (request booking)
	- `PATCH /api/bookings/{id}/status` (ADMIN)
	- `POST /api/bookings/{id}/cancel`
	- `DELETE /api/bookings/{id}`

Hiran Mendis — Ticketing, technician updates, attachments

- Ticket endpoints (IncidentTicketController):
	- `GET /api/tickets` (ADMIN, TECHNICIAN, STAFF)
	- `GET /api/tickets/my`
	- `POST /api/tickets` (multipart/form-data — create with attachments)
	- `PATCH /api/tickets/{id}`
	- `DELETE /api/tickets/{id}`
	- `GET /api/tickets/attachments/{filename}`
	- `PATCH /api/tickets/{id}/status` (ADMIN, TECHNICIAN)
	- `PATCH /api/tickets/{id}/assign` (ADMIN)
	- `POST /api/tickets/{id}/comments`

If you'd like, I can also add short example requests for each group or generate an OpenAPI spec from these controllers.
