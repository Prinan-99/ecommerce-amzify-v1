# Render Database Setup Guide

## 1. Create PostgreSQL Database on Render

1. Go to [https://render.com](https://render.com) and sign in
2. Click **"New +"** → **"PostgreSQL"**
3. Configure your database:
   - **Name**: `amzify-db`
   - **Database**: `amzify_db`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your target audience
   - **PostgreSQL Version**: 15 or higher
   - **Plan**: 
     - **Free**: Good for development (expires after 90 days)
     - **Starter**: $7/month for production
4. Click **"Create Database"**

## 2. Get Connection String

After creation, go to your database dashboard:

1. Scroll to **"Connections"** section
2. Copy the **"External Database URL"** (for local development/migrations)
3. Copy the **"Internal Database URL"** (if deploying backend on Render)

The URL format looks like:
```
postgresql://username:password@hostname.render.com:5432/database_name
```

## 3. Update Environment Variables

### For Local Development:

Update your `.env` file:

```env
DATABASE_URL="postgresql://username:password@hostname.render.com:5432/database_name"
```

Replace with your actual Render database credentials.

### For Production (if deploying to Render):

Use the **Internal Database URL** for better performance.

## 4. Run Migrations

After setting up the database URL:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npm run migrate

# (Optional) Seed the database with initial data
npm run seed
```

## 5. Test Connection

Start your server:

```bash
npm start
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 Server running on port 5000
```

## 6. Important Notes

- **Free Tier Limitations**:
  - Database expires after 90 days
  - 1 GB storage limit
  - Suitable for development/testing only

- **Security**:
  - Never commit `.env` file to version control
  - Keep your database credentials secure
  - Use strong passwords

- **Backups**:
  - Free tier doesn't include automated backups
  - Paid plans include daily backups
  - Export your data regularly for free tier

## 7. Common Issues

### Connection Timeout
- Check if your IP is whitelisted (Render allows all IPs by default)
- Verify the connection string is correct
- Ensure you're using the External URL for local development

### Migration Errors
- Make sure DATABASE_URL is set correctly
- Check Prisma schema syntax
- Verify PostgreSQL version compatibility

### SSL/TLS Errors
Render requires SSL. If you get SSL errors, update your DATABASE_URL:
```
postgresql://user:pass@host:5432/db?sslmode=require
```

## 8. Monitoring

- View database metrics on Render dashboard
- Monitor connection counts, storage usage, and query performance
- Set up alerts for storage limits

## 9. Scaling

To upgrade:
1. Go to your database dashboard
2. Click **"Settings"**
3. Choose a different plan
4. No downtime during upgrade!
