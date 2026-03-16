@echo off
echo ============================================
echo    Pharmacy POS - Installation Script
echo ============================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from https://nodejs.org
    echo Download the LTS version and restart your computer
    echo.
    pause
    exit /b 1
)

echo ✓ Node.js is installed
echo.

:: Check current directory
echo Current directory: %CD%
echo.

:: Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please make sure you're running this script in the Pharmacy POS folder
    echo.
    pause
    exit /b 1
)

echo ✓ package.json found
echo.

:: Clean previous installation
echo Cleaning previous installation...
if exist "node_modules" (
    echo Removing old node_modules...
    rmdir /s /q "node_modules" >nul 2>&1
)

if exist "package-lock.json" (
    echo Removing old package-lock.json...
    del "package-lock.json" >nul 2>&1
)

echo ✓ Previous installation cleaned
echo.

:: Install dependencies
echo Installing application dependencies...
echo This may take a few minutes, please wait...
echo.

npm install --verbose
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies
    echo.
    echo Possible solutions:
    echo 1. Run as Administrator
    echo 2. Check your internet connection
    echo 3. Try running: npm cache clean --force
    echo 4. Restart your computer and try again
    echo.
    pause
    exit /b 1
)

echo ✓ Dependencies installed successfully
echo.

:: Create database directory
echo Creating database directory...
if not exist "database" (
    mkdir "database"
    echo ✓ Database directory created
) else (
    echo ✓ Database directory already exists
)
echo.

:: Create desktop shortcut
echo Creating desktop shortcut...
set "shortcut=%USERPROFILE%\Desktop\Pharmacy POS.lnk"
set "target=%CD%\electron\main.js"
set "workDir=%CD%"

powershell -Command "& {$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%shortcut%'); $Shortcut.TargetPath = 'node'; $Shortcut.Arguments = 'electron\main.js'; $Shortcut.WorkingDirectory = '%workDir%'; $Shortcut.IconLocation = 'node.exe,0'; $Shortcut.Save()}"

if %errorlevel% equ 0 (
    echo ✓ Desktop shortcut created
) else (
    echo ⚠ Warning: Could not create desktop shortcut
)
echo.

:: Create start menu shortcut
echo Creating Start Menu shortcut...
set "startMenu=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Pharmacy POS.lnk"

powershell -Command "& {$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%startMenu%'); $Shortcut.TargetPath = 'node'; $Shortcut.Arguments = 'electron\main.js'; $Shortcut.WorkingDirectory = '%workDir%'; $Shortcut.IconLocation = 'node.exe,0'; $Shortcut.Save()}"

if %errorlevel% equ 0 (
    echo ✓ Start Menu shortcut created
) else (
    echo ⚠ Warning: Could not create Start Menu shortcut
)
echo.

:: Test installation
echo Testing installation...
echo.

:: Check if critical files exist
set "allFilesExist=true"

if not exist "electron\main.js" (
    echo ✗ Missing: electron\main.js
    set "allFilesExist=false"
)

if not exist "src\App.jsx" (
    echo ✗ Missing: src\App.jsx
    set "allFilesExist=false"
)

if not exist "database" (
    echo ✗ Missing: database directory
    set "allFilesExist=false"
)

if "%allFilesExist%"=="true" (
    echo ✓ All critical files found
) else (
    echo ⚠ Warning: Some critical files are missing
)
echo.

:: Create test script
echo Creating test script...
echo @echo off > "TEST.bat"
echo echo Testing Pharmacy POS... >> "TEST.bat"
echo echo. >> "TEST.bat"
echo npm run electron >> "TEST.bat"
echo if %%errorlevel%% neq 0 ( >> "TEST.bat"
echo     echo. >> "TEST.bat"
echo     echo ERROR: Failed to start Pharmacy POS >> "TEST.bat"
echo     echo Please check the error message above >> "TEST.bat"
echo     pause >> "TEST.bat"
echo ) >> "TEST.bat"

echo ✓ Test script created: TEST.bat
echo.

echo ============================================
echo    Installation Complete!
echo ============================================
echo.
echo Installation successful! Here's what you can do:
echo.
echo 1. RUN THE APPLICATION:
echo    - Double-click the desktop shortcut "Pharmacy POS"
echo    - Or double-click "TEST.bat" in this folder
echo    - Or run: npm run electron
echo.
echo 2. IF YOU SEE ERRORS:
echo    - Check the console messages for details
echo    - Make sure Node.js is properly installed
echo    - Try running as Administrator
echo.
echo 3. DATABASE:
echo    - The database will be created automatically
echo    - Sample medicines will be loaded on first run
echo    - Database location: database\pharmacy.db
echo.
echo 4. TROUBLESHOOTING:
echo    - If the app doesn't start, check the console output
echo    - Make sure all files are in the correct folder
echo    - Try running "npm run electron-dev" for development mode
echo.
echo The application is ready to use!
echo.
pause
