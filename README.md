# 🌈 Kids Weekly Timetable

A fun, colorful weekly timetable app designed for children (7+ years old). Features PIN protection for editing, works on iPhone, iPad, and web browsers as a Progressive Web App (PWA).

![Kids Timetable](https://img.shields.io/badge/Made%20for-Kids-ff6b6b)
![React](https://img.shields.io/badge/React-19-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)

## ✨ Features

- **📅 Weekly Grid View** - See the whole week at a glance
- **🔐 PIN Protection** - Secure add/edit/delete with 4-6 digit PIN
- **🎨 Kid-Friendly Design** - Bright colors, fun icons, smooth animations
- **📱 PWA Support** - Install on iPhone/iPad, works offline
- **🔄 Repeating Events** - Add events to multiple days at once
- **🔔 Notifications** - Get reminded before events (optional)
- **🌏 NZ Timezone** - Configured for New Zealand time by default

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+

### Setup

```bash
# Clone or navigate to the project
cd time_table

# Install backend dependencies
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install

# Start both servers (from project root)
cd ..
./start.sh  # Or see instructions below for manual start
```

### Manual Start

Terminal 1 - Backend:
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev -- --host
```

### Access the App

Open your browser to: `http://localhost:5173`

On your iPhone/iPad:
1. Open Safari and go to `http://your-computer-ip:5173`
2. Tap Share → Add to Home Screen
3. Launch from the home screen like a native app!

## 📱 Installing on iPhone/iPad

1. Make sure your phone and computer are on the same WiFi network
2. Find your computer's IP address (`ipconfig` on Windows, `ifconfig` on Mac/Linux)
3. Open Safari on iPhone/iPad and visit `http://<computer-ip>:5173`
4. Tap the Share button (square with arrow)
5. Scroll down and tap "Add to Home Screen"
6. Give it a name and tap "Add"

The app will now appear on your home screen and work offline!

## 🎨 Using the App

### First Time Setup
1. Open the app
2. Create a 4-6 digit PIN to protect your timetable
3. Start adding events!

### Adding Events
1. Tap the + button
2. Enter the event name
3. Choose an icon (📚⚽🎨🎵)
4. Select which days it repeats
5. Set the time
6. Choose a color
7. Save!

### Editing/Deleting
1. Tap on any event to edit
2. Make changes or tap Delete
3. Enter your PIN when prompted

### Settings
- Tap the gear icon to access settings
- Enable/disable notifications
- Change your PIN
- Lock the app

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PWA Frontend (React)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Weekly View │  │  PIN Modal  │  │  Event Edit Form    │  │
│  │ (7 Days)    │  │  (Security) │  │  (Add/Edit/Delete)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/API
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API (FastAPI + SQLite)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Events API  │  │   Auth API  │  │  Settings API       │  │
│  │ CRUD Ops    │  │  PIN Verify │  │  PIN Setup/Change   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
time_table/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py       # FastAPI app entry
│   │   ├── models.py     # Pydantic models
│   │   ├── database.py   # SQLite operations
│   │   ├── auth.py       # PIN hashing & JWT
│   │   └── routers/      # API routes
│   ├── requirements.txt
│   └── .env
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API client
│   │   └── styles/       # CSS styles
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── PROJECT_PLAN.md       # Detailed planning doc
└── README.md
```

## 🔒 Security

- PINs are hashed with bcrypt (cost factor 12)
- JWT tokens expire after 30 minutes
- Rate limiting on PIN attempts (5 attempts, 5-minute lockout)
- All edit operations require valid PIN/token

## 🛠️ Development

### Backend API

The backend exposes these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List all events |
| POST | `/api/events` | Create event (requires PIN) |
| PUT | `/api/events/{id}` | Update event (requires PIN) |
| DELETE | `/api/events/{id}` | Delete event (requires PIN) |
| POST | `/api/auth/setup` | Setup initial PIN |
| POST | `/api/auth/verify` | Verify PIN and get token |
| POST | `/api/auth/change` | Change PIN |
| GET | `/api/settings` | Get settings |
| PUT | `/api/settings` | Update settings (requires PIN) |

### Customization

**Colors**: Edit `frontend/src/styles/index.css`

**Icons**: Modify the `ICONS` array in `EventForm.tsx`

**Time slots**: Change the `HOURS` constant in `WeeklyGrid.tsx`

## 🚢 Deployment

### Self-Hosting (Raspberry Pi / Home Server)

1. Clone the repo on your server
2. Set up both backend and frontend
3. Use nginx as reverse proxy
4. Enable HTTPS with Let's Encrypt

### Cloud Deployment

**Backend**: Deploy to Railway, Render, or Fly.io
**Frontend**: Deploy to Vercel or Netlify

Remember to:
- Set strong `SECRET_KEY` in production
- Use PostgreSQL instead of SQLite for multi-instance deployments
- Enable HTTPS

## 📝 License

MIT License - Feel free to use and modify!

## 🙏 Credits

Made with ❤️ for kids everywhere.

- Icons: [Lucide](https://lucide.dev)
- Animations: [Framer Motion](https://www.framer.com/motion/)
- Confetti: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
