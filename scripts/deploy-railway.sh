#!/bin/bash

# Deploy script for Railway backend

echo "🚀 Deploying Kids Timetable Backend to Railway..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}Please login to Railway:${NC}"
    railway login
fi

cd backend

# Check if project is linked
if [ ! -f .railway/config.json ]; then
    echo -e "${YELLOW}Initializing Railway project...${NC}"
    railway init
fi

echo -e "${BLUE}Deploying to Railway...${NC}"
railway up

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Your backend URL:"
railway domain
echo ""
echo "To view logs: railway logs"
echo "To open dashboard: railway open"
