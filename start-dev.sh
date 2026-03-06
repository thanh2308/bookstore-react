#!/bin/bash

# Web Bán Sách - Quick Start Script

echo "🚀 Starting Web Bán Sách Development Environment..."

# Check if MongoDB is running
echo "📊 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null
then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   Windows: net start MongoDB"
    echo "   macOS: brew services start mongodb-community"
    echo "   Linux: sudo systemctl start mongod"
    exit 1
fi

echo "✅ MongoDB is running"

# Start Backend
echo "🔧 Starting Backend Server..."
cd server
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration!"
fi

npm run dev &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait for backend to start
sleep 3

# Start Frontend
echo "🎨 Starting Frontend..."
cd ..
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from .env.example..."
    cp .env.example .env
fi

npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "========================================="
echo "🎉 Development environment is ready!"
echo "========================================="
echo "📱 Frontend: http://localhost:5173"
echo "🔌 Backend API: http://localhost:5000"
echo "📊 MongoDB: mongodb://localhost:27017"
echo ""
echo "Press Ctrl+C to stop all services"
echo "========================================="

# Handle Ctrl+C
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Wait
wait
