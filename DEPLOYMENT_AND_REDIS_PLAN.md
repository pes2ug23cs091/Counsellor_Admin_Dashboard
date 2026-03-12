# 📋 DEPLOYMENT & REDIS CACHING PLAN

## 🚀 PHASE 1: DOCKER DEPLOYMENT (Tomorrow - Part 1)

### Overview
Complete containerization of the entire application stack:
- Frontend (React + Vite)
- Backend (Node.js + Express)
- PostgreSQL Database
- Redis Cache (optional)

### Deliverables
1. **Dockerfile (Frontend)**
2. **Dockerfile (Backend)**
3. **docker-compose.yml** (orchestrate all services)
4. **.dockerignore files**
5. **Environment configuration files**

---

## 📦 DOCKERFILE STRUCTURE

### Frontend Dockerfile
**Location:** `admin-dashboard/Dockerfile`

**Multi-stage build approach:**
```
Stage 1: Build stage
- Base image: node:18-alpine
- Install dependencies (npm install)
- Build Vite application (npm run build)
- Output: dist/ folder

Stage 2: Runtime stage
- Base image: nginx:alpine
- Copy dist/ from build stage to nginx
- Configure nginx to serve React app
- Expose port 3000
- Start nginx
```

**Key considerations:**
- Minimize image size (using alpine)
- Use nginx for static file serving (better than node)
- Implement caching layers in Dockerfile
- Security: don't include source code in final image

---

### Backend Dockerfile
**Location:** `admin-dashboard-backend/Dockerfile`

**Single-stage build:**
```
Base image: node:18-alpine

Steps:
1. Set working directory /app
2. Copy package*.json files
3. Install dependencies (npm ci --only=production)
4. Copy source code
5. Expose port 5000
6. Health check
7. Start with: npm start
```

**Key considerations:**
- Use node:18-alpine for smaller size
- Use npm ci instead of npm install (production mode)
- Include health check
- Don't copy test files
- Set NODE_ENV=production

---

## 🐳 DOCKER-COMPOSE CONFIGURATION

**Location:** `docker-compose.yml` (root directory)

**Services to define:**

### 1. PostgreSQL Service
```yaml
service: postgres
- Image: postgres:15-alpine
- Port: 5432
- Environment:
  - POSTGRES_USER: postgres
  - POSTGRES_PASSWORD: postgres
  - POSTGRES_DB: admin_dashboard
- Volume: postgres_data (for persistence)
- Health check: pg_isready
```

### 2. Redis Service (Optional)
```yaml
service: redis
- Image: redis:7-alpine
- Port: 6379
- Volume: redis_data (for persistence)
- Health check: redis-cli ping
```

### 3. Backend Service
```yaml
service: backend
- Build: ./admin-dashboard-backend
- Port: 5000:5000
- Environment:
  - NODE_ENV: production
  - DB_HOST: postgres
  - DB_PORT: 5432
  - DB_NAME: admin_dashboard
  - DB_USER: postgres
  - DB_PASSWORD: postgres
  - REDIS_HOST: redis (if using cache)
  - REDIS_PORT: 6379
- Depends on: postgres (health check)
- Volume: none (stateless)
```

### 4. Frontend Service
```yaml
service: frontend
- Build: ./admin-dashboard
- Port: 3000:80
- Environment:
  - REACT_APP_API_URL: http://localhost:5000/api
- Depends on: backend
- Volume: none (stateless)
```

### Named Volumes
```yaml
- postgres_data: PostgreSQL data persistence
- redis_data: Redis data persistence
```

---

## 🌐 NETWORK CONFIGURATION

- **Network name:** admin-dashboard-network
- **Driver:** bridge
- **Services communication:**
  - Frontend ↔ Backend via service name (backend:5000)
  - Backend ↔ PostgreSQL via service name (postgres:5432)
  - Backend ↔ Redis via service name (redis:6379)

---

## 📁 PROJECT STRUCTURE AFTER DOCKER SETUP

```
V7 AI SOLUTIONS/
├── docker-compose.yml          ← Main orchestration file
├── .dockerignore                ← Docker ignore patterns
├── .env.example                 ← Environment template
├── .env.production              ← Production environment
│
├── admin-dashboard/             (Frontend)
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.conf               ← Nginx configuration
│   └── ... (existing files)
│
└── admin-dashboard-backend/    (Backend)
    ├── Dockerfile
    ├── .dockerignore
    ├── ... (existing files)
```

