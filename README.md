# Counsellor Admin Dashboard

A comprehensive full-stack admin dashboard for monitoring users and counsellors with JWT authentication, multi-tenant data isolation, Redis caching, and real-time metrics.

## Project Overview

**Objective**: Build an administrative dashboard that allows admins to:
- Monitor users with different risk levels
- Manage counsellors and assign them to users
- Track counselling sessions and status
- View real-time system metrics and health
- Search, filter, and manage data efficiently

**Problem Solved**: Organizations need a centralized platform to manage user-counsellor relationships, track user risk levels, and monitor session progress without data leakage between different admin accounts.

## Approach & Methodology

**Development Approach**: 
- Agile feature-driven development
- Security-first architecture
- Multi-tenant design from the ground up
- Test-driven infrastructure

**Technology Stack**:
- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Caching**: Redis (Upstash)
- **Authentication**: JWT (7-day tokens)
- **Security**: bcryptjs password hashing
- **Deployment**: Docker + Docker Compose (Render)
- **Testing**: Jest

**Design Philosophy**:
- Clean architecture with separation of concerns
- Component reusability on the frontend
- Middleware-driven backend architecture
- Multi-tenant with admin_id filtering on all queries
- Performance through intelligent caching

##  Architecture Explanation

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  Pages: Dashboard, Users, Counsellors, Profile, Settings    │
│  Components: 7+ Reusable Modals, Forms, Tables              │
└────────────┬────────────────────────────────────┬───────────┘
             │ REST API (15+ endpoints)          │ JWT Token
             │                                   │
┌────────────▼───────────────────────────────────▼────────────┐
│              Backend (Express.js + Node.js)                  │
│  Routes → Controllers → Services → Database                 │
│  Middleware: Auth, Logging, Error Handling                  │
└────────────┬───────────────────────────────────┬────────────┘
             │ SQL Queries                       │ Cache Ops
             │                                   │
    ┌────────▼─────────────┬────────────────────▼──────┐
    │  PostgreSQL (DB)    │    Redis Cache (Upstash)   │
    │  - admin_users      │  - Cache keys: admin-specific
    │  - users            │  - TTL: 5 minutes
    │  - counsellors      │  - Auto-invalidation
    │  - completed_users  │                            │
    └────────────────────┴─────────────────────────────┘
```

### Frontend Architecture
- **Pages**: Dashboard, Users, Counsellors, Profile, Settings, Login
- **Components**: Modals (Add, Edit, Delete, Assign), Badge, Sidebar
- **Service Layer**: API calls abstracted in utils/
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Styling**: CSS modules with responsive design

### Backend Architecture
- **Routes**: `/api/auth`, `/api/users`, `/api/counsellors`, `/api/health`
- **Controllers**: Business logic separated from routes
- **Middleware**: Auth verification, Request logging, Error handling
- **Database Layer**: Query builders with admin_id filtering
- **Cache Layer**: Redis integration for performance

### Database Design
```
admin_users (Admins)
├── id (PK)
├── username (UNIQUE)
├── email (UNIQUE)
├── password (bcryptjs)
└── role, status, created_at

users (Regular Users) - admin_id FK
├── id (PK)
├── admin_id (FK → admin_users)
├── name, email, plan_status
├── risk_level (Low/Medium/High)
├── counsellor_id (FK → counsellors)
├── session_time, created_at

counsellors - admin_id FK
├── id (PK)
├── admin_id (FK → admin_users)
├── name, email, specialty
├── assigned_users, pending_reviews
├── status (Active/Inactive)

completed_users - admin_id FK
├── Same as users + completed_at
```

### Key Security Features
- ✅ **JWT Authentication**: 7-day expiry, Bearer token pattern
- ✅ **Data Isolation**: Every query filters by `admin_id`
- ✅ **Password Hashing**: bcryptjs with 10 salt rounds
- ✅ **Cache Isolation**: Keys like `cache:users:admin:{adminId}`
- ✅ **Ownership Verification**: Updates verified with `WHERE id = 1 AND admin_id = 2`

##  Setup Process & Installation

### Prerequisites
```
- Node.js 18+
- PostgreSQL 12+ (for local) or Render PostgreSQL (cloud)
- Redis (optional locally, Upstash for cloud)
- Docker & Docker Compose (for containerized setup)
- Git
```

### Option 1: Local Development Setup

#### 1. Clone Repository
```bash
git clone https://github.com/pes2ug23cs091/Counsellor_Admin_Dashboard.git
cd Counsellor_Admin_Dashboard
```

#### 2. Backend Setup
```bash
cd admin-dashboard-backend

# Install dependencies
npm install

# Set up environment file
cp .env.example .env
# Edit .env with your PostgreSQL and Redis credentials

# Start backend server (runs on http://localhost:5000)
npm start
```

#### 3. Frontend Setup
```bash
cd ../admin-dashboard

