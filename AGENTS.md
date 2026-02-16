# AGENTS.md - Kids Timetable

> This file provides essential context about the project structure, technology stack, and development conventions.

## Project Overview

**Project Name:** Kids Weekly Timetable  
**Description:** A fun, colorful weekly timetable app for children (7+) with PIN protection  
**Status:** Ready for Development  
**Last Updated:** 2026-02-16

## Technology Stack

### Backend
- **Framework:** FastAPI (Python)
- **Database:** SQLite (single file)
- **Authentication:** bcrypt + JWT tokens
- **Server:** Uvicorn (ASGI)

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** TailwindCSS 4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **PWA:** vite-plugin-pwa

### Key Features
- PIN-protected add/edit/delete operations
- Repeating events (multiple days)
- NZ timezone support (Pacific/Auckland)
- PWA (works offline, installable on iOS)
- Push notifications (optional)
- Confetti celebrations on event creation

## Project Structure

```
time_table/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py       # FastAPI entry point
│   │   ├── models.py     # Pydantic models
│   │   ├── database.py   # SQLite operations
│   │   ├── auth.py       # PIN hashing, JWT
│   │   └── routers/      # API routes (events, auth, settings)
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
├── start.sh              # Startup script
├── PROJECT_PLAN.md       # Detailed planning doc
└── README.md             # User documentation
```

## Development Commands

```bash
# Start everything
./start.sh

# Manual - Backend
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Manual - Frontend
cd frontend
npm run dev -- --host
```

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/events` | No | List all events |
| POST | `/api/events` | Yes | Create event |
| PUT | `/api/events/{id}` | Yes | Update event |
| DELETE | `/api/events/{id}` | Yes | Delete event |
| POST | `/api/auth/setup` | No | Initial PIN setup |
| POST | `/api/auth/verify` | No | Verify PIN, get token |
| POST | `/api/auth/change` | Yes | Change PIN |
| GET | `/api/settings` | No | Get settings |
| PUT | `/api/settings` | Yes | Update settings |

## Security

- PINs hashed with bcrypt (rounds=12)
- JWT tokens expire after 30 minutes
- Rate limiting: 5 failed attempts = 5 min lockout
- PIN length: 4-6 digits

## Design System

### Colors (Kid-Friendly)
- Primary: `#FF6B6B` (Coral Red)
- Secondary: `#4ECDC4` (Turquoise)
- Accent: `#FFE66D` (Sunny Yellow)
- Success: `#95E1D3` (Mint Green)
- Background: `#F7F9FC` (Soft Blue-Gray)

### Event Colors
- School: `#3B82F6` (Blue)
- Sport: `#10B981` (Green)
- Art: `#F59E0B` (Orange)
- Music: `#8B5CF6` (Purple)
- Play: `#EC4899` (Pink)

### Icons
- 15 emoji options: 📚⚽🎨🎵🎮🏊🚴🍽️🛌🎒🏫🎬🎪⭐💡

## Environment Variables

Backend `.env`:
```
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./timetable.db
```

## Notes for AI Agents

1. **Always run backend with host binding** (`--host 0.0.0.0`) for mobile device access
2. **NZ Timezone is default** - all times displayed in Pacific/Auckland
3. **PWA requires HTTPS** in production for notifications to work
4. **Keep UI kid-friendly** - large touch targets, bright colors, fun animations
5. **Test on mobile** - primary use case is iPhone/iPad
6. **PIN flows are critical** - make sure auth state is handled properly

## Testing Checklist

- [ ] Can create PIN on first launch
- [ ] Can add event with title, time, days, color, icon
- [ ] Can edit event (requires PIN)
- [ ] Can delete event (requires PIN)
- [ ] Events display on correct days
- [ ] Mobile view shows single day with day selector
- [ ] Desktop shows 7-column grid
- [ ] Confetti appears on new event creation
- [ ] Settings panel opens/closes correctly
- [ ] Notifications can be enabled (if supported by browser)
- [ ] App works offline after initial load (PWA)
- [ ] Can install on iOS home screen
