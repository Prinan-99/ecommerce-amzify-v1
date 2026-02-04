# Seller Panel - Troubleshooting Guide

## Common Issues & Solutions

---

## 1. Installation Issues

### Problem: npm install fails with network errors
```
npm error network read ECONNRESET
npm error network This is a problem related to network connectivity
```

**Solutions:**
```bash
# Try with retry
npm install --legacy-peer-deps --force

# Or use yarn
yarn install

# Or clear cache and retry
npm cache clean --force
npm install --legacy-peer-deps
```

### Problem: EACCES permission denied
```
npm error code EACCES
npm error syscall mkdir
```

**Solutions (Windows):**
```powershell
# Run as Administrator
npm install --legacy-peer-deps

# Or use --force
npm install --force --legacy-peer-deps
```

### Problem: node-gyp build failures
```
gyp ERR! build error
```

**Solutions:**
```bash
npm install --build-from-source=false
npm install --legacy-peer-deps --no-optional
```

---

## 2. Runtime Issues

### Problem: Cannot find module 'react'
```
Module not found: Error: Can't resolve 'react' in '...'
```

**Solution:**
```bash
cd amzify-seller-panel
npm install --legacy-peer-deps
npm run dev
```

### Problem: useAuth returns undefined
```
Error: useAuth must be used within AuthProvider
```

**Solution:** Ensure `index.tsx` wraps app with `<AuthProvider>`:
```tsx
<AuthProvider>
  <SellerRoutes />
</AuthProvider>
```

### Problem: CORS error when calling backend
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solutions:**
1. **Start Backend First:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Verify Backend CORS Config:**
   Check `backend/server.js`:
   ```javascript
   cors({
     origin: function(origin, callback) {
       if (!origin || origin.startsWith('http://localhost:')) {
         callback(null, true);
       } else {
         callback(new Error('Not allowed by CORS'));
       }
     }
   })
   ```

3. **Verify API Base URL:**
   Check `amzify-seller-panel/services/sellerApi.ts`:
   ```typescript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

---

## 3. Development Server Issues

### Problem: Port 3000 already in use
```
Error: EADDRINUSE: address already in use :::3000
```

**Solutions:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or run on different port
npm run dev -- --port 3001
```

### Problem: Dev server won't start
```
error Command failed with exit code 1
```

**Solutions:**
```bash
# Clear vite cache
rm -rf node_modules/.vite
npm run dev

# Or rebuild
npm install
npm run dev
```

---

## 4. Authentication Issues

### Problem: Login fails with "Invalid credentials"
```
Error: Login failed
```

**Solutions:**
1. **Verify demo user exists in backend:**
   ```bash
   cd backend
   npm run seed
   ```

2. **Check backend is running:**
   ```bash
   curl http://localhost:5000/health
   ```

3. **Verify credentials in database**

### Problem: Token not persisting in localStorage
```
localStorage is null or undefined
```

**Solution:** 
- This typically occurs in non-browser environments
- Ensure you're running in a browser, not Node.js
- Check browser DevTools → Storage → Local Storage

### Problem: "User session expired" immediately after login
```
Error: Token validation failed
```

**Solutions:**
1. **Check JWT Secret matches:**
   - `backend/.env` JWT_SECRET
   - Backend must use same secret for signing/verifying

2. **Verify Token Expiry:**
   ```typescript
   // Check in RealAuthContext.tsx
   if (data.accessToken) {
     localStorage.setItem('accessToken', data.accessToken);
   }
   ```

---

## 5. API Call Issues

### Problem: 404 Not Found on API calls
```
GET http://localhost:5000/api/seller/dashboard 404
```

**Solutions:**
1. **Verify endpoint exists in backend:**
   ```bash
   grep -r "'/dashboard'" backend/routes/
   ```

2. **Check route is registered:**
   ```javascript
   // In backend/server.js
   app.use('/api/seller', sellerRoutes);
   ```

3. **Verify seller route exists:**
   ```javascript
   // In backend/routes/seller.js
   router.get('/dashboard', sellerDashboardController.getDashboard);
   ```

### Problem: 401 Unauthorized
```
Error: Unauthorized - Token invalid or expired
```

**Solutions:**
```typescript
// Check token is being sent
const token = localStorage.getItem('accessToken');
console.log('Token:', token);

// Verify Authorization header format
Authorization: `Bearer ${token}`  // Correct
Authorization: `${token}`         // Wrong
```

### Problem: 500 Internal Server Error
```
Error: Internal Server Error
```

**Solutions:**
1. **Check backend logs:**
   ```bash
   # Terminal running backend will show detailed error
   npm run dev
   ```

2. **Check database connection:**
   ```bash
   # Verify PostgreSQL is running
   psql -U postgres -d amzify_db -c "SELECT 1"
   ```

3. **Verify environment variables:**
   ```bash
   # Check backend/.env has all required variables
   DATABASE_URL=postgresql://...
   JWT_SECRET=...
   ```

---

## 6. Build Issues

### Problem: Build fails with type errors
```
error TS2307: Cannot find module '@types/react'
```

**Solutions:**
```bash
npm install --save-dev typescript
npm install --save-dev @types/react
npm install --save-dev @types/react-dom
npm run build
```

### Problem: Build output too large
```
warning: The following entrypoint...is larger than 500kb
```

