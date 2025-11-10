# Deployment Guide - Agent Teaching Management Platform

This guide covers deployment options for the Agent Teaching Platform with both frontend and backend support.

## 📋 Table of Contents

- [Quick Start - Vercel Full-Stack](#quick-start---vercel-full-stack)
- [Local Development](#local-development)
- [Frontend-Only Deployment](#frontend-only-deployment)
- [Backend-Only Deployment](#backend-only-deployment)
- [Full-Stack Deployment Options](#full-stack-deployment-options)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start - Vercel Full-Stack

**The recommended way to deploy this application with both frontend and backend:**

### Prerequisites

- GitHub account
- Vercel account (free)
- PostgreSQL database (Vercel Postgres recommended)

### Step 1: Prepare Your Code

```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. Visit [vercel.com](https://vercel.com) and log in with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click "Deploy"

### Step 3: Set Up Database

**Option A: Vercel Postgres (Recommended)**
1. In your Vercel project dashboard, go to "Storage"
2. Click "Create Database" → "Postgres"
3. Choose your region and click "Create"
4. Database environment variables will be automatically added

**Option B: External PostgreSQL**
1. Get a PostgreSQL database from Railway, Render, or other providers
2. In Vercel project settings → "Environment Variables"
3. Add `DATABASE_URL` with your connection string

### Step 4: Configure Environment Variables

In Vercel project settings → "Environment Variables", add:

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
DATABASE_URL=postgresql://... (automatically added if using Vercel Postgres)
```

### Step 5: Run Database Migrations

```bash
# Clone your deployed app or use existing local copy
cd your-project
cd server

# Install dependencies if not already done
npm install

# Set DATABASE_URL to your production database
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy
npx prisma generate
```

### Step 6: Test Your Deployment

- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-app.vercel.app/api/health`
- API docs: `https://your-app.vercel.app/api`

That's it! Your full-stack application is now live on Vercel with serverless backend functions.

---

## 🏠 Local Development

### Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm
- PostgreSQL database

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/agent-teaching-platform.git
cd agent-teaching-platform

# Install all dependencies (frontend + backend)
pnpm run install:all

# Copy environment variables
cp .env.example .env
# Edit .env with your local database URL and JWT secret

# Set up database
pnpm run db:migrate
pnpm run db:generate

# Start both frontend and backend
pnpm run dev:full
```

### Available Scripts

```bash
# Development
pnpm run dev              # Start frontend only (with API proxy)
pnpm run dev:full         # Start both frontend and backend
pnpm run server:dev       # Start backend only

# Building
pnpm run build            # Build frontend only
pnpm run build:full       # Build frontend and install backend deps

# Database
pnpm run db:migrate       # Run database migrations
pnpm run db:generate      # Generate Prisma client
pnpm run db:studio        # Open Prisma Studio

# Installation
pnpm run install:all      # Install both frontend and backend deps
```

---

## 🌐 Frontend-Only Deployment

If you want to deploy just the frontend (using existing backend):

### Vercel

```bash
# Update vite.config.js to point to your backend
export default defineConfig({
  // ... other config
  define: {
    'process.env.VITE_API_URL': JSON.stringify('https://your-backend-url.com')
  }
})

# Deploy
vercel
```

### Netlify

```bash
# Build the project
pnpm run build

# Deploy with Netlify CLI
netlify deploy --prod --dir=dist
```

### Other Static Hosts

```bash
# Build the project
pnpm run build

# Upload the dist/ folder to your hosting service
```

---

## 🔧 Backend-Only Deployment

### Railway

1. Create new project on [railway.app](https://railway.app)
2. Connect GitHub repository
3. Set root directory to `server`
4. Add environment variables:
   ```env
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret
   PORT=3001
   NODE_ENV=production
   ```
5. Deploy

### Render

1. Create new Web Service on [render.com](https://render.com)
2. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
3. Add environment variables
4. Deploy

### Heroku

```bash
# From project root
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=your-secret
git subtree push --prefix server heroku main
```

---

## 🚀 Full-Stack Deployment Options

### Option 1: Vercel (Recommended) ⭐

**Pros:** Easy setup, serverless functions, great performance, integrated database
**Best for:** Most use cases, especially MVP and production apps

Setup covered in [Quick Start](#quick-start---vercel-full-stack) above.

### Option 2: Vercel Frontend + Railway Backend

**Pros:** More control over backend, persistent servers
**Best for:** Apps with complex backend requirements

1. Deploy backend to Railway (see above)
2. Deploy frontend to Vercel with `VITE_API_URL` pointing to Railway
3. Configure CORS in backend to allow Vercel domain

### Option 3: Single VPS

**Pros:** Full control, cost-effective for high traffic
**Best for:** Large applications, custom requirements

```bash
# On your server (Ubuntu/Debian)
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx postgresql

# Set up database
sudo -u postgres createdb agent_platform

# Clone and build
git clone your-repo
cd agent-teaching-platform
pnpm run install:all
pnpm run build

# Set up environment
cp .env.example .env
# Edit .env with production values

# Run migrations
cd server && npx prisma migrate deploy

# Install PM2 and start backend
sudo npm install -g pm2
pm2 start server/index.js --name agent-backend

# Configure Nginx (serve frontend + proxy API)
# Copy nginx.conf to /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/agent-platform /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

---

## � Database Setup

### Vercel Postgres (Recommended for Vercel deployment)

1. In Vercel dashboard → Storage → Create Database → Postgres
2. Environment variables are automatically added
3. Run migrations from local machine:
   ```bash
   # Copy DATABASE_URL from Vercel
   export DATABASE_URL="postgres://..."
   cd server
   npx prisma migrate deploy
   ```

### Railway PostgreSQL

1. Create PostgreSQL service on Railway
2. Copy connection URL
3. Add to environment variables as `DATABASE_URL`
4. Run migrations

### Local PostgreSQL

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib  # Ubuntu/Debian
brew install postgresql                          # macOS

# Create database
sudo -u postgres createdb agent_platform

# Set DATABASE_URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/agent_platform"
```

---

## 🔒 Environment Variables

### Production Environment Variables

**Frontend (automatically handled in Vercel full-stack):**
```env
VITE_API_URL=/api  # Uses same domain in full-stack deployment
```

**Backend (required):**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
PORT=3001

# Optional
UPLOAD_MAX_SIZE=10485760
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Security Notes

- Use a strong `JWT_SECRET` (at least 32 characters)
- Never commit `.env` files to Git
- Use different secrets for development and production
- Rotate secrets regularly in production

---

## ✅ Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] API health check responds: `/health`
- [ ] Database connection works
- [ ] User registration/login works
- [ ] File uploads work (if enabled)
- [ ] Email notifications work (if configured)
- [ ] HTTPS is enabled
- [ ] Environment variables are secure
- [ ] Error monitoring is set up (optional)

---

## 🐛 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear dependencies and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
rm -rf server/node_modules server/package-lock.json
cd server && npm install
```

**Database Connection Issues:**
```bash
# Test connection
cd server
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$connect().then(() => console.log('Connected!')).catch(console.error)"
```

**API Not Working:**
- Check Vercel function logs in dashboard
- Verify environment variables are set
- Test API endpoints directly: `/api/health`

**CORS Errors:**
- Update `server/index.js` CORS configuration
- Add your domain to allowed origins

### Debugging Tips

```bash
# Check Vercel deployment logs
vercel logs

# Test API locally
curl https://your-app.vercel.app/api/health

# Check database connection
cd server && npx prisma studio
```

---

## 📚 Additional Resources

- [Vercel Full-Stack Guide](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

**Need help?** 
- Check the [GitHub Issues](https://github.com/yourusername/agent-teaching-platform/issues)
- Join our [Discord Community](https://discord.gg/your-invite)
- Email support: support@yourapp.com

