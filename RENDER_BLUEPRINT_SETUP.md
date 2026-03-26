# 🔧 Fix Render Deployment - Use Blueprint

The issue is that Render was configured manually and is ignoring the render.yaml file. Follow these steps to fix it:

## Step 1: Delete the Current Service

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click on your service** (saas-coverage-app)
3. **Click "Settings"** tab (top navigation)
4. **Scroll to the bottom** of the settings page
5. **Click "Delete Web Service"** (red button)
6. **Type the service name** to confirm
7. **Click "Delete"**

## Step 2: Create New Service Using Blueprint

### Method A: From Dashboard (Recommended)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** button (top right)
3. **Select "Blueprint"** (NOT "Web Service")
4. **Connect your repository**:
   - If not connected, click "Connect account"
   - Find and select: `jaimeshoemaker110/saas-coverage-app`
   - Click "Connect"
5. **Render will detect render.yaml**:
   - You'll see: "Found render.yaml in repository"
   - Service name: `saas-coverage-app`
   - Type: `Web Service`
   - Runtime: `Node`
6. **Review the configuration**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Disk: `saas-data` mounted at `/opt/render/project/src/data`
7. **Click "Apply"** or "Create"
8. **Wait for deployment** (2-5 minutes)

### Method B: Direct Blueprint URL

Alternatively, use this direct link:
1. Go to: https://dashboard.render.com/select-repo?type=blueprint
2. Select your repository: `jaimeshoemaker110/saas-coverage-app`
3. Follow steps 5-8 above

## Step 3: Verify Deployment

### Watch the Build Logs
You should see:
```
==> Cloning from https://github.com/jaimeshoemaker110/saas-coverage-app...
==> Detected Node.js app
==> Installing dependencies
==> Running 'npm install'
==> Build successful
==> Starting service with 'npm start'
==> Server running at: http://localhost:10000
```

### Check for Success
- Status changes to: **"Live"** (green)
- No Dockerfile errors
- Server starts successfully

## Step 4: Test Your Application

Once deployed, you'll get a URL like: `https://saas-coverage-app-xxxx.onrender.com`

Test these features:
1. **Home page loads** ✅
2. **Coverage ID dropdown populates** ✅
3. **Search works** ✅
4. **Customer/product data displays** ✅
5. **CSV export works** ✅
6. **Excel export works** ✅
7. **Health check**: Visit `https://your-app.onrender.com/health` ✅

## 🎯 Why This Works

**Blueprint vs Manual Setup:**
- ✅ **Blueprint**: Reads render.yaml automatically, uses correct Node.js buildpack
- ❌ **Manual**: Ignores render.yaml, tries to detect build method (often picks Docker)

**What render.yaml Provides:**
- Runtime: Node.js (not Docker)
- Build command: `npm install`
- Start command: `npm start`
- Persistent disk for SQLite database
- Environment variables

## 🔍 Troubleshooting

### Still Getting Dockerfile Error?
- Make sure you selected **"Blueprint"** not "Web Service"
- Verify render.yaml exists in your repository root
- Check that render.yaml was pushed to GitHub

### Build Fails During npm install?
- Check the logs for specific error
- Verify package.json is in repository
- Ensure Node.js version is compatible (we specified >=14.0.0)

### Service Starts But Shows Error?
- Check if database file exists: `data/saas.db`
- Verify persistent disk is mounted correctly
- Check environment variables are set

### Database Not Found?
- Ensure persistent disk is configured:
  - Name: `saas-data`
  - Mount path: `/opt/render/project/src/data`
  - Size: 1 GB
- Verify `data/saas.db` was pushed to GitHub

## 📊 Expected Timeline

- **Delete service**: Instant
- **Create with Blueprint**: 30 seconds
- **Build & Deploy**: 2-5 minutes
- **Total time**: ~5 minutes

## ✅ Success Indicators

You'll know it worked when:
1. ✅ No Dockerfile errors in logs
2. ✅ Logs show "Detected Node.js app"
3. ✅ npm install completes successfully
4. ✅ Server starts: "Server running at: http://localhost:10000"
5. ✅ Status shows "Live" (green)
6. ✅ Application accessible at Render URL

## 🎉 After Successful Deployment

Your application will be:
- ✅ Live and accessible worldwide
- ✅ Running on HTTPS (automatic SSL)
- ✅ Using persistent storage for database
- ✅ Auto-deploying on git push
- ✅ Free tier (with spin-down after 15 min inactivity)

## 📝 Notes

- **Free Tier**: Service spins down after 15 minutes of inactivity
- **First Request**: May take 30-60 seconds after spin-down
- **Database**: Persists across deployments and restarts
- **Updates**: Push to GitHub triggers automatic redeployment

---

**Follow these steps and your deployment will work! The Blueprint method ensures Render uses the correct configuration from render.yaml.** 🚀