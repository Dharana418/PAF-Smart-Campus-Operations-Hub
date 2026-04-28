# PAF-Smart-Campus-Operations-Hub

Advanced implementation of the Smart Campus Operations Hub, featuring a modernized frontend-first architecture.

## Project Structure

This repository is organized into a frontend-first monorepo structure:

- **Root (`/`)**: React + Vite frontend application.
- **`backend/`**: Consolidated backend services and modules.
  - `backend/core-api`: Primary Spring Boot backend (Auth, Security, Notifications).
  - `backend/facilities-catalogue`: Resource and facilities management module.
  - `backend/role-management`: OAuth integration and role assignment logic.

## Key Features

- **Google OAuth2 Integration**: Secure institutional login.
- **Role-Based Access Control**: Strict permissions for `ADMIN`, `STAFF`, and `STUDENT`.
- **Notification Engine**: Real-time broadcast and targeted operational alerts.
- **Modern UI**: Premium, high-contrast dashboard using Tailwind CSS and Lucide icons.

## Running the Project

### 1. Backend Services
Navigate to the role-management backend module and run with Maven:

```powershell
cd backend/role-management
./mvnw spring-boot:run
```
*Default URL: `http://localhost:8081`*

### 2. Frontend Application
Install dependencies and start the Vite dev server from the root directory:

```powershell
npm install
npm run dev
```
*Default URL: `http://localhost:5173`*

## Environment Configuration

### Backend OAuth Setup
Update `backend/role-management/src/main/resources/application.properties` with your Google credentials:
- `spring.security.oauth2.client.registration.google.client-id`
- `spring.security.oauth2.client.registration.google.client-secret`

Google Console settings for this backend:
- Authorized JavaScript origins: `http://localhost:5173` and `http://localhost:8081`
- Authorized redirect URIs: `http://localhost:8081/login/oauth2/code/google`

Optional local redirect for browser-based testing:
- `http://127.0.0.1:8081/login/oauth2/code/google`

### Frontend Environment
Optional configuration in a root `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_OAUTH_ENTRY_URL=http://localhost:8081/oauth2/authorization/google
```

