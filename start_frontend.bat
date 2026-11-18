@echo off
title TradeNexus - Frontend Dev Server
echo ========================================================
echo   Starting TradeNexus Frontend (Vite on Port 5173)
echo ========================================================
cd /d "%~dp0frontend"
call npm run dev
pause
