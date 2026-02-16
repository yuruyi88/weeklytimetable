#!/bin/bash

# Deploy script for Vercel frontend

echo "▲ Deploying Kids Timetable Frontend to Vercel..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}Please login to Vercel:${NC}"
    vercel login
fi

cd frontend

# Check if project is linked
if [ ! -d .vercel ]; then
    echo -e "${YELLOW}Linking Vercel project...${NC}"
    vercel link
fi

echo -e "${BLUE}Deploying to Vercel...${NC}"
vercel --prod

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
