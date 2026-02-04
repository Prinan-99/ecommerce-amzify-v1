# ===========================================
# COMPLETE DEPLOYMENT GUIDE - RENDER + VERCEL
# ===========================================

## 🎯 DEPLOYMENT ARCHITECTURE

**Backend (Render):**  
- API Server on Render Web Service
- PostgreSQL Database on Render

**Frontend (Vercel):**
- Customer Panel
- Admin Panel  
- Seller Panel

---

## 📦 STEP 1: DEPLOY BACKEND TO RENDER

### 1. Create PostgreSQL Database on Render
1. Go to https://render.com → Dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. Settings:
   - Name: `amzify-db`
   - Database: `amzify_db`
   - Region: `Virginia (US East)`
4. Click **"Create Database"**
5. **Copy Internal Database URL** (will look like: `postgresql://user:pass@dpg-xxx-a/amzify_db`)

### 2. Create Web Service for Backend
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Settings:
   - **Name**: `amzify-backend`
   - **Region**: Same as database (Virginia)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter $7/month)

### 3. Add Environment Variables on Render
Go to **Environment** tab and add these:

```
DATABASE_URL=postgresql://amzify_db_user:DC3MXWfVANXY0Ebj1fsEPgCKwTubEqYq@dpg-d605ust6ubrc73d2r7h0-a.virginia-postgres.render.com/amzify_db

JWT_SECRET=96dc277323ca72067246e1262d599274369345df1d343cb22c54478bd96ec6fbf4a2d2829c6df18cc538b3c50933633bf0580360bd5f51942377abc74c856e60

JWT_REFRESH_SECRET=1d7008ebdca36fefdeec9f56ef783ee9e32638b20a06c44d3aaf2df9bd029081c4c836b1db5d8da74cdc02ae2ba76724a353fde595c692eb3f0c1cff8b7edffb

JWT_EXPIRES_IN=15m

JWT_REFRESH_EXPIRES_IN=7d

PORT=5000

NODE_ENV=production

ALLOWED_ORIGINS=https://amzify-customer.vercel.app,https://amzify-admin.vercel.app,https://amzify-seller.vercel.app

GEMINI_API_KEY=AIzaSyDDfYB5LcK5pcRZYTOsBa7Rz_KPXaqseDI

UPLOAD_PATH=uploads/

MAX_FILE_SIZE=5242880

RATE_LIMIT_WINDOW=15

RATE_LIMIT_MAX_REQUESTS=100
```

4. Click **"Save Changes"** - Render will auto-deploy
5. **Copy your backend URL**: `https://amzify-backend.onrender.com`

---

## 🚀 STEP 2: DEPLOY FRONTENDS TO VERCEL

### A. Customer Panel

1. Go to https://vercel.com/new
2. Import your repository
3. Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `amzify-customer-panel`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**:
```
VITE_API_URL=https://amzify-backend.onrender.com/api
VITE_GEMINI_API_KEY=AIzaSyDDfYB5LcK5pcRZYTOsBa7Rz_KPXaqseDI
```

5. Click **Deploy**

### B. Admin Panel

1. Vercel → **New Project**
2. Same repository
3. Settings:
   - **Root Directory**: `amzify-admin-panel`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Environment Variables**:
```
VITE_API_URL=https://amzify-backend.onrender.com/api
```

5. Click **Deploy**

### C. Seller Panel

1. Vercel → **New Project**
2. Same repository
3. Settings:
   - **Root Directory**: `amzify-seller-panel`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Environment Variables**:
```
VITE_API_URL=https://amzify-backend.onrender.com/api
VITE_GEMINI_API_KEY=AIzaSyDDfYB5LcK5pcRZYTOsBa7Rz_KPXaqseDI
```

5. Click **Deploy**

---

## 🔧 STEP 3: UPDATE CORS ON RENDER

After deploying to Vercel, you'll get URLs like:
- `https://amzify-customer.vercel.app`
- `https://amzify-admin.vercel.app`
- `https://amzify-seller.vercel.app`

**Update ALLOWED_ORIGINS on Render:**
1. Go to Render → amzify-backend → Environment
2. Edit `ALLOWED_ORIGINS`:
```
https://amzify-customer.vercel.app,https://amzify-admin.vercel.app,https://amzify-seller.vercel.app
```
3. Save (will trigger redeploy)

---

## ✅ VERIFICATION

### Backend (Render):
```
https://amzify-backend.onrender.com/health
```
Should return: `{"status":"OK"}`

### Frontends (Vercel):
- Customer: `https://amzify-customer.vercel.app`
- Admin: `https://amzify-admin.vercel.app`
- Seller: `https://amzify-seller.vercel.app`

---

## 🐛 TROUBLESHOOTING

### 404 Errors on Vercel
✅ **FIXED** - Added `vercel.json` to all panels

### CORS Errors
- Update `ALLOWED_ORIGINS` on Render with exact Vercel URLs
- No trailing slashes!

### Database Connection Errors
- Use **Internal Database URL** on Render (starts with `postgresql://`)
- Check DATABASE_URL is set correctly

### Build Failures
- Check build logs on Vercel
- Ensure `package.json` has all dependencies
- Verify `vite.config.ts` is correct

---

## 💰 COSTS

**Free Tier:**
- Render: Free (with 90-day DB limit)
- Vercel: Free (hobby plan)

**Production:**
- Render: $7/month (Starter DB + Web Service)
- Vercel: Free for 3 frontends

---

## 📝 NEXT STEPS

1. ✅ Backend environment variables configured
2. ✅ Vercel.json files created for all panels
3. ✅ Strong JWT secrets generated
4. 🔄 Deploy backend to Render
5. 🔄 Deploy frontends to Vercel
6. 🔄 Update CORS origins
7. 🔄 Test all endpoints
