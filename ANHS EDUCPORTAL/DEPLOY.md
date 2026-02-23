# 🚀 ANHS EduPortal - Quick Deployment Guide

## Files Added for Deployment

I've created the following configuration files to make deployment easier:

1. **`backend/.env.example`** - Template for environment variables
2. **`backend/render.yaml`** - Render.com deployment configuration
3. **`netlify.toml`** - Netlify deployment configuration

---

## Step-by-Step Deployment Instructions

### Step 1: Prepare Your Project

Your project is now ready for deployment with these files in place.

### Step 2: Deploy Backend to Render.com

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Render will detect the `render.yaml` file and auto-configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node.js

5. **Add Required Environment Variables** in Render Dashboard:
   ```
   MONGODB_URI=mongodb+srv://your-user:password@cluster0.xxxxx.mongodb.net/anhs_db?retryWrites=true&w=majority
   CORS_ORIGIN=https://your-site.netlify.app  (update after Netlify deploy)
   ```

6. Click **Create Web Service**
7. Wait for deployment (2-5 minutes)
8. Copy your backend URL: `https://anhs-backend.onrender.com`

### Step 3: Update Frontend API URL

1. Open `js/api.js`
2. Update line 4 with your Render backend URL:
   ```javascript
   const PRODUCTION_API_URL = 'https://anhs-backend.onrender.com';
   ```
3. Save the file

### Step 4: Deploy Frontend to Netlify

**Option A: Drag & Drop (Easiest)**
1. Go to [netlify.com](https://netlify.com)
2. Drag your entire `ANHS EDUCPORTAL` folder to the deploy area
3. Netlify will read the `netlify.toml` configuration
4. Get your site URL: `https://anhs-eduportal.netlify.app`

**Option B: GitHub Integration**
1. Push your code to GitHub
2. In Netlify, click **New site from Git**
3. Connect your repository
4. Deploy

### Step 5: Final CORS Configuration

1. Go back to Render.com dashboard
2. Update the `CORS_ORIGIN` environment variable:
   ```
   CORS_ORIGIN=https://anhs-eduportal.netlify.app
   ```
3. This allows your Netlify frontend to communicate with your Render backend

---

## 🔗 How Frontend-Backend Connection Works

### Local Development (Currently Running)
```
Frontend (localhost:3000) → Backend (localhost:5000)
Auto-detected by js/api.js
```

### Production Deployment
```
Frontend (Netlify) → Backend (Render.com)
Configured via PRODUCTION_API_URL in js/api.js
```

The `js/api.js` file automatically:
- Detects if running locally → uses `localhost:5000`
- Detects if on web → uses `PRODUCTION_API_URL`

---

## ✅ Testing Your Deployment

1. Visit your Netlify URL
2. Test login/registration
3. Check browser console for any CORS errors
4. Verify all features work (Students, Teachers, Admin portals)

---

## 🆘 Troubleshooting

**CORS Errors?**
- Ensure `CORS_ORIGIN` in Render matches your Netlify URL exactly
- Include `https://` and no trailing slash

**Database Connection Failed?**
- Check `MONGODB_URI` is correct in Render
- Verify MongoDB Atlas allows connections from Render's IP

**Frontend Can't Find Backend?**
- Verify `PRODUCTION_API_URL` in `js/api.js` is set correctly
- Redeploy frontend after updating the URL

---

## 📊 Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| MongoDB Atlas | 512MB storage |
| Render.com | 512MB RAM, sleeps after 15min idle |
| Netlify | 100GB bandwidth/month |

---

Your ANHS EduPortal is now ready for web deployment! 🎉
