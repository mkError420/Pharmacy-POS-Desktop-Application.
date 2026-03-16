@echo off
echo ============================================
echo    Pharmacy POS - Installation Script
echo ============================================
echo.
echo This script will install Pharmacy POS on your PC
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    echo Then run this script again.
    pause
    exit /b 1
)

echo ✓ Node.js is installed
echo.

:: Install dependencies
echo Installing application dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo ✓ Dependencies installed successfully
echo.

:: Create desktop shortcut
echo Creating desktop shortcut...
set "shortcut=%USERPROFILE%\Desktop\Pharmacy POS.lnk"
set "target=%cd%\electron\main.js"
set "workDir=%cd%"

powershell "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%shortcut%'); $s.TargetPath = 'node'; $s.Arguments = 'electron\main.js'; $s.WorkingDirectory = '%workDir%'; $s.IconLocation = 'node.exe'; $s.Save()"

echo ✓ Desktop shortcut created
echo.

:: Create start menu shortcut
echo Creating Start Menu shortcut...
set "startMenu=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Pharmacy POS.lnk"

powershell "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%startMenu%'); $s.TargetPath = 'node'; $s.Arguments = 'electron\main.js'; $s.WorkingDirectory = '%workDir%'; $s.IconLocation = 'node.exe'; $s.Save()"

echo ✓ Start Menu shortcut created
echo.

echo ============================================
echo    Installation Complete!
echo ============================================
echo.
echo You can now run Pharmacy POS using:
echo 1. Desktop shortcut
echo 2. Start Menu shortcut
echo 3. Command: npm run electron
echo.
echo The application will create its database automatically
echo on first run.
echo.
pause
