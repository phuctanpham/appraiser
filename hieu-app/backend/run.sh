#!/bin/bash

# Exit on error
set -e

# Create and activate virtual environment if it doesn't exist
if [ ! -d "../../venv" ]; then
  python3 -m venv ../../venv
fi

# Activate the virtual environment
source ../../venv/bin/activate

# Install/update dependencies
pip install -r requirements.txt

# Run the application
exec uvicorn main:app --host 0.0.0.0 --port 8000
