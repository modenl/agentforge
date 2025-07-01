#!/bin/bash

# Launch the framework app in development mode
# Usage: ./launch-dev.sh <app-path>

if [ -z "$1" ]; then
    echo "Usage: $0 <app-path>"
    echo "Example: $0 ../apps/chess-game"
    exit 1
fi

# Set development environment variables
export NODE_ENV=development
export DEV_MODE=true

# Enable Electron debugging
export ELECTRON_ENABLE_LOGGING=1
export ELECTRON_LOG_LEVEL=debug

echo "🚀 Launching app in development mode..."
echo "📁 App path: $1"
echo "🔧 NODE_ENV: $NODE_ENV"
echo "🔧 DEV_MODE: $DEV_MODE"

# Launch with Electron
npx electron launcher.js "$1"