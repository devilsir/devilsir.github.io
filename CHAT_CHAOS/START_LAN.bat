@echo off
chcp 65001 >nul
title CHAT CHAOS - LAN SERVER
cd /d "%~dp0"
echo.
echo ================================================
echo   CHAT CHAOS // STARTING CLASSROOM LAN SERVER
echo ================================================
echo.
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 server.py
) else (
  python server.py
)
echo.
pause
