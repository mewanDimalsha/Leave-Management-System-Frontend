# Leave Management System

A full-stack leave management application with React frontend and Node.js backend.

## Quick Start

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5001`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Sample Credentials

**Admin:**

- Name: `admin`
- Password: `admin123`

**Employee:**

- Name: `employee`
- Password: `employee123`

## API Endpoints

### Authentication

```bash
POST /api/auth/login
{
  "name": "admin",
  "password": "admin123"
}
```

### Leave Management

```bash
GET /api/leaves                    # Get all leaves
POST /api/leaves                   # Create leave
PUT /api/leaves/:id                # Update leave
DELETE /api/leaves/:id             # Delete leave
PUT /api/leaves/:id                # Approve leave (admin)
PUT /api/leaves/:id                # Reject leave (admin)
```

## 🧪 Sample Requests

### Login

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name": "admin", "password": "admin123"}'
```

### Create Leave

```bash
curl -X POST http://localhost:5001/api/leaves \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fromDate": "2025-01-20T00:00:00.000Z",
    "toDate": "2025-01-22T00:00:00.000Z",
    "reason": "Vacation"
  }'
```

## Features

- **Role-based access** (Admin/Employee)
- **Leave overlap detection**
- **Dashboard statistics** (pending/approved/rejected counts)
- **Employee search** and filtering
- **Date validation**
- **Responsive design**

## Testing

```bash
cd frontend
npm run test        # Run tests
npm run test:coverage  # Coverage report
```

## Tech Stack

**Frontend:** React, Redux Toolkit, Material-UI, Vitest
**Backend:** Node.js, Express, MongoDB, JWT
