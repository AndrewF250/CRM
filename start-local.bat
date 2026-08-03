@echo off
setlocal
cd /d "%~dp0server"

echo.
echo === CRM WebAgency local server ===
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install Node.js and try again.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo Installing dependencies...
    call npm.cmd install
    if errorlevel 1 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3005" ^| findstr "LISTENING"') do (
    echo Port 3005 is busy - killing PID %%a ...
    taskkill /F /PID %%a >nul 2>&1
)

echo Starting: http://localhost:3005
echo Keep this window open. Stop with Ctrl+C
echo.
node server.js
if errorlevel 1 (
    echo.
    echo [ERROR] Server exited with error.
    pause
)

endlocal