---

## 💾 REDIS CACHING IMPLEMENTATION (Tomorrow - Part 2)

### Overview
Implement Redis caching to improve performance:
- Cache frequently accessed data
- Reduce database queries
- Implement cache invalidation strategies

### Caching Strategy

#### 1. **What to Cache?**

**Priority 1 - High frequency reads:**
- User list: `cache:users`
- Counsellor list: `cache:counsellors`
- Dashboard metrics: `cache:metrics`

**Priority 2 - Medium frequency reads:**
- Individual user by ID: `cache:user:{id}`
- Individual counsellor by ID: `cache:counsellor:{id}`

**Priority 3 - Search/Filter results:**
- Search results: `cache:search:{query}` (TTL: 5 min)

#### 2. **Cache TTL (Time-To-Live)**

```
Users/Counsellors list:    15-30 minutes
Dashboard metrics:         5-10 minutes
Individual records:        30 minutes
Search results:            5 minutes
Health check:              1 minute
```

#### 3. **Cache Invalidation Strategy**

```
When data is modified:
- POST /api/users → Invalidate cache:users
- PUT /api/users/:id → Invalidate cache:user:{id} + cache:users
- DELETE /api/users/:id → Invalidate cache:user:{id} + cache:users
- POST /api/counsellors → Invalidate cache:counsellors
- Similar for counsellors...

Batch invalidation:
- Any user update → Clear all related caches
- Any counsellor update → Clear all related caches
```

---

## 🔧 REDIS IMPLEMENTATION TASKS

### Task 1: Install Redis Client
```bash
npm install redis ioredis
```

### Task 2: Create Redis Configuration
**Location:** `admin-dashboard-backend/src/config/redis.js`

```javascript
// Connect to Redis
// Create singleton connection
// Implement connection pooling
// Add error handling
// Add logging
```

### Task 3: Create Cache Utility Functions
**Location:** `admin-dashboard-backend/src/utils/cache.js`

```javascript
- getFromCache(key)              // Retrieve from cache
- setInCache(key, value, ttl)    // Store in cache
- deleteFromCache(key)           // Remove from cache
- clearCachePattern(pattern)     // Clear multiple keys
- invalidateUserCache()          // Batch clear user caches
- invalidateCounsellorCache()    // Batch clear counsellor caches
```

### Task 4: Update Controllers with Caching
**Modify Files:**
- `userController.js`
- `counsellorController.js`
- `healthController.js`

**Pattern:**
```javascript
// GET - Try cache first
1. Check if data in cache
2. If yes → return cached data
3. If no → fetch from DB
4. Store in cache with TTL
5. Return data

// POST/PUT/DELETE - Invalidate cache
1. Perform database operation
2. Invalidate relevant cache keys
3. Return response
```

### Task 5: Add Cache Monitoring
**Location:** `admin-dashboard-backend/src/routes/cache.js`

```javascript
// New endpoints:
GET  /api/cache/stats     → Cache statistics
GET  /api/cache/keys      → List all cached keys
POST /api/cache/clear     → Clear all cache
DELETE /api/cache/key/:id → Clear specific key
```

---

## 📊 EXPECTED PERFORMANCE IMPROVEMENTS

### Before Caching
- User list fetch: ~150-200ms (DB query)
- Counsellor list fetch: ~120-150ms (DB query)
- Dashboard metrics: ~300-400ms (multiple queries)

### After Caching (cached hit)
- User list fetch: ~5-10ms (Redis read)
- Counsellor list fetch: ~5-10ms (Redis read)
- Dashboard metrics: ~10-20ms (Redis read)

### Improvement: **15-40x faster** ⚡

---

## 🛠️ DOCKER COMMANDS (Reference for Tomorrow)

### Build images:
```bash
docker-compose build
```

### Start all services:
```bash
docker-compose up
```

### Start in background:
```bash
docker-compose up -d
```

