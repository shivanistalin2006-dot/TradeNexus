@echo off
title TradeNexus - Backend Server
echo ========================================================
echo   Starting TradeNexus Backend (FastAPI on Port 8000)
echo ========================================================
cd /d "%~dp0backend"
python main.py
pause
