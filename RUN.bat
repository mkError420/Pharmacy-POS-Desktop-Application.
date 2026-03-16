@echo off
title Pharmacy POS
echo Starting Pharmacy POS...
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

:: Start the application
echo Starting Pharmacy POS...
npm run electron

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start Pharmacy POS
    echo Make sure all dependencies are installed properly
    pause
)
