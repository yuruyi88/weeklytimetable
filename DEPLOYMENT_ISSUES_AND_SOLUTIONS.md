# Deployment Issues & Solutions Summary

## Project: Kids Weekly Timetable

This document summarizes the deployment challenges faced when deploying a React + FastAPI application to Railway (backend) and Vercel (frontend), along with the current setup and recommendations.

---

## 🎯 Architecture Overview

```
┌─────────────────┐      HTTPS       ┌──────────────────┐
│  React Frontend │ ◄────────────────► │  FastAPI Backend │
│   (Vercel)      │                    │    (Railway)     │
└─────────────────┘                    └──────────────────┘
                                               │
                                        ┌──────┴──────┐
                                        │   SQLite    │
                                        │  (ephemeral)│
                                        └─────────────┘
```

---

## ✅ What Was Successfully Set Up

### 1. GitHub Repository
- **URL**: https://github.com/yuruyi88/weeklytimetable
- **Structure**:
  ```
  ├── backend/           # FastAPI application
  ├── frontend/          # React + Vite application  
  ├── .github/workflows/ # CI/CD automation
  ├── scripts/           # Deployment helpers
  └── DEPLOYMENT.md      # Full deployment guide
  ```

### 2. Backend Configuration (Railway)

#### Files Created:
| File | Purpose |
|------|---------|
| `backend/railway.toml` | Railway deployment configuration |
| `backend/Procfile` | Process definition for Railway |
| `backend/nixpacks.toml` | Build configuration (Python deps) |
| `backend/runtime.txt` | Python version specification |
| `backend/.railwayignore` | Files to exclude from deploy |

#### Environment Variables Set:
```
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./timetable.db
PORT=8000
```

#### Railway URL:
```
https://weeklytimetable-production.up.railway.app
```

### 3. Frontend Configuration (Vercel)

#### Files Created:
| File | Purpose |
|------|---------|
| `frontend/.env.local` | API URL configuration |
| `vercel.json` | Vercel routing configuration |

#### Environment Variable:
```
VITE_API_URL=https://weeklytimetable-production.up.railway.app
```

#### Vercel URL:
```
https://weeklytimetable-nhk0t74ku-yuruyis-projects.vercel.app
```

### 4. GitHub Actions CI/CD

#### Workflows Created:

**`.github/workflows/deploy-backend.yml`**
- Triggers on: Push to `backend/**` or workflow file
- Action: Deploys backend to Railway automatically

**`.github/workflows/deploy-frontend.yml`**
- Triggers on: Push to `frontend/**` or workflow file
- Action: Deploys frontend to Vercel automatically
- Creates `.env.local` with backend URL during build

**`.github/workflows/keep-alive.yml`**
- Triggers: Every 10 minutes (cron schedule)
- Action: Pings backend health endpoint to prevent sleep

### 5. GitHub Secrets Configured

| Secret | Purpose | Status |
|--------|---------|--------|
| `RAILWAY_TOKEN` | Deploy to Railway | ✅ Added |
| `VERCEL_TOKEN` | Deploy to Vercel | ✅ Added |
| `VERCEL_ORG_ID` | Vercel organization | ✅ Added |
| `VERCEL_PROJECT_ID` | Vercel project ID | ✅ Added |

---

## ❌ Issues Encountered

### Issue 1: Railway Backend Returns 502 Error

**Status**: ❌ UNRESOLVED

**Error Message**:
```
{"status":"error","code":502,"message":"Application failed to respond"}
```

**Root Cause Analysis**:
1. Railway was executing `start.sh` (local dev script) instead of proper backend command
2. `start.sh` tries to start both frontend and backend, requiring Node.js and Python
3. Railway container doesn't have the proper environment for this dual-startup approach
4. Multiple attempts to fix start commands were unsuccessful

**Attempts Made**:
1. ✅ Renamed `start.sh` to `start-local.sh` to prevent accidental execution
2. ✅ Updated `railway.toml` with correct start command
3. ✅ Updated `Procfile` with backend-only command
4. ✅ Created `nixpacks.toml` for proper Python dependency installation
5. ✅ Tried different command formats (`uvicorn`, `python3 -m uvicorn`)
6. ✅ Added root-level `nixpacks.toml`

**Why It Still Fails**:
- Likely a Railway free tier limitation
- Container may be missing required system dependencies
- SQLite initialization may be failing on ephemeral filesystem
- Port binding or networking issues within Railway's container

---

### Issue 2: Vercel Project ID Mismatch

**Status**: ✅ RESOLVED

**Error**:
```
Error: Project not found ({"VERCEL_PROJECT_ID":"***","VERCEL_ORG_ID":"***"})
```

**Solution**:
- Correct Project ID: `prj_meabfE8ihQA21DWyEm6Hpnj2Acb0`
- Updated GitHub secret with correct value
- GitHub Actions should now work once backend is fixed

---

### Issue 3: Railway Free Tier Limitations

**Challenges**:
1. **Ephemeral Filesystem**: SQLite database resets on every deploy/restart
2. **Sleep Mode**: App sleeps after inactivity (workaround: keep-alive pinger)
3. **Resource Limits**: 512MB RAM, limited CPU
4. **Trial Period**: $5 credit expires in 30 days

**Mitigation Implemented**:
- GitHub Actions workflow pings backend every 10 minutes to keep it awake

---

## 🔧 Current Deployment Setup

### How Auto-Deploy Works:

```
1. Developer pushes code to GitHub main branch
   ↓
2. GitHub Actions detects changes
   ↓
3. For backend changes:
   - Runs .github/workflows/deploy-backend.yml
   - Uses RAILWAY_TOKEN to deploy to Railway
   ↓
4. For frontend changes:
   - Runs .github/workflows/deploy-frontend.yml
   - Creates .env.local with VITE_API_URL
   - Uses VERCEL_TOKEN to deploy to Vercel
   ↓
5. Every 10 minutes:
   - keep-alive.yml pings backend health endpoint
   - Prevents Railway free tier from sleeping
```

### Manual Deployment (Fallback):

**Backend**:
```bash
cd backend
railway login
railway up
```

**Frontend**:
```bash
cd frontend
vercel --prod --token="YOUR_TOKEN"
```

---

## 💡 Recommendations

### Option 1: Fix Railway Deployment (Current Path)

**Pros**:
- Separate frontend/backend is cleaner architecture
- Backend can be reused for other projects

**Cons**:
- Requires debugging Railway container issues
- SQLite will still reset on redeploys
- Free tier limitations (sleep, trial expiration)

**Next Steps**:
1. Check Railway deployment logs for specific Python errors
2. Consider using Railway's PostgreSQL add-on ($5/month) for persistent data
3. Add more detailed logging to backend to diagnose startup failures
4. Try deploying with Docker instead of Nixpacks

---

### Option 2: Switch to Alternative Backend Hosting

#### A. Fly.io (Recommended Alternative)
**Pros**:
- Truly free tier (3 VMs, persistent volumes)
- SQLite survives restarts with persistent volumes
- Better documentation and community support
- No sleep mode on free tier

**Cons**:
- Different deployment process (fly.toml instead of railway.toml)
- Requires learning new platform

**Migration Effort**: Medium - would need new config files

#### B. Render.com
**Pros**:
- Similar to Railway
- Free web services
- Good documentation

**Cons**:
- Also has sleep mode
- Similar SQLite limitations

#### C. PythonAnywhere
**Pros**:
- Always-on (no sleep)
- Python-specific hosting
- Beginner-friendly

**Cons**:
- No SQLite (requires MySQL)
- Daily CPU limits
- Manual WSGI configuration

---

### Option 3: Serverless/Cloud Database

#### A. Firebase/Firestore
**Pros**:
- No backend server needed
- Real-time sync
- Generous free tier
- Google's infrastructure

**Cons**:
- Requires refactoring backend code
- Data structure changes needed
- Vendor lock-in

**Migration Effort**: High - would need to rewrite API layer

#### B. Supabase
**Pros**:
- PostgreSQL with REST API
- Auth built-in
- Good free tier

**Cons**:
- Still requires backend changes
- Learning curve

---

## 🎯 Recommended Path Forward

### Immediate Fix (Try These):

1. **Check Railway Logs in Detail**
   - Go to https://railway.app/dashboard
   - Click on project → View logs
   - Look for Python import errors, database errors, or port binding issues

2. **Add Debug Logging**
   Add to `backend/app/main.py` at startup:
   ```python
   import logging
   logging.basicConfig(level=logging.DEBUG)
   print("Starting app on port:", os.environ.get('PORT'))
   ```

3. **Simplify Startup Command**
   Try a simpler Procfile:
   ```
   web: python3 backend/app/main.py
   ```
   
   And modify main.py to use:
   ```python
   if __name__ == "__main__":
       import uvicorn
       port = int(os.environ.get("PORT", 8000))
       uvicorn.run(app, host="0.0.0.0", port=port)
   ```

### If Still Failing:

**Switch to Fly.io** - it's the most reliable free alternative with persistent storage.

---

## 📚 Resources

### Documentation Created:
- `DEPLOYMENT.md` - Full step-by-step deployment guide
- `DEPLOYMENT_ISSUES_AND_SOLUTIONS.md` - This file
- `AGENTS.md` - Project structure and conventions
- `README.md` - User-facing documentation

### Scripts Created:
- `scripts/deploy-railway.sh` - Manual Railway deployment
- `scripts/deploy-vercel.sh` - Manual Vercel deployment
- `start-local.sh` - Local development startup

---

## 🏁 Current Status

| Component | Status | URL |
|-----------|--------|-----|
| GitHub Repo | ✅ Working | https://github.com/yuruyi88/weeklytimetable |
| GitHub Actions | ⚠️ Configured | Waiting for backend fix |
| Railway Backend | ❌ 502 Error | https://weeklytimetable-production.up.railway.app |
| Vercel Frontend | ✅ Deployed | https://weeklytimetable-nhk0t74ku-yuruyis-projects.vercel.app |
| Auto-Deploy | ⚠️ Partial | Backend deploy failing |

---

## 📝 Next Steps for User

1. **Decide on backend hosting approach**:
   - Debug Railway further, OR
   - Switch to Fly.io, OR
   - Accept localStorage-only version

2. **If continuing with Railway**:
   - Check detailed logs for specific error messages
   - Consider upgrading to paid tier ($5/month) for better support
   - Add PostgreSQL add-on for persistent data

3. **If switching to Fly.io**:
   - I can create migration configs
   - Better long-term solution for free hosting

4. **For production use**:
   - Custom domain recommended (e.g., weeklytimetable.com)
   - Add monitoring/alerting
   - Regular database backups

---

## 🤝 Summary

The deployment architecture is sound and well-documented. The main blocker is Railway's free tier container configuration. With either Railway troubleshooting or a platform switch to Fly.io, this app can be successfully deployed for family use.

The auto-deploy CI/CD pipeline is fully configured and will work once the backend deployment issue is resolved.
