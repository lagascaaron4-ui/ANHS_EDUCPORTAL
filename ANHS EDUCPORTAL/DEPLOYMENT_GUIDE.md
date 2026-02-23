# 🚀 ANHS EDUCPORTAL - FREE Deployment Guide

This guide will walk you through deploying the ANHS EduPortal for FREE using:
- **MongoDB Atlas** (Free Database - 512MB)
- **Render.com** (Free Backend Hosting)
- **Netlify** (Free Frontend Hosting)

---

## 📋 Prerequisites

1. GitHub account (free)
2. MongoDB Atlas account (free)
3. Render.com account (free)
4. Netlify account (free)

---

## Phase 1: Prepare Your Code

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and create a new repository
2. Name it `anhs-eduportal`
3. Upload your project files:
   - Frontend files (all HTML, CSS, JS files)
   - Backend folder (`ANHS EDUCPORTAL/backend/`)

### Step 2: Update API Configuration

The `js/api.js` file has already been updated with a configuration variable. After deploying your backend, you'll update:

```javascript
const PRODUCTION_API_URL = 'https://your-backend-name.onrender.com';
```

---

## Phase 2: Set Up MongoDB Atlas (Database)

### Step 1: Create Account
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up for free account
3. Create a new project named "ANHS EduPortal"

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose **M0 (Free Tier)**
3. Select your preferred cloud provider (AWS/Google Cloud/Azure)
4. Choose a region close to your users
5. Click "Create Cluster" (takes 1-3 minutes)

### Step 3: Configure Database Access
1. In the left sidebar, click **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Create username: `anhs_admin`
5. Auto-generate a secure password (SAVE THIS!)
6. Under **Database User Privileges**, select **Read and write to any database**
7. Click **Add User**

### Step 4: Configure Network Access
1. In the left sidebar, click **Network Access**
2. Click **Add IP Address**
3. Prefer restricting access to trusted sources; avoid permanent **Allow Access from Anywhere**
4. Click **Confirm**

### Step 5: Get Connection String
1. Go back to **Database** → Click **Connect** on your cluster
2. Choose **Drivers** → **Node.js**
3. Copy the connection string. It looks like:
   ```
   mongodb+srv://anhs_admin:<password>@cluster0.xxxxx.mongodb.net/anhs_db?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. **SAVE THIS STRING** - you'll need it for Render.com

---

## Phase 3: Deploy Backend to Render.com

### Step 1: Create Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Create Web Service
1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | anhs-backend (or your preferred name) |
| **Environment** | Node |
| **Build Command** | `cd ANHS EDUCPORTAL/backend && npm install` |
| **Start Command** | `cd ANHS EDUCPORTAL/backend && npm start` |
| **Plan** | Free |

### Step 3: Add Environment Variables
Click **Advanced** → **Add Environment Variable** for each:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB connection string from Phase 2 |
| `JWT_SECRET` | Generate a random string (use [random.org](https://www.random.org/strings/)) |
| `CORS_ORIGIN` | Your exact frontend URL (or comma-separated trusted origins) |
| `UPLOAD_DIR` | `uploads` |
| `PUBLIC_UPLOADS` | `false` |
| `MAX_UPLOAD_SIZE_BYTES` | `10485760` |

### Step 4: Deploy
1. Click **Create Web Service**
2. Wait for deployment (2-5 minutes)
3. Once deployed, you'll get a URL like:
   ```
   https://anhs-backend.onrender.com
   ```
4. **Test it**: Visit `https://anhs-backend.onrender.com/api/health`
   - Should return: `{"status":"ok","time":"..."}`

---

## Phase 4: Deploy Frontend to Netlify

### Step 1: Update API URL
1. Open `js/api.js`
2. Update the production URL:
   ```javascript
   const PRODUCTION_API_URL = 'https://anhs-backend.onrender.com';
   ```
3. Save the file

