# Kids Weekly Timetable - Project Plan

## Overview
A fun, colorful weekly timetable app designed for children (7+ years old) with PIN protection for editing. Works as a Progressive Web App (PWA) on iPhone, iPad, and web browsers.

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLite** - Lightweight database for events and settings
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **python-dotenv** - Environment configuration

### Frontend
- **React 19** - UI framework
- **Vite 6** - Build tool
- **TypeScript** - Type safety
- **TailwindCSS 4** - Styling
- **Framer Motion** - Fun animations for kids
- **Lucide React** - Icons
- **date-fns** - Date/time handling (NZ timezone)
- **PWA** - Works offline, installable on iOS/Android

### Security
- PIN code hashing with bcrypt
- JWT tokens for session management
- Rate limiting on PIN attempts

## Architecture

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

## Features

### Core Features
1. **Weekly Grid View**
   - 7 columns (Monday-Sunday)
   - Time slots (configurable, default 7am - 8pm)
   - Events shown as colorful cards
   - Tap to view details

2. **Event Management**
   - Add new events with title, time, days, color, icon
   - Edit existing events
   - Delete events
   - Repeat events on multiple days
   - Drag-and-drop to reschedule (optional)

3. **PIN Security**
   - Initial setup: Create 4-6 digit PIN
   - Required for: Add, Edit, Delete operations
   - Optional: View-only mode without PIN
   - PIN can be changed (requires old PIN)
   - Rate limiting: 5 attempts, then 5-minute lockout

4. **Kid-Friendly Design**
   - Bright, cheerful colors
   - Emoji icons for events (🏫📚⚽🎨🎮)
   - Smooth animations (Framer Motion)
   - Large touch targets for small fingers
   - Confetti celebration when completing tasks

5. **PWA Features**
   - Works offline (service worker)
   - Add to Home Screen on iOS/Android
   - Responsive design (mobile-first)
   - Sync when back online

### Bonus Features
6. **Notifications**
   - Browser notifications for upcoming events
   - 5/15/30 minute reminders
   - Requires user permission

7. **Settings**
   - Change PIN
   - Toggle notifications
   - Set timezone (default Pacific/Auckland)
   - Theme selection

## Database Schema

```sql
-- Events table
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    start_time TEXT NOT NULL,  -- HH:MM format
    end_time TEXT,             -- HH:MM format
    days TEXT NOT NULL,        -- JSON array [0,1,2,3,4,5,6] (0=Monday)
    color TEXT DEFAULT '#3B82F6',
    icon TEXT DEFAULT '📅',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table (single row)
CREATE TABLE settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    pin_hash TEXT NOT NULL,
    timezone TEXT DEFAULT 'Pacific/Auckland',
    notifications_enabled BOOLEAN DEFAULT 0,
    theme TEXT DEFAULT 'default'
);
```

## API Endpoints

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create event (requires PIN)
- `PUT /api/events/{id}` - Update event (requires PIN)
- `DELETE /api/events/{id}` - Delete event (requires PIN)

### Auth
- `POST /api/auth/verify-pin` - Verify PIN
- `POST /api/auth/setup-pin` - Initial PIN setup
- `POST /api/auth/change-pin` - Change PIN

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings (requires PIN)

## UI/UX Design

### Color Palette (Kid-Friendly)
- Primary: `#FF6B6B` (Coral Red)
- Secondary: `#4ECDC4` (Turquoise)
- Accent: `#FFE66D` (Sunny Yellow)
- Success: `#95E1D3` (Mint Green)
- Background: `#F7F9FC` (Soft Blue-Gray)
- Card: `#FFFFFF`
- Text: `#2D3748`

### Event Colors
- School: `#3B82F6` (Blue)
- Sport: `#10B981` (Green)
- Art: `#F59E0B` (Orange)
- Music: `#8B5CF6` (Purple)
- Play: `#EC4899` (Pink)
- Chore: `#6B7280` (Gray)

### Layout
- Mobile: Single day view with swipe navigation
- Tablet/Desktop: 7-column weekly grid
- Header: Current week range + settings button
- FAB (Floating Action Button): Add event

### Animations
- Page transitions: Slide/fade
- Button presses: Scale down
- Event cards: Staggered entrance
- Success: Confetti burst

## NZ Timezone Handling
- Default: `Pacific/Auckland`
- Use date-fns-tz for conversions
- Store times as HH:MM (local time)
- Handle daylight saving automatically

## Security Considerations
1. PIN hashed with bcrypt (cost factor 12)
2. JWT tokens expire after 30 minutes
3. Rate limiting on PIN attempts
4. HTTPS in production
5. Input validation on all endpoints

## Project Structure

```
time_table/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI app
│   │   ├── database.py       # SQLite connection
│   │   ├── models.py         # Pydantic models
│   │   ├── auth.py           # PIN hashing, JWT
│   │   └── routers/
│   │       ├── events.py     # Event CRUD
│   │       ├── auth.py       # PIN verification
│   │       └── settings.py   # App settings
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── WeeklyGrid.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventForm.tsx
│   │   │   ├── PINModal.tsx
│   │   │   └── Confetti.tsx
│   │   ├── hooks/
│   │   │   ├── useEvents.ts
│   │   │   ├── useAuth.ts
│   │   │   └── useNotifications.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── styles/
│   │       └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── manifest.json         # PWA manifest
│   └── package.json
├── PROJECT_PLAN.md
├── README.md
└── AGENTS.md
```

## Development Phases

### Phase 1: Backend Foundation
- [ ] Set up FastAPI project
- [ ] Create database models
- [ ] Implement event CRUD API
- [ ] Implement PIN auth system

### Phase 2: Frontend Core
- [ ] Set up React + Vite + Tailwind
- [ ] Create weekly grid view
- [ ] Implement event display
- [ ] Add event form (create/edit)

### Phase 3: Security & UX
- [ ] PIN modal component
- [ ] Protected routes/operations
- [ ] Kid-friendly styling
- [ ] Animations

### Phase 4: PWA & Polish
- [ ] Service worker
- [ ] Manifest.json
- [ ] Offline support
- [ ] iOS icons/splash screens

### Phase 5: Bonus Features
- [ ] Push notifications
- [ ] Sound effects
- [ ] Export/backup

## Running Locally

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm install
npm run dev -- --host
# Access on: http://localhost:5173
```

## Production Deployment

### Option 1: Self-Hosted (Raspberry Pi/Home Server)
- Run both backend and frontend on same device
- Use nginx as reverse proxy
- Let's Encrypt for HTTPS

### Option 2: Cloud
- Backend: Railway/Render/Fly.io
- Frontend: Vercel/Netlify
- SQLite → PostgreSQL (if needed)

## Next Steps
1. Scaffold the project structure
2. Build backend API
3. Build frontend UI
4. Test on iPhone/iPad
5. Deploy

---

*This plan is a living document. Update as needed during development.*
