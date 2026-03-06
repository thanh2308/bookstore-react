@echo off
REM Web Bán Sách - Quick Start Script for Windows

echo 🚀 Starting Web Bán Sách Development Environment...

REM Check if MongoDB is running
echo 📊 Checking MongoDB...
sc query MongoDB | find "RUNNING" > nul
if errorlevel 1 (
    echo ⚠️  MongoDB is not running. Starting MongoDB...
    net start MongoDB
    if errorlevel 1 (
        echo ❌ Failed to start MongoDB. Please start it manually.
        pause
        exit /b 1
    )
)
echo ✅ MongoDB is running

REM Start Backend
echo.
echo 🔧 Starting Backend Server...
cd server

if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    call npm install
)

if not exist ".env" (
    echo ⚙️  Creating .env file from .env.example...
    copy .env.example .env
    echo ⚠️  Please update .env with your configuration!
)

start "Backend Server" cmd /k npm run dev

REM Wait for backend to start
timeout /t 3 /nobreak > nul

REM Start Frontend
cd ..
echo.
echo 🎨 Starting Frontend...

if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install
)

if not exist ".env" (
    echo ⚙️  Creating .env file from .env.example...
    copy .env.example .env
)

start "Frontend Server" cmd /k npm run dev

echo.
echo =========================================
echo 🎉 Development environment is ready!
echo =========================================
echo 📱 Frontend: http://localhost:5173
echo 🔌 Backend API: http://localhost:5000
echo 📊 MongoDB: mongodb://localhost:27017
echo.
echo ℹ️  Two terminal windows have been opened:
echo    - Backend Server (running on port 5000)
echo    - Frontend Server (running on port 5173)
echo.
echo Press any key to exit this window...
echo =========================================
pause > nul
