# Deployment Guide

This guide covers different deployment options for the Agent Teaching Platform.

## 📋 Table of Contents

- [Local Development](#local-development)
- [Frontend Deployment](#frontend-deployment)
- [Backend Deployment](#backend-deployment)
- [Full-Stack Deployment](#full-stack-deployment)

---

## 🏠 Local Development

### Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/agent-teaching-platform.git
cd agent-teaching-platform

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The application will be available at http://localhost:5173

---

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

**Automatic Deployment:**

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Vite and configure build settings
6. Click "Deploy"

**Manual Deployment:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 2: Netlify

**Via Netlify CLI:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
pnpm run build

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

**Via Netlify Dashboard:**

1. Build your project: `pnpm run build`
2. Visit [netlify.com](https://netlify.com)
3. Drag and drop the `dist/` folder

### Option 3: GitHub Pages

```bash
# Install gh-pages
pnpm add -D gh-pages

# Add to package.json scripts:
"scripts": {
  "deploy": "gh-pages -d dist"
}

# Build and deploy
pnpm run build
pnpm run deploy
```

**Note:** Update `vite.config.js` for GitHub Pages:

```javascript
export default defineConfig({
  base: '/your-repo-name/',
  // ... other config
})
```

### Option 4: Static Hosting (AWS S3, Cloudflare Pages, etc.)

```bash
# Build the project
pnpm run build

# Upload the dist/ folder to your static hosting service
```

---

## 🔧 Backend Deployment

### Option 1: Railway

1. Visit [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Random secret key
   - `PORT` - 3001
5. Set root directory to `server`
6. Deploy

### Option 2: Render

1. Visit [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && node index.js`
   - **Environment:** Node
5. Add environment variables
6. Create service

### Option 3: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key

# Deploy
git subtree push --prefix server heroku main

# Or use Heroku Dashboard to connect GitHub
```

### Option 4: VPS (DigitalOcean, Linode, etc.)

```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/yourusername/agent-teaching-platform.git
cd agent-teaching-platform/server

# Install dependencies
npm install

# Install PM2 for process management
sudo npm install -g pm2

# Start server
pm2 start index.js --name agent-platform

# Save PM2 configuration
pm2 save
pm2 startup
```

---

## 🚀 Full-Stack Deployment

### Option 1: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
1. Deploy frontend to Vercel (see above)
2. Add environment variable: `VITE_API_URL=https://your-backend.railway.app`

**Backend (Railway):**
1. Deploy backend to Railway (see above)
2. Note the deployment URL

### Option 2: Single Server Deployment

**Using Nginx as reverse proxy:**

```nginx
# /etc/nginx/sites-available/agent-platform
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/agent-platform/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Setup:**

```bash
# Build frontend
pnpm run build

# Copy to web root
sudo cp -r dist/* /var/www/agent-platform/

# Start backend with PM2
cd server
pm2 start index.js

# Enable Nginx site
sudo ln -s /etc/nginx/sites-available/agent-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
```

### Backend (server/.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/agent_platform

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Server
PORT=3001
NODE_ENV=production

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload (optional)
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Dify API (optional)
DIFY_API_KEY=your-dify-api-key
DIFY_API_URL=https://api.dify.ai/v1
```

---

## 📊 Database Setup

### PostgreSQL on Railway

1. Create PostgreSQL database on Railway
2. Copy the `DATABASE_URL` connection string
3. Add to backend environment variables
4. Run Prisma migrations:

```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

### PostgreSQL on Render

1. Create PostgreSQL database on Render
2. Copy the connection string (External URL)
3. Add to backend environment variables
4. Run migrations (same as above)

---

## ✅ Post-Deployment Checklist

- [ ] Frontend is accessible via HTTPS
- [ ] Backend API is responding
- [ ] Database connection is working
- [ ] Environment variables are set correctly
- [ ] CORS is configured properly
- [ ] File uploads are working (if enabled)
- [ ] Email notifications work (if enabled)
- [ ] SSL certificate is installed
- [ ] Domain is configured correctly
- [ ] Monitoring is set up (optional)

---

## 🐛 Troubleshooting

### Frontend Issues

**Build fails:**
- Check Node.js version (18+)
- Clear cache: `rm -rf node_modules && pnpm install`
- Check for syntax errors in components

**Blank page after deployment:**
- Check browser console for errors
- Verify `base` path in `vite.config.js`
- Check API URL in environment variables

### Backend Issues

**Database connection fails:**
- Verify `DATABASE_URL` is correct
- Check database is running
- Run migrations: `npx prisma migrate deploy`

**API not responding:**
- Check server logs
- Verify PORT environment variable
- Check firewall settings

**CORS errors:**
- Update CORS configuration in `server/index.js`
- Add frontend URL to allowed origins

---

## 📚 Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

**Need help?** Open an issue on GitHub!