# Install dependencies
npm install

# Set up environment file
cp .env.example .env

# Start frontend dev server (runs on http://localhost:3000)
npm run dev
```

#### 4. Access Dashboard
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

---

### Option 2: Docker Setup (Recommended)

#### 1. Clone Repository
```bash
git clone https://github.com/pes2ug23cs091/Counsellor_Admin_Dashboard.git
cd Counsellor_Admin_Dashboard
```

#### 2. Start All Services
```bash
# Build and start all services (Frontend, Backend, PostgreSQL, Redis)
docker-compose up --build

# Services will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

#### 3. Stop Services
```bash
docker-compose down
```

---

### Test Credentials
```
Username: admin
Password: admin123
Email: admin@counsellor.com
```

---

##  Usage Instructions

### 1. Login
- Navigate to http://localhost:3000 (or deployment link)
- Enter credentials above
- JWT token stored in localStorage automatically

### 2. Dashboard
- View 5 key metrics: Total Users, Active, Counsellors, Pending, Completed
- See active counsellings list (top 10)
- Quick overview of system status

### 3. User Management
- **Search**: Find users by name or email
- **Filter**: By risk level (Low/Medium/High) or status (Active/Pending/Completed)
- **Create**: Click "Add User" button
- **Assign Counsellor**: Select user → Click "Assign" → Choose counsellor + session time
- **Edit**: Click edit icon → Update information
- **Delete**: Click delete icon → Confirm
- **Complete**: Mark user as completed (moves to completed list)

### 4. Counsellor Management
- **View**: All counsellors with assigned users count
- **Create**: Add new counsellor
- **Edit**: Update counsellor information
- **Toggle Status**: Enable/disable counsellor
- **Delete**: Remove counsellor (if no active assignments)

### 5. Profile
- View admin profile information
- See login details and account status

### 6. Settings
- Application settings and configurations

### 7. Logout
- Click profile → Logout
- Confirmation dialog appears
- Session ends, redirects to login

---

##  Output/Visualization

### Dashboard Metrics
```
┌─────────────┬─────────────┬─────────────┐
│ Total Users │   Active    │ Counsellors │
│    125      │     87      │      12     │
└─────────────┴─────────────┴─────────────┘

┌─────────────────────┬──────────────────┐
│ Pending Sessions    │ Completed Users  │
│        15           │        23        │
└─────────────────────┴──────────────────┘
```

### Active Counsellings Display
- Table with: User Name, Counsellor, Status, Session Time
- Color-coded badges (Green=Active, Red=Inactive)
- Real-time updates

### User Management Table
- Columns: Name, Email, Risk Level, Assigned Counsellor, Status, Actions
- Risk levels color-coded: Green (Low), Yellow (Medium), Red (High)
- Inline edit/delete/assign actions

---

## 📁 Folder Structure

```
Counsellor_Admin_Dashboard/
│
├── admin-dashboard/                 # Frontend (React)
│   ├── src/
│   │   ├── pages/                   # Login, Dashboard, Users, Counsellors, Profile, Settings
│   │   ├── components/              # Reusable components (Modals, Badge, Sidebar)
│   │   ├── utils/                   # API service, helpers
│   │   └── App.jsx, main.jsx
│   ├── public/                      # Static assets
│   ├── package.json                 # Dependencies
│   ├── Dockerfile                   # Docker configuration
│   ├── nginx.conf                   # Nginx routing for React
│   ├── vite.config.js              # Vite configuration
│   ├── .env.example                # Environment template
│   └── __tests__/                  # Tests (if any)
│
├── admin-dashboard-backend/         # Backend (Express.js)
│   ├── src/
│   │   ├── config/                  # Database, Redis, Cache config
│   │   ├── controllers/             # Business logic
│   │   ├── middleware/              # Auth, logging, error handling
│   │   ├── routes/                  # API routes
│   │   ├── utils/                   # Health checks, cache utilities
│   │   └── index.js                # Server entry point
│   ├── package.json                 # Dependencies
│   ├── Dockerfile                   # Docker configuration
│   ├── .env.example                # Environment template
│   ├── .env                        # Actual environment (excludes sensitive data)
│   └── __tests__/                  # Jest tests
│
├── docker-compose.yml               # Docker orchestration (4 services)
├── .env                            # Root environment config
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

---

##  Design Decisions & Tradeoffs

### 1. **Express.js vs NestJS**
- **Decision**: Express.js
- **Reason**: Lighter weight, faster development, sufficient for requirements
- **Tradeoff**: Less structure than NestJS but faster to implement

### 2. **React Frontend (vs Vue/Angular)**
- **Decision**: React + Vite
- **Reason**: Large ecosystem, component reusability, fast with Vite
- **Benefit**: 7+ reusable modal components increase development speed

### 3. **Redis Caching**
- **Decision**: Redis with admin-specific keys
- **Reason**: Significant performance improvement (50ms vs 100-200ms db queries)
- **Implementation**: Keys like `cache:users:admin:{adminId}` prevent cross-admin data leakage

### 4. **Multi-Tenant Architecture**
- **Decision**: admin_id filtering on ALL queries
- **Reason**: Ensures complete data isolation between different admins
- **Security**: Prevents accidental data exposure, supports multiple independent organizations

### 5. **JWT Authentication**
- **Decision**: 7-day tokens with Bearer pattern
- **Reason**: Stateless, scalable, industry standard
- **Security**: Tokens in localStorage, HttpOnly cookies not used (architectural choice)

### 6. **PostgreSQL with Foreign Keys**
- **Decision**: Referential integrity with ON DELETE CASCADE
- **Reason**: Data consistency, prevents orphaned records
- **Benefit**: Automatic cleanup when parent records deleted

### 7. **Docker Containerization**
- **Decision**: Full docker-compose with 4 services
- **Reason**: Ensures consistent environment across development and production
- **Services**: Frontend, Backend, PostgreSQL, Redis

### 8. **Password Hashing**
- **Decision**: bcryptjs with 10 salt rounds
- **Reason**: Industry standard, resistant to rainbow table attacks
- **Security**: Computationally expensive to crack (intentional slowdown)

---

##  Testing

### Backend Tests
```bash
cd admin-dashboard-backend