### View logs:
```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop services:
```bash
docker-compose down
```

### Remove all data (clean slate):
```bash
docker-compose down -v
```

### Rebuild specific service:
```bash
docker-compose build backend --no-cache
docker-compose up backend
```

---

## 📝 ENVIRONMENT VARIABLES SETUP

### `.env.example` (Template)
```
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=admin_dashboard
DB_USER=postgres
DB_PASSWORD=postgres_password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=1800

# Application
NODE_ENV=production
PORT=5000
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### `.env.production` (Actual for Docker)
- Copy from `.env.example`
- Update with production values

---

## 🔐 SECURITY CONSIDERATIONS

### Docker Security
1. Use specific version tags (not `latest`)
2. Run containers as non-root user
3. Use read-only filesystems where possible
4. Implement network policies
5. Set resource limits (CPU, Memory)

### Redis Security
1. Require password authentication
2. Use firewall rules (not exposed to public)
3. Enable persistence (AOF or RDB)
4. Monitor Redis commands
5. Use key expiration (TTL)

### Database Security
1. Use strong passwords
2. Limit database connections
3. Backup regularly
4. Use encrypted connections if needed
5. Monitor access logs

---

## ✅ TOMORROW'S CHECKLIST

### Phase 1: Docker Deployment
- [ ] Create Frontend Dockerfile
- [ ] Create Backend Dockerfile
- [ ] Create docker-compose.yml
- [ ] Create .dockerignore files
- [ ] Create .env files
- [ ] Create nginx.conf (frontend)
- [ ] Test local Docker build
- [ ] Test all services communication
- [ ] Verify database migrations run
- [ ] Test health endpoints

### Phase 2: Redis Caching
- [ ] Install Redis dependencies
- [ ] Create Redis configuration module
- [ ] Create cache utility functions
- [ ] Add caching to user endpoints
- [ ] Add caching to counsellor endpoints
- [ ] Add caching to health endpoints
- [ ] Test cache hit/miss
- [ ] Verify cache invalidation
- [ ] Add cache monitoring endpoints
- [ ] Performance testing

### Phase 3: Testing & Documentation
- [ ] Test Docker Compose startup
- [ ] Verify all containers communicate
- [ ] Test backend endpoints through Docker
- [ ] Test frontend through Docker
- [ ] Update README with Docker instructions
- [ ] Document Redis caching strategy
- [ ] Create deployment guide

---

## 🎯 SUCCESS CRITERIA

By end of tomorrow, you should have:

✅ **Docker Setup:**
- Complete working docker-compose.yml
- All services container files
- All services running successfully
- Frontend accessible at http://localhost:3000
- Backend accessible at http://localhost:5000
- Database persisted
- Logs visible and trackable

✅ **Redis Caching:**
- Redis service running
- Cache layer implemented
- 15-40x performance improvement
- Cache invalidation working
- Cache monitoring available

✅ **Documentation:**
- Docker deployment guide
- Redis caching documentation
- Environment setup instructions
- Troubleshooting guide

---

## 📞 REFERENCE LINKS

### Docker Official Docs
- Docker Compose: https://docs.docker.com/compose/
- Dockerfile Reference: https://docs.docker.com/engine/reference/builder/
- Docker Best Practices: https://docs.docker.com/develop/dev-best-practices/

### Redis Docs
- Redis Commands: https://redis.io/commands
- Node Redis Client: https://github.com/redis/node-redis
- Redis Best Practices: https://redis.io/docs/management/persistence/

---

## 🔧 DETAILED IMPLEMENTATION FILES

### frontend/Dockerfile (Complete Code)
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime (Nginx)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

### frontend/nginx.conf (Complete Code)
```nginx
events {
    worker_connections 768;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 3000;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://backend:5000;
        }

        error_page 404 /index.html;
    }
}
```

