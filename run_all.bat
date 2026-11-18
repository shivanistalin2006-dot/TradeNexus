@echo off
title TradeNexus - Application Launcher
echo ===================================================================
echo     TradeNexus - Smart Global Buyer Discovery & Outreach
echo     Theme: Simple Olive Green
echo     Made with ❤️ by Shivani Stalin
echo ===================================================================
echo.
echo 1. Launching Backend FastAPI Service (Port 8000)...
start "TradeNexus - Backend" cmd /c "cd /d "%~dp0backend" && python main.py"

echo 2. Launching Frontend Dev Service (Port 5173)...
start "TradeNexus - Frontend" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Services launched successfully!
echo.
echo - Frontend Dashboard: http://localhost:5173
echo - Unified Production: http://localhost:8000
echo - Swagger API Docs:   http://localhost:8000/docs
echo.
echo Opening TradeNexus in your default browser in 3 seconds...
timeout /t 3 >nul
start http://localhost:5173
echo.
pause
