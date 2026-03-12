# 🐳 Docker Setup Troubleshooting & Alternatives

## Current Status

✅ **Installed & Working:**
- Docker CLI v29.3.0
- Docker Compose v5.1.0
- Docker configuration files (.dockerignore, Dockerfile, docker-compose.yml, nginx.conf)

❌ **Issue:**
- Docker Desktop daemon is not running (required to build/run containers)
- Podman machine has SSH connection issues

---

## ⚡ SOLUTION 1: Install Docker Desktop (Recommended)

### Option A: Microsoft Store (Easiest - Automatic Updates)

1. **Open Microsoft Store**
   - Click Windows Start button
   - Search for "Docker"
   - OR Click link: [Docker Desktop on Microsoft Store](ms-windows-store://pdp/?productid=XP8CBJ40XLBWKX)

2. **Click "Get" or "Install"**
   - Wait for download to complete
   - Installation will proceed automatically

3. **After Installation:**
   - Restart VS Code (or your terminal)
   - Run: `docker --version` (should work now)
   - Docker daemon will start automatically

### Option B: Direct Download from Docker

1. Go to https://www.docker.com/products/docker-desktop
2. Click "Download for Windows"
3. Run the installer (Docker Desktop Installer.exe)
4. Follow the installation wizard
5. Accept default settings
6. Restart computer when prompted
7. Docker Desktop will start automatically

---

## ⚡ SOLUTION 2: Use Rancher Desktop (Alternative)

Rancher Desktop is Docker Desktop alternative that's easier to setup:

```powershell
winget install Rancher.RancherDesktop --accept-package-agreements
```

After installation:
- Works similar to Docker Desktop
- Includes Docker Compose
- Automatically starts daemon
- Same docker commands work

---

## 🔧 SOLUTION 3: Manual Testing (No Docker Desktop)

If you want to test without Docker Desktop, use these commands:

### Build Images with Podman (if Podman machine issues are fixed):
```powershell
# Fix Podman machine
podman machine rm podman-machine-default
podman machine init --now --cpus 4 --memory 2048

# Then build
podman build -f admin-dashboard-backend/Dockerfile -t admin-dashboard-api .
podman build -f admin-dashboard/Dockerfile -t admin-dashboard-web .
```

### Or use pre-built images (skip building)

---

## 📋 Quick Setup After Docker Desktop Installation

### Step 1: Verify Docker Works
```powershell
docker --version
docker compose version
docker ps
```

### Step 2: Navigate to Project
```powershell
cd "c:\Users\Arjun's\Desktop\V7 AI SOLUTIONS"
```

### Step 3: Build All Images
```powershell
docker-compose build
```

**This will:**
- Build Frontend (React + Nginx)
- Build Backend (Node.js API)
- Pull PostgreSQL image
- Pull Redis image

**Time estimate:** 5-15 minutes (depends on internet speed)

### Step 4: Start All Services
```powershell
docker-compose up
```

**This starts:**
- PostgreSQL Database (port 5432)
- Redis Cache (port 6379)
- Backend API (port 5000)
- Frontend React App (port 3000)

### Step 5: Verify Services

In a new terminal:
```powershell
docker-compose ps
```

Should show all 4 containers running.

### Step 6: Test Endpoints

**Frontend:** http://localhost:3000
- Should see React admin dashboard

**Backend Health:** http://localhost:5000/api/health
- Should return JSON status

**Database:** Connect via PostgreSQL client to localhost:5432
- User: postgres
- Password: postgres
- Database: admin_dashboard

**Redis:** Connect via Redis client to localhost:6379

---

## ✅ SUCCESS INDICATORS

After running `docker-compose up`, you should see:

```
frontend      | ✔ compiled successfully
backend       | Server running on port 5000
postgres      | listening on IPv4 address "0.0.0.0", port 5432  
redis         | Ready to accept connections
```

**Browser check:**
- Visit http://localhost:3000
- Should see the admin dashboard UI
- No error messages in console

---

## 🛑 If Docker Desktop Won't Start

### Option 1: Check WSL2 Installation
```powershell
# Check if WSL2 is installed
wsl --list --verbose

# If not installed, set up WSL2
wsl --install

# Then restart and open Docker Desktop
```

### Option 2: Enable Hyper-V
1. Press Windows Key + R
2. Type: `optionalfeatures`
3. Check: "Hyper-V"
4. Click OK and restart
5. Try Docker Desktop again

### Option 3: Reset Docker
```powershell
# In Docker Desktop: Settings → Troubleshoot → Reset
# Or via PowerShell:
docker system prune -a --volumes
```

---

## 📞 Still Stuck?

If Docker still won't work, you have options:

1. **Remote Docker Machine**
   - Use cloud version (AWS EC2, DigitalOcean, etc.)
   - Deploy directly to cloud

2. **Docker via WSL2 Ubuntu**
   - Install Docker inside Ubuntu WSL2
   - Run containers from WSL terminal

3. **Skip Local Docker**
   - Deploy to online platforms (Heroku, Railway, Render.com)
   - Test backend API without Docker locally

---

## 📊 Architecture After Docker Setup

```
Your Machine (Windows)
    ├── Frontend Container (port 3000)
    │   └── React + Nginx
    ├── Backend Container (port 5000)
    │   └── Node.js + Express
    ├── Database Container (port 5432)
    │   └── PostgreSQL
    └── Cache Container (port 6379)
        └── Redis
```

All containers communicate via internal Docker network.

---

## 🎯 Next Phase After Docker Runs

Once all Docker services are running:

1. **Verify Backend Endpoints**
   ```bash
   curl http://localhost:5000/api/health
   curl http://localhost:5000/api/users
   curl http://localhost:5000/api/counsellors
   ```

2. **Test Frontend Functionality**
   - View dashboard at http://localhost:3000
   - Navigate through pages
   - Test user creation/deletion
   - Test counsellor management

3. **Implement Redis Caching**
   - Install Redis client in backend
   - Add cache layer to controllers
   - Test performance improvements

---

**Status:** Waiting for Docker Desktop installation to proceed with deployment.  
**Last Updated:** March 12, 2026
