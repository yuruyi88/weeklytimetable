#!/bin/bash

# Kids Timetable Startup Script
# This script starts both the backend and frontend servers

echo "🌈 Starting Kids Timetable..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if backend venv exists
if [ ! -d "backend/.venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    cd backend
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Check if frontend node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    cd ..
fi

echo -e "${BLUE}Starting Backend Server...${NC}"
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

echo -e "${BLUE}Starting Frontend Server...${NC}"
cd frontend
npm run dev -- --host &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Both servers are running!${NC}"
echo ""
echo -e "📱 Frontend: ${YELLOW}http://localhost:5173${NC}"
echo -e "🔌 Backend:  ${YELLOW}http://localhost:8000${NC}"
echo -e "📚 API Docs: ${YELLOW}http://localhost:8000/docs${NC}"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT
wait
