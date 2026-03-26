# 📤 Push to GitHub Using VS Code - Step by Step

You're already using VS Code! Here's exactly how to push your code:

## Method 1: Using VS Code Source Control (EASIEST) ⭐

### Step 1: Open Source Control Panel
- **Click** the Source Control icon in the left sidebar (3rd icon, looks like a branch/fork)
- **OR** Press: `Cmd + Shift + G` (Mac) or `Ctrl + Shift + G` (Windows)

### Step 2: Look for the Push Button
You should see one of these:
- **"Publish Branch"** button (if first time)
- **"Sync Changes"** button with up arrow
- **"..."** menu → Click it → Select **"Push"**

### Step 3: Authenticate with GitHub
When you click Push/Publish:
1. VS Code will show a popup: **"The extension 'GitHub' wants to sign in using GitHub"**
2. Click **"Allow"**
3. Your browser will open to GitHub
4. Click **"Authorize Visual-Studio-Code"**
5. Return to VS Code - it will automatically push!

### Step 4: Verify Success
- You'll see a notification: **"Successfully pushed"**
- Check: https://github.com/jaimeshoemaker110/saas-coverage-app
- All your files should be there!

---

## Method 2: Using VS Code Terminal

### Step 1: Open VS Code Terminal
- Press: `Cmd + J` (Mac) or `Ctrl + J` (Windows)
- OR Menu: **Terminal** → **New Terminal**

### Step 2: Run the Push Command
In the terminal at the bottom of VS Code, type:
```bash
cd /Users/jaimeshoemaker/Desktop/saas-coverage-app
git push -u origin main
```

### Step 3: Enter Credentials When Prompted
You'll be asked for:
- **Username**: `jaimeshoemaker110`
- **Password**: You need a **Personal Access Token** (NOT your GitHub password)

#### How to Get a Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `SaaS Coverage App`
4. Under **"Select scopes"**, check: ✅ **repo** (Full control of private repositories)
5. Scroll down and click **"Generate token"**
6. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)
7. Paste it as your password in VS Code terminal

### Step 4: Verify Success
- Terminal will show: `Branch 'main' set up to track remote branch 'main' from 'origin'`
- Check: https://github.com/jaimeshoemaker110/saas-coverage-app

---

## Method 3: Using GitHub Desktop (Alternative)

If VS Code methods don't work:

### Step 1: Install GitHub Desktop
- Download: https://desktop.github.com
- Install and open it

### Step 2: Sign In
- Click **"Sign in to GitHub.com"**
- Enter your credentials

### Step 3: Add Your Repository
- Click **"File"** → **"Add Local Repository"**
- Click **"Choose..."**
- Navigate to: `/Users/jaimeshoemaker/Desktop/saas-coverage-app`
- Click **"Add Repository"**

### Step 4: Push
- Click **"Publish repository"** or **"Push origin"** button
- Done!

---

## 🔍 Troubleshooting

### "Authentication failed"
- Make sure you're using a **Personal Access Token**, not your password
- Token must have **repo** scope checked

### "Permission denied"
- Verify you're logged into the correct GitHub account
- Check that the repository exists: https://github.com/jaimeshoemaker110/saas-coverage-app

### "Remote already exists"
- This is fine! Just proceed with the push

### Still Having Issues?
Try this in VS Code terminal:
```bash
cd /Users/jaimeshoemaker/Desktop/saas-coverage-app
git config --global credential.helper osxkeychain
git push -u origin main
```

---

## ✅ After Successful Push

1. **Verify on GitHub**: https://github.com/jaimeshoemaker110/saas-coverage-app
   - You should see all files including:
     - server.js
     - package.json
     - public/ folder
     - data/saas.db
     - render.yaml

2. **Next: Deploy to Render**
   - Go to: https://render.com
   - Sign in with GitHub
   - Create new Web Service
   - Select your repository
   - Follow `DEPLOYMENT_STEPS.md`

---

## 🎯 Quick Reference

**VS Code Keyboard Shortcuts:**
- Open Source Control: `Cmd + Shift + G`
- Open Terminal: `Cmd + J`
- Command Palette: `Cmd + Shift + P`

**Your Repository:**
- URL: https://github.com/jaimeshoemaker110/saas-coverage-app
- Username: jaimeshoemaker110

**Need Token?**
- Create at: https://github.com/settings/tokens
- Scope needed: ✅ repo

---

**You're almost there! Just one push away from deployment! 🚀**