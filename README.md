# ReelDown SaaS - Instagram Reel Downloader

> **Professional SaaS application** for downloading Instagram Reels with user authentication, premium tiers, and admin dashboard.

## ✨ Features

### For Users
- 🎥 **HD Quality Downloads** - Best available quality
- ⚡ **Lightning Fast** - Optimized download speeds
- 📊 **Usage Dashboard** - Track your downloads
- 🎬 **Video Preview** - Preview before downloading
- 📜 **Download History** - Access your past downloads
- 🔒 **Secure & Private** - Your data is safe

### For Admins
- 📈 **Analytics Dashboard** - Platform insights
- 👥 **User Management** - Manage all users
- 🔄 **Plan Management** - Upgrade/downgrade users
- 📊 **Real-time Stats** - Live platform metrics

## 🎯 Pricing Plans

| Feature | Free | Premium |
|---------|------|---------|
| Downloads/day | 10 | Unlimited |
| Video Quality | HD | Best Available |
| History | 7 days | Forever |
| Ads | Yes | No |
| Support | Email | Priority |
| **Price** | **$0/month** | **$9.99/month** |

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- MongoDB (local or Atlas)
- yt-dlp

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your MongoDB URI and JWT secret

# 4. Start server
npm start
```

### First Time Setup

1. Open `signup.html` and create an account
2. Connect to MongoDB and make yourself admin:
   ```javascript
   use reel-downloader
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { plan: "admin" } }
   )
   ```
3. Access admin dashboard at `admin.html`

**📖 For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**

## 📁 Project Structure

```
reel-downloader-saas/
├── Frontend
│   ├── index.html          # Landing page
│   ├── login.html          # Login page
│   ├── signup.html         # Signup page
│   ├── dashboard.html      # User dashboard
│   └── admin.html          # Admin dashboard
│
├── Backend
│   ├── server.js           # Main server
│   ├── models/
│   │   ├── User.js         # User model
│   │   └── Download.js     # Download model
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── downloads.js    # Download routes
│   │   └── admin.js        # Admin routes
│   └── middleware/
│       └── auth.js         # Auth middleware
│
└── Documentation
    ├── README.md           # This file
    ├── SETUP_GUIDE.md      # Detailed setup
    ├── API_TESTING.md      # API documentation
    ├── DEPLOYMENT.md       # Deployment guide
    └── SECURITY.md         # Security checklist
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/signup    - Register new user
POST   /api/auth/login     - Login user
GET    /api/auth/me        - Get current user
POST   /api/auth/logout    - Logout user
```

### Downloads (Protected)
```
POST   /api/downloads              - Download reel
GET    /api/downloads/history      - Get history
GET    /api/downloads/stats        - Get stats
```

### Admin (Admin Only)
```
GET    /api/admin/users            - List users
GET    /api/admin/analytics        - Get analytics
PUT    /api/admin/users/:id        - Update user
DELETE /api/admin/users/:id        - Delete user
```

## 🛠️ Technology Stack

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **yt-dlp** - Video downloading
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting

### Frontend
- **HTML5** + **CSS3** - Structure & styling
- **Vanilla JavaScript** - Interactivity
- **Fetch API** - HTTP requests
- **LocalStorage** - Token storage

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting (100 req/15min)
- ✅ Input validation & sanitization
- ✅ Command injection prevention
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ XSS protection

## 📊 Database Schema

### Users
- Authentication (email, password)
- Plan management (free/premium/admin)
- Download limits & tracking
- Subscription data (Stripe integration ready)

### Downloads
- User reference
- URL tracking
- Analytics data (IP, user agent)
- Timestamp

## 🧪 Testing

### Test User Flow
```bash
# 1. Sign up at signup.html
# 2. Login at login.html
# 3. Download reel at dashboard.html
# 4. Check stats and history
```

### Test Admin Flow
```bash
# 1. Login as admin
# 2. Access admin.html
# 3. View analytics
# 4. Manage users
```

**For API testing examples, see [API_TESTING.md](API_TESTING.md)**

## 🚀 Deployment

### Recommended Stack
- **Frontend**: Vercel (free)
- **Backend**: Render (free tier available)
- **Database**: MongoDB Atlas (free tier)

**📖 See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step deployment guide**

## 🔧 Configuration

### Environment Variables
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
RATE_LIMIT_MAX=100
ALLOWED_ORIGINS=https://yourdomain.com
```

### Customization
- **Download limits**: Edit `models/User.js`
- **Pricing**: Edit `index.html`
- **Colors**: Edit CSS variables
- **Rate limits**: Edit `.env`

## 📈 Features Roadmap

### Current (v2.0)
- ✅ User authentication
- ✅ Free & Premium tiers
- ✅ Download limits
- ✅ Admin dashboard
- ✅ Analytics
- ✅ Video preview

### Planned (v2.1+)
- ⏳ Stripe payment integration
- ⏳ Email notifications
- ⏳ Bulk downloads
- ⏳ API access for premium
- ⏳ Download scheduling
- ⏳ Mobile app

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check MongoDB is running
# Verify MONGODB_URI in .env
```

**yt-dlp Not Found**
```bash
# Install yt-dlp
pip install yt-dlp
# Or download from GitHub releases
```

**CORS Errors**
```bash
# Update ALLOWED_ORIGINS in .env
# Restart server
```

**For more troubleshooting, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**

## 📝 License

ISC

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Video downloading
- [Express](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [JWT](https://jwt.io/) - Authentication

---

**Made with ❤️ for the Instagram community**

For support or questions, check the documentation files or create an issue.
