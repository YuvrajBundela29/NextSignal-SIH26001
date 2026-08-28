@echo off
title NextSignal Intelligence Platform Launcher
cd /d "y:\Dev\projects\nextsignal"

:: 1. Check if Ollama is running, if not try to launch it in background
curl.exe -s -o NUL http://127.0.0.1:11434/api/tags
if %errorlevel% neq 0 (
    start "" /b ollama serve >nul 2>&1
)

:: 2. Check if NextSignal server is running on port 3000
curl.exe -s -o NUL http://127.0.0.1:3000
if %errorlevel% neq 0 (
    echo Starting NextSignal Intelligence Server...
    start "NextSignal Server" /min cmd.exe /c "npm run dev -- --host 127.0.0.1 --port 3000"
    ping 127.0.0.1 -n 4 >nul
)

:: 3. Open NextSignal in default browser
start "" "http://127.0.0.1:3000"
exit
