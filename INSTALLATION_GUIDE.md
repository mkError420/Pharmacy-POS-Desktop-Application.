# Pharmacy POS - Installation Guide

## 🚀 Quick Installation (Recommended)

### Method 1: Automatic Installation
1. **Copy the entire `pharmacy-pos` folder** to the target PC
2. **Double-click `INSTALL.bat`** - This will:
   - Check for Node.js
   - Install all dependencies
   - Create desktop and Start Menu shortcuts
   - Ready to use!

### Method 2: Manual Installation
1. **Copy the entire `pharmacy-pos` folder** to the target PC
2. **Install Node.js** (if not already installed):
   - Download from: https://nodejs.org
   - Install the LTS version
3. **Open Command Prompt** in the pharmacy-pos folder
4. **Run:** `npm install`
5. **Run:** `npm run electron`

## 📋 System Requirements

### Required Software
- **Node.js** (version 14 or higher)
  - Download: https://nodejs.org
  - Choose the "LTS" version
  - Restart PC after installation

### Hardware Requirements
- **Windows 10/11** (64-bit recommended)
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 500MB free space
- **Processor:** Any modern CPU

## 🖥️ Running the Application

### After Installation

#### Option 1: Use Shortcuts
- **Desktop Shortcut:** Double-click "Pharmacy POS" on desktop
- **Start Menu:** Go to Start Menu → Pharmacy POS

#### Option 2: Command Line
```bash
# Open Command Prompt in pharmacy-pos folder
npm run electron
```

#### Option 3: Quick Run
- **Double-click `RUN.bat`** in the pharmacy-pos folder

## 🗄️ Database Setup

### Automatic Setup
- The database is created automatically on first run
- Sample medicines are loaded automatically
- No additional setup required

### Database Location
- **File:** `database/pharmacy.db`
- **Type:** SQLite (local, offline)
- **Backup:** Simply copy the `database/pharmacy.db` file

## 🔧 Troubleshooting

### Common Issues

#### "Node.js not found"
**Solution:**
1. Download and install Node.js from https://nodejs.org
2. Restart your computer
3. Try again

#### "npm command not found"
**Solution:**
1. Make sure Node.js is installed properly
2. Restart Command Prompt
3. Try `node --version` to check installation

#### "Dependencies missing"
**Solution:**
1. Open Command Prompt in pharmacy-pos folder
2. Run `npm install`
3. Wait for installation to complete

#### "Port 3000 in use"
**Solution:**
1. Close other applications using port 3000
2. Or restart your computer
3. Try again

#### "Application won't start"
**Solution:**
1. Check if Node.js is installed: `node --version`
2. Check if dependencies are installed: `dir node_modules`
3. Reinstall dependencies: `npm install`
4. Try running: `npm run electron`

### Getting Help

1. **Check Console Logs:** Open Developer Tools (F12) for error messages
2. **Verify Installation:** Make sure all files are copied correctly
3. **Restart Computer:** Sometimes a simple restart fixes issues
4. **Reinstall:** Delete `node_modules` folder and run `npm install` again

## 📱 Features After Installation

Once installed, you'll have access to:
- **Dashboard:** Sales summary and alerts
- **Products:** Medicine management
- **POS:** Fast billing interface
- **Reports:** Sales and inventory reports
- **PDF Generation:** Invoice printing and reports

## 🔄 Updates

### Updating the Application
1. **Copy new files** over existing installation
2. **Run:** `npm install` (if dependencies changed)
3. **Start application** normally

### Data Backup
- **Backup Database:** Copy `database/pharmacy.db`
- **Backup Settings:** Copy entire `pharmacy-pos` folder

## 📞 Support

For additional help:
1. Check this guide first
2. Review error messages in the console
3. Make sure Node.js is properly installed
4. Verify all files are present in the folder

---

**Note:** This application works completely offline once installed. No internet connection is required for normal operation.
