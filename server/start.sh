#!/bin/bash

echo "🚀 Starting BISUM Conference Server..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.example to .env and configure your environment variables."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if MongoDB is running (basic check)
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  Warning: MongoDB might not be running."
    echo "Please ensure MongoDB is started before running the server."
fi

echo "✅ Starting server in development mode..."
npm run dev

