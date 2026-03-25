# Deployment Guide - Render

This guide will help you deploy the SaaS Coverage Lookup Application to Render.

## Prerequisites

1. A GitHub account
2. A Render account (free tier available at https://render.com)
3. Your application code pushed to a GitHub repository

## Step 1: Push Code to GitHub

If you haven't already, initialize a git repository and push to GitHub:

```bash
cd /Users/jaimeshoemaker/Desktop/saas-coverage-app

# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - SaaS Coverage App"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/saas-coverage-app.git
git branch -M main
git push -u origin main
```

## Step 2: Prepare the Database

Before deploying, you need to ensure your database file is included:

1. The database file `data/saas.db` should already exist from running `npm run import`
2. We need to temporarily remove it from .gitignore to include it in the deployment
3. Run these commands:

```bash
# Temporarily allow the database file
git add -f data/saas.db

# Commit the database
git commit -m "Add database for deployment"

# Push to GitHub
git push
```

**Important**: The database will be stored on Render's persistent disk, so future updates will persist.

## Step 3: Deploy to Render

1. **Sign up/Login to Render**
   - Go to https://render.com
   - Sign up or log in with your GitHub account

2. **Create a New Web Service**
   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub repository
   - Select the `saas-coverage-app` repository

3. **Configure the Service**
   - **Name**: `saas-coverage-app` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Select "Free"

4. **Add Persistent Disk**
   - Scroll down to "Disk" section
   - Click "Add Disk"
   - **Name**: `saas-data`
   - **Mount Path**: `/opt/render/project/src/data`
   - **Size**: 1 GB (free tier)

5. **Environment Variables** (Optional)
   - Add `NODE_ENV` = `production`

6. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - This process takes 2-5 minutes

## Step 4: Access Your Application

Once deployment is complete:

1. Render will provide a URL like: `https://saas-coverage-app.onrender.com`
2. Click the URL to access your application
3. Test all features:
   - Search by coverage ID
   - View customer and product data
   - Export to CSV/Excel

## Step 5: Custom Domain (Optional)

To use a custom domain:

1. Go to your service settings in Render
2. Click "Custom Domains"
3. Add your domain
4. Update your DNS records as instructed by Render

## Important Notes

### Database Persistence
- The SQLite database is stored on Render's persistent disk
- Data will persist across deployments
- Free tier includes 1GB of persistent storage

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- 750 hours/month of runtime (sufficient for most use cases)

### Updating the Application

To deploy updates:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push

# Render will automatically redeploy
```

### Updating the Database

If you need to update the database with new data:

1. Update your local database using `npm run import`
2. Commit and push the updated database:
   ```bash
   git add -f data/saas.db
   git commit -m "Update database"
   git push
   ```
3. Render will redeploy with the new database

Alternatively, you can use Render's Shell to run the import script directly on the server.

## Troubleshooting

### Application Won't Start
- Check the Render logs for errors
- Verify all dependencies are in package.json
- Ensure the database file exists

### Database Not Found
- Verify the persistent disk is mounted correctly
- Check that data/saas.db was included in the git repository
- Review the mount path: `/opt/render/project/src/data`

### Slow First Load
- This is normal for free tier services
- The service spins down after inactivity
- Consider upgrading to a paid plan for always-on service

## Monitoring

- View logs in real-time from the Render dashboard
- Set up email notifications for deployment failures
- Monitor service health and uptime

## Support

For Render-specific issues:
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Support: support@render.com

## Security Recommendations

For production use, consider:
1. Adding authentication/authorization
2. Implementing rate limiting
3. Using environment variables for sensitive data
4. Regular database backups
5. Monitoring and logging

## Cost Optimization

Free tier is suitable for:
- Development and testing
- Low-traffic applications
- Personal projects

Consider upgrading if you need:
- Always-on service (no spin-down)
- More than 750 hours/month
- Faster performance
- More storage
- Custom domains with SSL

## Next Steps

1. Test your deployed application thoroughly
2. Share the URL with users
3. Monitor usage and performance
4. Plan for scaling if needed
5. Set up a custom domain (optional)

Your application is now live and accessible to users worldwide! 🎉