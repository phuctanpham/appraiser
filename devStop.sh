#!/bin/bash

# Stop all services by port
lsof -i :8789 | awk 'NR>1 {print $2}' | xargs kill -9 2>/dev/null
lsof -i :8000 | awk 'NR>1 {print $2}' | xargs kill -9 2>/dev/null
lsof -i :3002 | awk 'NR>1 {print $2}' | xargs kill -9 2>/dev/null
lsof -i :3001 | awk 'NR>1 {print $2}' | xargs kill -9 2>/dev/null
lsof -i :3003 | awk 'NR>1 {print $2}' | xargs kill -9 2>/dev/null
lsof -i :3004 | awk 'NR>1 {print $2}' | xargs kill -9 2>/dev/null
lsof -i :3005 | awk 'NR>1 {print $2}' | xargs kill -9 2>/dev/null

# Stop all services by name/command
pkill -f "next dev"
pkill -f "uvicorn"
pkill -f "vite"
pkill -f "tsx"
pkill -f "docusaurus"
pkill -f "node"

echo "Sent stop signals to all development services."
