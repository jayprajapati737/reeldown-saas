# 🚀 Deployment Guide - Reel Downloader

Complete step-by-step guide to deploy your Reel Downloader application to production.

**Frontend** → Vercel (Free)  
**Backend** → Render (Free tier available)

---

## 📋 Prerequisites

Before you start, make sure you have:
- ✅ GitHub account
- ✅ Vercel account (sign up at https://vercel.com)
- ✅ Render account (sign up at https://render.com)
- ✅ Your code pushed to a GitHub repository

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Backend for Deployment

1. **Create a `.env` file locally** (for testing):
   ```bash
   # Copy the example file
   cp .env.example .env
   ```

2. **Edit `.env` with production settings**:
   ```env
   PORT=5000
   NODE_ENV=production
   RATE_LIMIT_MAX=20
   ALLOWED_ORIGINS=*
   ```
   
   > ⚠️ **Important**: We'll set `ALLOWED_ORIGINS` properly after deploying frontend

3. **Test locally**:
   ```bash
   npm install
   npm start
   ```
   Make sure the server runs without errors.

### Step 2: Push Code to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Reel Downloader"
   ```

2. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Name it: `reel-downloader`
   - Don't initialize with README (you already have files)
   - Click "Create repository"

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/reel-downloader.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy to Render

1. **Go to Render Dashboard**:
   - Visit https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect GitHub Repository**:
   - Click "Connect account" if first time
   - Select your `reel-downloader` repository
   - Click "Connect"

3. **Configure Web Service**:
   ```
   Name: reel-downloader-api
   Region: Choose closest to you (e.g., Oregon, Frankfurt)
   Branch: main
   Root Directory: (leave empty)
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Select Plan**:
   - Choose "Free" plan (0$/month)
   - Note: Free tier spins down after inactivity

5. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable"
   
   Add these variables:
   ```
   PORT = 5000
   NODE_ENV = production
   RATE_LIMIT_MAX = 20
   ALLOWED_ORIGINS = *
   ```
   
   > We'll update `ALLOWED_ORIGINS` later with your Vercel URL

6. **Click "Create Web Service"**

7. **Wait for deployment** (5-10 minutes):
   - Render will install dependencies
   - Build your application
   - Start the server

### Step 4: Install yt-dlp on Render

Render's free tier doesn't allow custom system packages easily. Here are your options:

#### Option A: Use Build Command (Recommended)

1. **Go to your Render service settings**
2. **Update Build Command**:
   ```bash
   npm install && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /opt/render/project/src/yt-dlp && chmod a+rx /opt/render/project/src/yt-dlp
   ```

3. **Update Start Command**:
   ```bash
   PATH=$PATH:/opt/render/project/src node server.js
   ```

4. **Click "Save Changes"** - This will redeploy

#### Option B: Use Docker (Advanced)

Create a `Dockerfile` in your project:
```dockerfile
FROM node:18

# Install yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
RUN chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 5000
CMD ["npm", "start"]
```

Then in Render, select "Docker" as runtime.

### Step 5: Test Backend

1. **Get your backend URL** from Render dashboard:
   ```
   https://reel-downloader-api.onrender.com
   ```

2. **Test the health endpoint**:
   - Open in browser: `https://reel-downloader-api.onrender.com/`
   - You should see: `{"status":"success","message":"Reel Downloader API is running"...}`

3. **Test download endpoint** (using PowerShell):
   ```powershell
   $body = @{
       url = "https://www.instagram.com/reel/SAMPLE_ID/"
   } | ConvertTo-Json

   Invoke-RestMethod -Uri "https://reel-downloader-api.onrender.com/download" -Method Post -Body $body -ContentType "application/json"
   ```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Frontend

1. **Update frontend to use production backend**:
   
   Open `reel-downloader.html` and find this line (around line 620):
   ```javascript
   const response = await fetch('http://localhost:5000/download', {
   ```

2. **Replace with your Render URL**:
   ```javascript
   const response = await fetch('https://reel-downloader-api.onrender.com/download', {
   ```

3. **Save and commit**:
   ```bash
   git add reel-downloader.html
   git commit -m "Update API endpoint for production"
   git push
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel Dashboard**:
   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Git Repository**:
   - Click "Import" next to your `reel-downloader` repository
   - If not visible, click "Adjust GitHub App Permissions"

3. **Configure Project**:
   ```
   Project Name: reel-downloader
   Framework Preset: Other
   Root Directory: ./
   Build Command: (leave empty)
   Output Directory: (leave empty)
   Install Command: (leave empty)
   ```

4. **Click "Deploy"**

5. **Wait for deployment** (1-2 minutes)

6. **Get your live URL**:
   ```
   https://reel-downloader.vercel.app
   ```

### Step 3: Update CORS Settings

Now that you have your Vercel URL, update backend CORS:

1. **Go to Render Dashboard**
2. **Select your web service**
3. **Go to "Environment"**
4. **Update `ALLOWED_ORIGINS`**:
   ```
   ALLOWED_ORIGINS = https://reel-downloader.vercel.app
   ```

5. **Click "Save Changes"** - This will redeploy

---

## Part 3: Final Configuration

### Update Frontend API Endpoint (if needed)

If you want to make the API endpoint configurable:

1. **Add this at the top of the `<script>` section**:
   ```javascript
   // API Configuration
   const API_URL = 'https://reel-downloader-api.onrender.com';
   ```

2. **Update fetch call**:
   ```javascript
   const response = await fetch(`${API_URL}/download`, {
   ```

### Custom Domain (Optional)

#### For Vercel (Frontend):
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

#### For Render (Backend):
1. Go to Settings → Custom Domain
2. Add your custom domain
3. Update DNS records as instructed

---

## 🧪 Testing Your Deployment

### Test Frontend
1. Visit: `https://reel-downloader.vercel.app`
2. Paste an Instagram reel URL
3. Click "Download Reel"
4. Video should preview and download link should appear

### Test Backend Directly
```bash
curl -X POST https://reel-downloader-api.onrender.com/download \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.instagram.com/reel/SAMPLE_ID/"}'
```

---

## 🔧 Troubleshooting

### Issue: CORS Error in Browser Console

**Error**: `Access to fetch at 'https://...' has been blocked by CORS policy`

**Solution**:
1. Check `ALLOWED_ORIGINS` in Render environment variables
2. Make sure it includes your Vercel URL
3. Redeploy backend after changing

### Issue: yt-dlp not found

**Error**: `yt-dlp is not installed`

**Solution**:
1. Verify build command includes yt-dlp installation
2. Check Render logs for installation errors
3. Try the Docker approach instead

### Issue: Backend is slow or times out

**Cause**: Render free tier spins down after 15 minutes of inactivity

**Solutions**:
- Upgrade to paid plan ($7/month)
- Use a service like UptimeRobot to ping your backend every 10 minutes
- Accept the cold start delay (first request takes ~30 seconds)

### Issue: Rate limit errors

**Solution**:
1. Increase `RATE_LIMIT_MAX` in environment variables
2. Or wait 15 minutes for rate limit to reset

### Issue: Video preview not working

**Possible causes**:
- Instagram URL expired
- CORS blocking video source
- Video format not supported by browser

**Solution**:
- Download link should still work
- Try different browser
- Check browser console for errors

---

## 📊 Monitoring Your Application

### Render Monitoring
- View logs: Dashboard → Logs
- Monitor metrics: Dashboard → Metrics
- Set up alerts: Dashboard → Settings → Notifications

### Vercel Monitoring
- View deployments: Dashboard → Deployments
- Analytics: Dashboard → Analytics
- Error tracking: Dashboard → Speed Insights

---

## 🔄 Updating Your Application

### Update Frontend
```bash
# Make changes to reel-downloader.html
git add .
git commit -m "Update frontend"
git push
```
Vercel will auto-deploy in ~1 minute

### Update Backend
```bash
# Make changes to server.js
git add .
git commit -m "Update backend"
git push
```
Render will auto-deploy in ~5 minutes

---

## 💰 Cost Breakdown

### Free Tier Limits

**Vercel (Frontend)**:
- ✅ Unlimited bandwidth
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments

**Render (Backend)**:
- ✅ 750 hours/month (enough for 1 service)
- ⚠️ Spins down after 15 min inactivity
- ⚠️ 512 MB RAM
- ⚠️ Shared CPU

### Paid Upgrades (Optional)

**Render Pro** ($7/month):
- No spin down
- 1 GB RAM
- Faster CPU

**Vercel Pro** ($20/month):
- Advanced analytics
- More team features
- Higher limits

---

## 🎉 You're Done!

Your Reel Downloader is now live at:
- **Frontend**: `https://reel-downloader.vercel.app`
- **Backend**: `https://reel-downloader-api.onrender.com`

Share it with friends and enjoy! 🚀

---

## 📝 Quick Reference

### Environment Variables (Render)
```env
PORT=5000
NODE_ENV=production
RATE_LIMIT_MAX=20
ALLOWED_ORIGINS=https://reel-downloader.vercel.app
```

### Important URLs
- Vercel Dashboard: https://vercel.com/dashboard
- Render Dashboard: https://dashboard.render.com
- GitHub Repo: https://github.com/YOUR_USERNAME/reel-downloader

### Support
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- yt-dlp Docs: https://github.com/yt-dlp/yt-dlp