**Solution:** This is just a warning, build succeeds. To optimize:
```bash
npm install --save-dev @rollup/plugin-dynamic-import-vars
# Optimize in vite.config.ts
```

---

## 7. Component Issues

### Problem: "Cannot read property 'X' of undefined"
```
TypeError: Cannot read property 'email' of undefined
```

**Solutions:**
1. **Add null checks:**
   ```tsx
   // Wrong
   <div>{user.email}</div>
   
   // Correct
   <div>{user?.email || 'N/A'}</div>
   ```

2. **Check data is loaded before rendering:**
   ```tsx
   if (isLoading) return <div>Loading...</div>;
   if (!data) return <div>No data</div>;
   ```

### Problem: Component re-renders infinitely
```
Error: Too many re-renders. React limits the number of renders...
```

**Solution:** Remove setState from render:
```tsx
// Wrong
useEffect(() => {
  setState(value);  // infinite loop
});

// Correct
useEffect(() => {
  setState(value);
}, [dependency]);  // with dependency array
```

---

## 8. Styling Issues

### Problem: Tailwind CSS classes not working
```
Classes like 'bg-blue-500' don't apply
```

**Solutions:**
1. **Ensure tailwind is installed:**
   ```bash
   npm install -D tailwindcss
   npm install -D postcss autoprefixer
   ```

2. **Check tailwind config includes all template paths:**
   ```javascript
   // tailwind.config.js
   content: [
     "./index.html",
     "./src/**/*.{js,jsx,ts,tsx}",
   ]
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

---

## 9. Performance Issues

### Problem: Dev server is slow
```
Takes 30+ seconds to rebuild after changes
```

**Solutions:**
```bash
# Clear cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev

# Or reduce file watching scope in vite.config.ts
```

### Problem: Large bundle size
```
Build is over 1MB
```

**Solutions:**
- Use `npm run build` to analyze:
  ```bash
  npm install -D rollup-plugin-visualizer
  npm run build
  # Check dist/stats.html
  ```

---

## 10. Environment Variable Issues

### Problem: Environment variables undefined
```
process.env.VITE_API_BASE_URL is undefined
```

**Solutions:**
1. **Must prefix with VITE_:**
   ```env
   # Correct
   VITE_API_BASE_URL=...
   
   # Wrong (won't be exposed to client)
   API_BASE_URL=...
   ```

2. **Ensure .env.local exists:**
   ```bash
   # In amzify-seller-panel/
   cat > .env.local << EOF
   VITE_API_BASE_URL=http://localhost:5000/api
   EOF
   ```

3. **Access correctly in code:**
   ```typescript
   // Correct
   const url = import.meta.env.VITE_API_BASE_URL
   
   // Wrong
   const url = process.env.VITE_API_BASE_URL
   ```

4. **Restart dev server after .env change:**
   ```bash
   npm run dev
   ```

---

## 11. Database Issues

### Problem: Can't connect to database
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
1. **Start PostgreSQL:**
   ```bash
   # Mac
   brew services start postgresql
   
   # Windows
   net start PostgreSQL
   
   # Linux
   sudo systemctl start postgresql
   ```

2. **Verify connection string:**
   ```bash
   # In backend/.env
   DATABASE_URL=postgresql://user:password@localhost:5432/amzify_db
   ```

3. **Create database:**
   ```bash
   createdb amzify_db
   ```

---

## 12. Debugging Tips

### Enable Debug Logging
```typescript
// In sellerApi.ts
console.log('🌐 API Request:', url, config);
console.log('📥 API Response:', response.status, data);

// In browser DevTools Console
localStorage.getItem('accessToken')
```

### Check Network Requests
1. Open DevTools → Network tab
2. Make request
3. Check:
   - Request Headers (Authorization)
   - Response Status (200, 401, 500, etc.)
   - Response Body (error message)

### Examine React State
```bash
npm install -D @react-devtools/shell
npm run dev
# Install React DevTools Chrome/Firefox extension
```

### Check Git Status
```bash
git diff
git status
git log --oneline
```

---

## 13. Quick Fixes Checklist

- [ ] Backend is running: `npm run dev` in backend folder
- [ ] Database is connected: `psql -U postgres -d amzify_db`
- [ ] Port 3000 is available
- [ ] Node.js version is v18+
- [ ] Dependencies installed: `npm install`
- [ ] .env.local file created with correct values
- [ ] Dev server started: `npm run dev` in seller-panel
- [ ] Demo user created: `npm run seed` in backend
- [ ] Browser DevTools Console is checked for errors
- [ ] Network tab checked for API responses

---

## 14. Getting Help

If you can't resolve the issue:

1. **Check terminal output for detailed error messages**
2. **Check browser DevTools Console for client-side errors**
3. **Check backend terminal for server-side errors**
4. **Review API response in Network tab**
5. **Check relevant files:** README.md, ARCHITECTURE_GUIDE.md, QUICK_REFERENCE.md

---

## Contact & Support

- **Documentation**: See other `.md` files in project root
- **Backend Issues**: Check `backend/README.md`
- **Architecture**: See `ARCHITECTURE_GUIDE.md`
- **Quick Reference**: See `QUICK_REFERENCE.md`

---

Generated: February 4, 2026
