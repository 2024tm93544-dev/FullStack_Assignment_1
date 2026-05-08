# Smart Car Diagnosis Platform - README

## Project Overview
A full-stack web application for vehicle diagnostics that allows drivers to submit diagnostic trouble codes (DTC) and symptoms, receive recommendations, upload repair photos, and track repair status in real-time.

## Problem Statement
Vehicle owners need an efficient way to diagnose car issues, track repair progress, and maintain repair history. The platform connects drivers with mechanics through a structured diagnostic workflow with photo documentation and status tracking.

## Features Implemented

**User Roles:**
- **Driver**: Submit diagnostics, upload photos, view repair status
- **Mechanic**: View reports, assign repairs, upload after photos, mark completion
- **Admin**: Manage DTC catalog, oversee all reports

**Core Features:**
- User authentication (Login/Register with role-based access)
- DTC catalog management
- Diagnostic report submission with symptoms or trouble codes
- Photo upload (before/after)
- Real-time repair status tracking
- Vehicle management (add/list/delete)
- Password validation with strength requirements

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Vanilla CSS with CSS variables
- Font Awesome icons
- Axios for API calls

**Backend:**
- Python FastAPI (4 microservices)
  - Auth Service (JWT authentication)
  - Vehicle Service (cars management)
  - Diagnosis Service (DTC & reports)
  - API Gateway (request routing/security)

**Database:**
- MongoDB (NoSQL)

## Project Structure
```
client/
  ├── src/
  │   ├── pages/ (Login, Vehicles, Diagnose, Reports, DTCCatalog)
  │   ├── App.tsx
  │   ├── api.ts (Axios configuration)
  │   └── index.css (global styles)

microservices/
  ├── api-gateway/ (proxy & security)
  ├── auth-service/ (JWT login/register)
  ├── vehicle-service/ (CRUD vehicles)
  ├── diagnosis-service/ (DTC + reports)
  └── scripts/ (seed database)
```

## Setup Instructions

**Prerequisites:** Node.js 18+, Python 3.9+, MongoDB

**Frontend Setup:**
```bash
cd client
npm install
npm run dev  # Runs on http://localhost:5173
```

**Backend Setup:**
```bash
# Each service (auth, vehicle, diagnosis, api-gateway):
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port [PORT]

# Run all services:
cd scripts
./run_all.sh  # or .ps1 for Windows
```

## API Endpoints (Brief)

**Auth Service:**
- `POST /auth/register` - Create account
- `POST /auth/login` - Login & get JWT token

**Vehicle Service:**
- `GET /vehicles` - List user's vehicles
- `POST /vehicles` - Add vehicle
- `DELETE /vehicles/{id}` - Delete vehicle

**Diagnosis Service:**
- `GET /diagnosis/dtc` - List all DTC codes
- `POST /diagnosis/dtc` - Add DTC (admin only)
- `POST /diagnosis/reports` - Submit diagnostic report
- `GET /diagnosis/reports` - Get user reports/all (role-based)
- `PUT /diagnosis/reports/{id}` - Update report status/photos

## Database Schema (Brief)

**Users**: email, password_hash, name, role, created_at

**Vehicles**: vin, make, model, year, owner_id

**DTC Catalog**: code, title, probable_cause, recommended_action

**Reports**: vehicle_id, owner_id, dtc, symptoms, probable_cause, recommended_action, status, before_photo, after_photo, mechanic_id, created_at, updated_at

## Architecture

```
[React Frontend] 
        ↓
[API Gateway] 
        ↓
[Auth Service] [Vehicle Service] [Diagnosis Service]
        ↓
[MongoDB Database]
```

## Key Design Decisions

1. **Microservices**: Separated concerns for scalability
2. **JWT Authentication**: Stateless, token-based security
3. **Role-Based Access**: Driver/Mechanic/Admin permissions enforced at API level
4. **CSS Variables**: Consistent theming with minimal styles
5. **Base64 Photos**: Photos stored as base64 in database for simplicity
6. **Password Validation**: Regex-based strength requirements (8+ chars, uppercase, lowercase, number, special)

## Styling Features

- Gradient background on login page
- Font Awesome icons throughout
- Color-coded status badges (pending, in-progress, completed)
- Input validation visual feedback (green/red borders)
- Responsive design for mobile & desktop
- Dark topbar navigation with active link highlighting

## Deployment Notes

- Frontend: Deploy to Vercel/Netlify
- Backend: Deploy to AWS/Heroku/DigitalOcean
- Database: MongoDB Atlas (cloud)
- Environment variables: Store API URLs, JWT secrets in .env

## Assumptions

- Simple email validation (no email verification required)
- Photos stored as base64 (not CDN)
- Single admin user for DTC management
- No payment processing
- In-memory session storage (not persistent)