# Run tests
npm test

# Tests include:
# - Health check endpoints (basic, detailed, database)
# - Response formats
# - Status codes (200 healthy, 503 unhealthy)
# - Database connectivity
```

### Test Files
- `__tests__/health.test.js` - Health monitoring tests

---

##  API Endpoints

### Authentication (Public)
```
POST   /api/auth/register           - Create admin account
POST   /api/auth/login              - Login, get JWT token
GET    /api/health                  - Simple health check
```

### Protected Routes (Requires JWT)
```
GET    /api/auth/profile            - Get current admin profile
GET    /api/auth/verify             - Verify JWT token
POST   /api/auth/logout             - Logout

GET    /api/users                   - Get all users (admin-filtered)
POST   /api/users                   - Create user
PUT    /api/users/:id               - Update user
DELETE /api/users/:id               - Delete user
GET    /api/users/completed-users   - Get completed users
POST   /api/users/:id/assign-counsellor - Assign counsellor

GET    /api/counsellors             - Get all counsellors (admin-filtered)
POST   /api/counsellors             - Create counsellor
PUT    /api/counsellors/:id         - Update counsellor
DELETE /api/counsellors/:id         - Delete counsellor

GET    /api/health/detailed         - All services health
GET    /api/health/database         - Database connectivity
```

---

##  Live Deployment

### Available At
- **Frontend**: https://counsellor-admin-frontend.onrender.com
- **Backend**: https://counsellor-admin-dashboard.onrender.com
- **Status**: ✅ Active and operational

### Deployment Features
- ✅ Auto-deployment on git push
- ✅ Health checks on all services
- ✅ Environment variables managed securely
- ✅ PostgreSQL and Redis cloud integration

---

##  Features Implemented

### Core Features ✅
- ✅ Dashboard with 5 key metrics
- ✅ User management (CRUD)
- ✅ Counsellor management (CRUD)
- ✅ Search and filter capabilities
- ✅ Real-time data updates

### Security ✅
- ✅ JWT authentication
- ✅ Data isolation by admin
- ✅ Password hashing (bcryptjs)
- ✅ Ownership verification on updates
- ✅ Secure environment variables

### Performance ✅
- ✅ Redis caching (5-min TTL)
- ✅ Admin-isolated cache keys
- ✅ Database query optimization
- ✅ Lazy loading where applicable

### Bonus Features (6/6) ✅
- ✅ JWT Authentication (7-day tokens)
- ✅ Redis Caching (Upstash cloud)
- ✅ Logging (structured console logs)
- ✅ Pagination (search, filter, sort)
- ✅ RBAC (multi-tenant architecture)
- ✅ CI/CD (GitHub + Render auto-deployment)

---

## Troubleshooting

### Port Already in Use
```bash
# Frontend port 3000
sudo lsof -i :3000
kill -9 <PID>

# Backend port 5000
sudo lsof -i :5000
kill -9 <PID>
```

### Database Connection Error
```
Check .env file for:
- DATABASE_URL or DB_HOST
- DB_USER credentials
- DB_PASSWORD
- DB_PORT (usually 5432)
```

### Redis Connection Error
```
Check .env for:
- REDIS_URL (Upstash)
- REDIS_HOST/PORT (local)
```

### Docker Issues
```bash
# Rebuild containers
docker-compose down
docker-compose up --build

# View logs
docker-compose logs -f
```

---