### backend/Dockerfile (Complete Code)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
CMD ["npm", "start"]
```

### backend/.dockerignore
```
node_modules
npm-debug.log
.git
.env
__tests__
jest.config.js
.babelrc
```

### frontend/.dockerignore
```
node_modules
npm-debug.log
.git
.env
__tests__
jest.config.js
.babelrc
dist
```

---

## 📊 ACTUAL DOCKER-COMPOSE.YML (Complete Code)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: admin-dashboard-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: admin_dashboard
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - admin-network

  redis:
    image: redis:7-alpine
    container_name: admin-dashboard-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - admin-network

  backend:
    build:
      context: ./admin-dashboard-backend
      dockerfile: Dockerfile
    container_name: admin-dashboard-api
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: admin_dashboard
      DB_USER: postgres
      DB_PASSWORD: postgres
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./admin-dashboard-backend/src:/app/src:ro
    networks:
      - admin-network
    restart: unless-stopped

  frontend:
    build:
      context: ./admin-dashboard
      dockerfile: Dockerfile
    container_name: admin-dashboard-web
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:5000/api
    depends_on:
      - backend
    networks:
      - admin-network
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  admin-network:
    driver: bridge
```

---

## 🗄️ DATABASE INITIALIZATION

### Create init.sql (Optional - for automatic DB setup)
**Location:** `admin-dashboard-backend/init.sql`

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    plan_status VARCHAR(50) DEFAULT 'active',
    risk_level VARCHAR(50) DEFAULT 'medium',
    counsellor_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create counsellors table
CREATE TABLE IF NOT EXISTS counsellors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    assigned_users INTEGER DEFAULT 0,
    pending_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_counsellor_id ON users(counsellor_id);
CREATE INDEX idx_counsellors_status ON counsellors(status);

-- Insert sample data (Optional)
INSERT INTO counsellors (name, specialty, status, assigned_users, pending_reviews)
VALUES 
    ('Dr. Sarah Johnson', 'Cognitive Behavioral Therapy', 'active', 5, 2),
    ('Dr. Michael Chen', 'Family Therapy', 'active', 3, 1),
    ('Dr. Emily Rodriguez', 'Psychodynamic Therapy', 'active', 4, 3)
ON CONFLICT DO NOTHING;
```

### Updated docker-compose.yml (with volume for init)
```yaml
postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: admin_dashboard
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql  # Auto-run on startup
```

---

## 📈 MONITORING & TROUBLESHOOTING

### Health Check Endpoints (Reference)
```bash
# Simple health check
curl http://localhost:5000/api/health

# Detailed health check
curl http://localhost:5000/api/health/detailed

# Database health check
curl http://localhost:5000/api/health/database
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `Connection refused: postgres` | DB not ready | Wait for health check, check depends_on |
| `REDIS connection error` | Redis not started | Check Redis service logs |
| `Port already in use` | Service running on same port | Kill existing process or change port |
| `Frontend can't reach API` | Network misconfiguration | Verify service names in docker-compose |
| `Database migration failure` | SQL errors in init | Check init.sql syntax, test locally |

### Docker Logs Commands
```bash
# View all logs
docker-compose logs -f

# Backend logs only
docker-compose logs -f backend

# PostgreSQL logs
docker-compose logs -f postgres

# Follow specific service (last 50 lines)
docker-compose logs -f --tail=50 backend

# Stream logs with timestamps
docker-compose logs -f -t backend
```

---

## 🔄 BACKUP & PERSISTENCE

### Backup PostgreSQL Data
```bash
# Backup database (while running)
docker-compose exec postgres pg_dump -U postgres admin_dashboard > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U postgres admin_dashboard < backup.sql
```

### Redis Persistence Configuration
```bash
# Force Redis to save data
docker-compose exec redis redis-cli BGSAVE

# Check Redis keys
docker-compose exec redis redis-cli KEYS "*"

# Monitor cache size
docker-compose exec redis redis-cli INFO memory
```

---

## 📝 PIPELINE CHECKLIST - DAY 1 (DOCKER)

### Pre-Implementation
- [ ] Review docker-compose.yml structure
- [ ] Prepare all Dockerfile content above
- [ ] Create nginx.conf for frontend
- [ ] Setup .dockerignore files
- [ ] Create .env.example with all variables

### Implementation Phase
- [ ] Copy Dockerfile code to frontend/Dockerfile
- [ ] Copy Dockerfile code to backend/Dockerfile
- [ ] Create frontend/nginx.conf with provided code
- [ ] Create root docker-compose.yml with full YAML
- [ ] Create init.sql for database initialization
- [ ] Create/update .dockerignore files

