# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Node.js

If you don't have Node.js installed yet:

```bash
# Install using Homebrew (recommended)
brew install node

# OR download from https://nodejs.org/
```

Verify installation:
```bash
node --version
npm --version
```

### Step 2: Install Dependencies & Import Data

```bash
# Navigate to project directory
cd /Users/jaimeshoemaker/Desktop/saas-coverage-app

# Install required packages
npm install

# Import data from Excel to database
npm run import
```

You should see output like:
```
Loaded 95 rows from SaaS Base
Loaded 33 rows from Data Targets
Loaded 22 rows from Auto Targets
Tables created successfully
...
Data import completed successfully!
```

### Step 3: Start the Application

```bash
# Start the server
npm start
```

You should see:
```
========================================
SaaS Coverage Lookup Application
========================================
Server running at: http://localhost:3000
...
```

### Step 4: Open in Browser

Open your web browser and go to:
```
http://localhost:3000
```

## 🎯 Using the Application

1. **Select a Coverage ID** from the dropdown menu
2. **Click "Search"** to view results
3. **View the results**:
   - Data Target and Auto Target values
   - List of customers and their products
   - Summary statistics
4. **Export data** using the CSV or Excel buttons

## 📊 Example Coverage IDs to Try

Based on your data, here are some coverage IDs you can search:

- `I0008502` - ABBOTT LABORATORIES
- `A0004318` - Multiple customers (CITY OF ATLANTA, etc.)
- `I0008528` - STATE OF FLORIDA (multiple products)
- `A0009120` - THE PENNSYLVANIA STATE UNIVERSITY

## 🛑 Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## ❓ Need Help?

- See `README.md` for detailed documentation
- Check `INSTALL_NODEJS.md` for Node.js installation help
- Review the Troubleshooting section in README.md

## 📁 Project Files

All your application files are in:
```
/Users/jaimeshoemaker/Desktop/saas-coverage-app/
```

The database is created at:
```
/Users/jaimeshoemaker/Desktop/saas-coverage-app/data/saas.db