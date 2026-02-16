# 🚀 Deployment Guide: Railway + Vercel

This guide explains how to deploy the Kids Timetable app using **Railway** (backend) + **Vercel** (frontend).

---

## 📋 Prerequisites

1. **GitHub account** (for code hosting)
2. **Railway account** (https://railway.app) - login with GitHub
3. **Vercel account** (https://vercel.com) - login with GitHub
4. **Git** installed locally

---

## 🛤️ Step 1: Deploy Backend to Railway

### 1.1 Push Code to GitHub

```bash
# From project root
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/kids-timetable.git
git push -u origin main
```

### 1.2 Deploy to Railway

**Option A: Railway Dashboard (Recommended)**

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `kids-timetable` repository
5. Railway will auto-detect the Python app
6. Add environment variables (see below)
7. Deploy!

**Option B: Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### 1.3 Set Environment Variables

In Railway Dashboard → Your Project → Variables:

```
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./timetable.db
PORT=8000
```

> ⚠️ **Important:** Generate a strong `SECRET_KEY`:
> ```bash
> python3 -c "import secrets; print(secrets.token_hex(32))"
> ```

### 1.4 Verify Backend

Once deployed, Railway will give you a URL like:
`https://kids-timetable-backend.up.railway.app`

Test it:
```bash
curl https://your-railway-url.up.railway.app/health
# Should return: {"status":"healthy"}
```

**Copy this URL** - you'll need it for the frontend.

---

## ▲ Step 2: Deploy Frontend to Vercel

### 2.1 Update Frontend API URL

In `frontend/.env.local`:
```
VITE_API_URL=https://your-railway-url.up.railway.app
```

### 2.2 Deploy to Vercel

**Option A: Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variables:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app
   ```
6. Deploy!

**Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# From frontend directory
cd frontend
vercel --prod

# Set environment variable
vercel env add VITE_API_URL
# Enter: https://your-railway-url.up.railway.app
```

---

## 🔗 Step 3: Enable CORS (Important!)

Your Railway backend needs to allow requests from your Vercel frontend.

### Update Railway Environment Variable

In Railway Dashboard → Variables, add:

```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Update Backend CORS (if needed)

The backend already has CORS set to allow all origins (`["*"]`), which is fine for this app. But for production security, you may want to restrict it:

Edit `backend/app/main.py`:
```python
# Replace:
allow_origins=["*"]
# With:
allow_origins=[os.environ.get("FRONTEND_URL", "*")]
```

Then redeploy to Railway.

---

## 📱 Step 4: Test on Mobile

1. Open your Vercel URL on iPhone/iPad
2. Create a PIN
3. Add test events
4. **Add to Home Screen** for app-like experience!

---

## 🔄 Redeployment

### Backend Changes
```bash
# Push to GitHub
git add .
git commit -m "Update backend"
git push

# Railway auto-deploys!
```

### Frontend Changes
```bash
# Push to GitHub
git add .
git commit -m "Update frontend"
git push

# Vercel auto-deploys!
```

---

## 🛠️ Troubleshooting

### Backend won't start
```bash
# Check Railway logs
railway logs
```

Common issues:
- Missing `PORT` environment variable
- Wrong Python version (should be 3.9+)

### Frontend can't connect to backend
1. Check `VITE_API_URL` is set correctly
2. Verify CORS is enabled
3. Test backend URL directly in browser

### Database issues
Railway's filesystem is ephemeral (resets on redeploy). For persistent data:
- **Option A:** Use Railway's PostgreSQL add-on ($5/month)
- **Option B:** Accept that data resets (fine for testing)
- **Option C:** Use Fly.io instead (has persistent volumes on free tier)

---

## 💰 Cost Estimate

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| Railway | Free | $0 | 500 hrs/month, sleeps when idle |
| Vercel | Hobby | $0 | Generous free tier |
| **Total** | | **$0** | Perfect for family use! |

If you need always-on (no sleeping):
- Railway Starter: $5/month
- Or use Fly.io free tier with tricks

---

## 🎉 Success!

Your Kids Timetable is now live!
- **Backend:** https://your-app.up.railway.app
- **Frontend:** https://your-app.vercel.app

Share the Vercel URL with family members - they can access it from any device!