### Step 2: Prepare Frontend Files
1. Create a new folder called `frontend-deploy`
2. Copy these files/folders into it:
   - All `.html` files
   - All `.css` files (if separate)
   - `js/` folder
   - `animations.js`
   - Image files (`.png`, `.jpg`, etc.)
   - `tailwind.config.js` (if needed)

### Step 3: Deploy to Netlify
**Option A: Drag & Drop (Easiest)**
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login
3. Drag your `frontend-deploy` folder to the deploy area
4. Get your site URL (e.g., `https://anhs-eduportal.netlify.app`)

**Option B: GitHub Integration**
1. Push frontend files to GitHub
2. In Netlify, click **New site from Git**
3. Connect your repo
4. Build settings: Leave default (no build command needed for static HTML)
5. Deploy

### Step 4: Update CORS (Important!)
1. Go back to Render.com dashboard
2. Click your web service → **Environment**
3. Update `CORS_ORIGIN`:
   - Set to: `https://anhs-eduportal.netlify.app` (your actual Netlify URL)
4. This improves security by only allowing your frontend

---

## Phase 5: Testing & Go Live

### Test Checklist
- [ ] Visit your Netlify URL
- [ ] Test login functionality
- [ ] Test registration
- [ ] Test all portal features (Students, Teachers, etc.)
- [ ] Check browser console for errors
- [ ] Test on mobile device

### Create First Admin User
You'll need to manually create an admin user in the database or use a registration endpoint.

**Option: Direct Database Insert**
1. In MongoDB Atlas, click **Browse Collections**
2. Click **Add My Own Data**
3. Database name: `anhs_db`
4. Collection name: `users`
5. Insert document:
   ```json
   {
     "name": "Admin User",
     "email": "admin@anhs.edu",
     "password": "$2a$10$...", // bcrypt hashed password
     "role": "admin",
     "isActive": true
   }
   ```

**To hash a password for manual insertion:**
```bash
# Run this in your local backend folder
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('yourpassword', 10));"
```

---

## 🔧 Troubleshooting

### Backend Won't Start
- Check Render.com logs for errors
- Verify `MONGODB_URI` is correct
- Ensure all environment variables are set

### Frontend Can't Connect to Backend
- Check browser console for CORS errors
- Verify `PRODUCTION_API_URL` in `js/api.js`
- Ensure `CORS_ORIGIN` in Render matches your Netlify URL

### Database Connection Issues
- Check MongoDB Atlas Network Access settings
- Verify password in connection string
- Ensure database user has correct permissions

### File Uploads Not Working
- Free tiers may have limitations on file storage
- Consider using Cloudinary for image uploads (free tier available)

---

## 📊 Free Tier Limitations

| Service | Free Tier Limits |
|---------|------------------|
| **MongoDB Atlas** | 512MB storage, shared RAM |
| **Render.com** | 512MB RAM, spins down after 15min idle (slow cold start) |
| **Netlify** | 100GB bandwidth/month, 300 build minutes/month |

**Note:** Render free tier spins down after 15 minutes of inactivity. First request after idle will take 30-60 seconds to wake up.

---

## 🚀 Next Steps (Optional Upgrades)

When you're ready to scale:

1. **Custom Domain**: 
   - Buy domain from Namecheap/GoDaddy (~$10/year)
   - Connect to Netlify (free)
   - Add SSL certificate (free via Let's Encrypt)

2. **Better Performance**:
   - Upgrade to Render Starter ($7/month) - no cold starts
   - MongoDB Atlas M10 ($9/month) - dedicated resources

3. **Monitoring**:
   - Add Google Analytics to track usage
   - Set up UptimeRobot (free) to monitor site

---

## 📞 Support Resources

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Project Issues**: Check browser console and Render logs first

---

## ✅ Deployment Complete!

Your ANHS EduPortal should now be live and accessible worldwide! 🎉

**Remember to:**
- Keep your environment variables secure
- Regularly backup your MongoDB data
- Monitor your free tier usage
- Test thoroughly before sharing with users

Good luck with your deployment! 🚀
