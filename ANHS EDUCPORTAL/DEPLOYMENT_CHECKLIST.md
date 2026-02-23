# ✅ ANHS EduPortal Deployment Checklist

Use this checklist to track your deployment progress.

---

## Phase 1: Code Preparation ⏳

- [ ] Create GitHub repository
- [ ] Upload all project files to GitHub
- [ ] Verify `js/api.js` has `PRODUCTION_API_URL` variable
- [ ] Review `DEPLOYMENT_GUIDE.md` completely

---

## Phase 2: MongoDB Atlas Setup ⏳

- [ ] Create MongoDB Atlas account
- [ ] Create new project "ANHS EduPortal"
- [ ] Create M0 (Free) cluster
- [ ] Create database user with password
- [ ] Configure Network Access (restrict to required sources; avoid permanent 0.0.0.0/0)
- [ ] Get connection string
- [ ] **SAVE**: Connection string with password

**Connection String Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/anhs_db?retryWrites=true&w=majority
```

---

## Phase 3: Backend Deployment (Render.com) ⏳

- [ ] Create Render.com account (sign up with GitHub)
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Configure build command: `cd ANHS EDUCPORTAL/backend && npm install`
- [ ] Configure start command: `cd ANHS EDUCPORTAL/backend && npm start`
- [ ] Add environment variables:
  - [ ] `NODE_ENV` = `production`
  - [ ] `MONGODB_URI` = (your connection string)
  - [ ] `JWT_SECRET` = (generate random string)
  - [ ] `CORS_ORIGIN` = `https://your-frontend-domain` (or comma-separated trusted origins)
  - [ ] `UPLOAD_DIR` = `uploads`
  - [ ] `PUBLIC_UPLOADS` = `false`
  - [ ] `MAX_UPLOAD_SIZE_BYTES` = `10485760`
- [ ] Deploy and wait for success
- [ ] **SAVE**: Backend URL (e.g., `https://anhs-backend.onrender.com`)
- [ ] Test health endpoint: `/api/health`

---

## Phase 4: Frontend Configuration ⏳

- [ ] Open `js/api.js`
- [ ] Update `PRODUCTION_API_URL` with your Render backend URL:
  ```javascript
  const PRODUCTION_API_URL = 'https://anhs-backend.onrender.com';
  ```
- [ ] Save file
- [ ] Create `frontend-deploy` folder
- [ ] Copy all HTML, JS, CSS, and image files to folder
- [ ] Verify `js/api.js` is in the folder

---

## Phase 5: Frontend Deployment (Netlify) ⏳

- [ ] Create Netlify account
- [ ] Drag & drop `frontend-deploy` folder to Netlify
- [ ] Wait for deployment
- [ ] **SAVE**: Netlify URL (e.g., `https://anhs-eduportal.netlify.app`)
- [ ] Visit Netlify URL and test

---

## Phase 6: Security & Final Configuration ⏳

- [ ] Go back to Render.com dashboard
- [ ] Update `CORS_ORIGIN` environment variable:
  - Ensure it is your exact Netlify URL (or trusted domain list only)
- [ ] Redeploy if necessary
- [ ] Test all functionality again

---

## Phase 7: Create Admin User ⏳

- [ ] Access MongoDB Atlas
- [ ] Open `anhs_db` database
- [ ] Open `users` collection
- [ ] Insert admin user document:
  ```json
  {
    "name": "School Administrator",
    "email": "admin@anhs.edu",
    "password": "$2a$10$...", 
    "role": "admin",
    "isActive": true,
    "createdAt": {"$date": "2024-01-01T00:00:00Z"}
  }
  ```
- [ ] Generate bcrypt password hash locally
- [ ] Test login with admin credentials

---

## Phase 8: Testing & Go Live ⏳

### Functionality Tests
- [ ] Homepage loads correctly
- [ ] Login works
- [ ] Registration works
- [ ] Admin dashboard accessible
- [ ] Student portal works
- [ ] Teacher portal works
- [ ] Parent portal works
- [ ] Announcements display
- [ ] News section works
- [ ] Events calendar works
- [ ] Contact form submits
- [ ] Admission form submits
- [ ] File uploads work (if applicable)

### Cross-Browser Tests
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browser (Chrome/Safari mobile)

### Performance Tests
- [ ] Page loads under 3 seconds
- [ ] No console errors
- [ ] Images load properly

---

## Phase 9: Documentation & Handover ⏳

- [ ] Document admin login credentials (securely)
- [ ] Create user manual for school staff
- [ ] List all portal URLs
- [ ] Document how to add new users
- [ ] Share deployment details with stakeholders

---

## 🎉 DEPLOYMENT COMPLETE!

Once all checkboxes are checked, your ANHS EduPortal is live! 

---

## 📋 Important Information to Save

### URLs
- **Frontend**: `https://_________________.netlify.app`
- **Backend**: `https://_________________.onrender.com`
- **Database**: MongoDB Atlas Cluster

### Credentials
- **Admin Email**: `_________________`
- **Admin Password**: `_________________`
- **Database User**: `_________________`
- **Database Password**: `_________________`
- **JWT Secret**: `_________________`

### Accounts
- **GitHub**: `_________________`
- **MongoDB Atlas**: `_________________`
- **Render.com**: `_________________`
- **Netlify**: `_________________`

---

## 🚀 Optional Next Steps

- [ ] Set up custom domain
- [ ] Configure SSL certificate
- [ ] Add Google Analytics
- [ ] Set up backup schedule
- [ ] Create email notifications
- [ ] Add more admin users
- [ ] Import student/teacher data
- [ ] Train staff on system usage

---

**Last Updated**: _______________
**Deployed By**: _______________
**Notes**: _______________