### Testing Phase
- [ ] Run: `docker-compose build` (all images)
- [ ] Run: `docker-compose up` (start all services)
- [ ] Verify ports listening: 3000, 5000, 5432, 6379
- [ ] Test frontend: http://localhost:3000
- [ ] Test backend: http://localhost:5000/api/health
- [ ] Test database: `docker-compose exec postgres psql -U postgres -d admin_dashboard -c "SELECT * FROM users;"`
- [ ] Test Redis: `docker-compose exec redis redis-cli ping`
- [ ] Check container health: `docker-compose ps`
- [ ] View logs: `docker-compose logs -f`
- [ ] Test API endpoints through frontend

### Cleanup
- [ ] Stop services: `docker-compose down`
- [ ] Remove volumes: `docker-compose down -v`
- [ ] Document any issues found
- [ ] Create troubleshooting guide

---

## 📝 PIPELINE CHECKLIST - DAY 2 (REDIS CACHING)

### Phase 1: Setup Redis Client
- [ ] Install: `npm install redis ioredis` in backend
- [ ] Create src/config/redis.js
- [ ] Implement connection pooling
- [ ] Add error handling & logging

### Phase 2: Cache Utilities
- [ ] Create src/utils/cache.js
- [ ] Implement getFromCache()
- [ ] Implement setInCache()
- [ ] Implement deleteFromCache()
- [ ] Implement invalidation functions

### Phase 3: Controller Updates
- [ ] Update userController.js (add caching)
- [ ] Update counsellorController.js (add caching)
- [ ] Update healthController.js (add Redis check)
- [ ] Test cache hit/miss

### Phase 4: Monitoring
- [ ] Create src/routes/cache.js
- [ ] Add GET /api/cache/stats endpoint
- [ ] Add POST /api/cache/clear endpoint
- [ ] Test cache endpoints

### Verification
- [ ] Monitor cache operations in logs
- [ ] Verify TTL expiration
- [ ] Test with/without cache performance
- [ ] Verify cache invalidation on data updates

---

## 🎯 ACCEPTANCE CRITERIA

### Docker Deployment Success ✅
- All 4 services running: `docker-compose ps` shows all UP
- Frontend loads without errors on http://localhost:3000
- Backend responds on http://localhost:5000/api/health with 200 OK
- Database persists data across restarts
- Redis is accessible and responsive
- All logs are readable and meaningful
- Service-to-service communication working

### Redis Caching Success ✅
- First request (cache miss): ~150-200ms
- Second request (cache hit): ~5-10ms
- Cache invalidation works on CRUD operations
- Cache monitoring endpoints respond correctly
- Memory efficient (not growing infinitely)
- TTL expiration working correctly

### Documentation Complete ✅
- README includes Docker setup instructions
- Environment variables documented
- Troubleshooting guide written
- Backup procedures documented
- Performance metrics documented
- Deployment steps clear and tested

---

## 🚀 RAPID DEPLOYMENT SCRIPT (Optional)

**Location:** `deploy.sh` or `deploy.ps1`

```powershell
# PowerShell version
Write-Host "Starting deployment..." -ForegroundColor Green

# Build images
Write-Host "Building Docker images..." -ForegroundColor Yellow
docker-compose build

# Start services
Write-Host "Starting services..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services to be ready
Write-Host "Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check status
Write-Host "Service status:" -ForegroundColor Green
docker-compose ps

# Test endpoints
Write-Host "Testing endpoints..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -ErrorAction SilentlyContinue
if ($response.StatusCode -eq 200) {
    Write-Host "✅ Backend is running!" -ForegroundColor Green
} else {
    Write-Host "❌ Backend is not responding" -ForegroundColor Red
}

Write-Host "Frontend should be accessible at http://localhost:3000" -ForegroundColor Green
Write-Host "Deployment complete!" -ForegroundColor Green
```

---

## 🎊 PROGRESS SUMMARY

### Completed:
✅ Full-stack application
✅ Backend API (complete)
✅ Frontend UI (complete)
✅ Database schema
✅ Health monitoring
✅ Complete testing framework (Jest)
✅ Code quality standards

### Tomorrow:
🔄 Docker containerization
🔄 Redis caching layer
🔄 Production deployment guide
🔄 Final README documentation

**Status: 85% Complete - Ready for final deployment push tomorrow!** 🚀
