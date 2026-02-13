# 🚀 ReelDown SaaS - Complete Setup Guide

## Overview

ReelDown is now a full-featured SaaS application with:
- ✅ User authentication (JWT)
- ✅ Free & Premium tiers
- ✅ Download limits (10/day for free, unlimited for premium)
- ✅ Admin dashboard
- ✅ Analytics & usage tracking
- ✅ Modern UI with video preview

---

## 📦 Prerequisites

1. **Node.js** (v14+) - https://nodejs.org/
2. **MongoDB** - Choose one:
   - **Local**: https://www.mongodb.com/try/download/community
   - **Cloud (Recommended)**: MongoDB Atlas (free tier) - https://www.mongodb.com/cloud/atlas
3. **yt-dlp** - https://github.com/yt-dlp/yt-dlp/releases

---

## 🛠️ Installation Steps

### Step 1: Install Dependencies

```bash
cd "c:\Users\Jayku\OneDrive\Desktop\antigravity all files\5th anti gravity"
npm install
```

### Step 2: Set Up MongoDB

#### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

#### Option B: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```
3. Connection string: `mongodb://localhost:27017/reel-downloader`

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/reel-downloader
   # OR for local: mongodb://localhost:27017/reel-downloader
   
   # JWT Secret (change this!)
   JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
   JWT_EXPIRE=7d
   
   # Rate Limiting
   RATE_LIMIT_MAX=100
   
   # CORS
   ALLOWED_ORIGINS=*
   ```

### Step 4: Install yt-dlp

#### Windows:
1. Download `yt-dlp.exe` from https://github.com/yt-dlp/yt-dlp/releases
2. Add to PATH or place in project directory

#### macOS/Linux:
```bash
# Using pip
pip install yt-dlp

# Or using brew (macOS)
brew install yt-dlp
```

### Step 5: Start the Server

```bash
npm start
```

You should see:
```
✅ MongoDB connected successfully
🚀 Reel Downloader SaaS API v2.0
📦 Environment: development
🌐 Server: http://localhost:5000
```

---

## 👤 Creating Your First Admin User

### Method 1: Via Signup + MongoDB

1. Open `signup.html` in browser
2. Create an account
3. Connect to MongoDB:
   ```bash
   # MongoDB Atlas
   mongosh "mongodb+srv://cluster.mongodb.net/" --username YOUR_USERNAME
   
   # Local MongoDB
   mongosh
   ```
4. Update user to admin:
   ```javascript
   use reel-downloader
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { plan: "admin" } }
   )
   ```

### Method 2: Direct MongoDB Insert

```javascript
use reel-downloader

db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash
  plan: "admin",
  downloadsUsed: 0,
  downloadsLimit: 999999,
  resetDate: new Date(Date.now() + 24*60*60*1000),
  subscriptionStatus: "none",
  createdAt: new Date(),
  lastLogin: new Date()
})
```

---

## 📱 Using the Application

### For Users

1. **Landing Page**: Open `index.html`
   - View features and pricing
   - Click "Get Started" to sign up

2. **Sign Up**: `signup.html`
   - Create account (automatically gets Free plan)
   - 10 downloads per day

3. **Login**: `login.html`
   - Login with email/password
   - Redirects to dashboard

4. **Dashboard**: `dashboard.html`
   - View usage stats
   - Download Instagram Reels
   - See download history
   - Upgrade prompt (for free users)

### For Admins

1. **Login** as admin user
2. **Access Admin Dashboard**: Open `admin.html`
   - View platform analytics
   - Manage all users
   - Upgrade/downgrade users
   - Delete users

---

## 🎯 Testing the Application

### Test User Flow

1. **Sign Up**:
   ```
   Name: Test User
   Email: test@example.com
   Password: password123
   ```

2. **Download a Reel**:
   - Paste Instagram Reel URL
   - Click "Download"
   - Video preview appears
   - Download button available

3. **Check Limits**:
   - Try downloading 11 reels (free limit is 10)
   - Should see upgrade message

### Test Admin Flow

1. Login as admin
2. Go to `admin.html`
3. View analytics
4. Upgrade test user to premium
5. Verify unlimited downloads

---

## 🔧 API Endpoints Reference

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Downloads (Protected)
- `POST /api/downloads` - Download reel (checks limits)
- `GET /api/downloads/history` - Get download history
- `GET /api/downloads/stats` - Get usage statistics

### Admin (Admin Only)
- `GET /api/admin/users` - List all users
- `GET /api/admin/analytics` - Platform analytics
- `PUT /api/admin/users/:id` - Update user plan
- `DELETE /api/admin/users/:id` - Delete user

---

## 🎨 Customization

### Change Pricing

Edit `index.html` pricing section:
```html
<div class="plan-price">$9.99<span>/month</span></div>
```

### Change Download Limits

Edit `models/User.js`:
```javascript
downloadsLimit: {
    type: Number,
    default: 10 // Change this number
}
```

### Change Colors

Edit CSS variables in any HTML file:
```css
:root {
    --primary: #6366f1;  /* Change primary color */
    --gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

---

## 🚨 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Solution**: 
- Check MongoDB is running
- Verify `MONGODB_URI` in `.env`
- Check firewall/network settings

### yt-dlp Not Found
```
Error: yt-dlp is not installed
```
**Solution**:
- Install yt-dlp
- Add to system PATH
- Verify: `yt-dlp --version`

### JWT Token Invalid
```
Error: Invalid or expired token
```
**Solution**:
- Clear browser localStorage
- Login again
- Check `JWT_SECRET` in `.env`

### CORS Errors
```
Access to fetch has been blocked by CORS policy
```
**Solution**:
- Update `ALLOWED_ORIGINS` in `.env`
- Add your frontend URL
- Restart server

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  plan: String (free/premium/admin),
  downloadsUsed: Number,
  downloadsLimit: Number,
  resetDate: Date,
  stripeCustomerId: String,
  subscriptionId: String,
  subscriptionStatus: String,
  createdAt: Date,
  lastLogin: Date
}
```

### Downloads Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  reelUrl: String,
  downloadUrl: String,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

---

## 🔐 Security Best Practices

1. **Change JWT_SECRET** in production
2. **Use HTTPS** in production
3. **Enable rate limiting** (already configured)
4. **Regular backups** of MongoDB
5. **Keep dependencies updated**: `npm update`
6. **Run security audit**: `npm audit`

---

## 🚀 Deployment

See `DEPLOYMENT.md` for detailed deployment instructions to:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## 📝 Next Steps

1. ✅ Test all features locally
2. ✅ Create admin user
3. ✅ Test download limits
4. ⏳ Integrate payment (Stripe) for premium
5. ⏳ Deploy to production
6. ⏳ Set up custom domain

---

## 💡 Tips

- **Free users**: 10 downloads/day, resets every 24 hours
- **Premium users**: Unlimited downloads
- **Admin users**: Full access to admin dashboard
- **Download history**: Stored in database
- **Video preview**: Shows before download

---

## 🆘 Support

For issues or questions:
1. Check troubleshooting section
2. Review API_TESTING.md
3. Check server logs
4. Verify MongoDB connection

---

## 📄 License

ISC
