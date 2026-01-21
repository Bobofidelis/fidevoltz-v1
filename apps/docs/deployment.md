# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Environment variables configured

## Environment Variables

Create `.env.local` in `apps/frontend/`:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional: Email
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@yourdomain.com"
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## Database Setup

### 1. Run Migrations

```bash
npx prisma migrate deploy
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Seed Database (Optional)

```bash
npx prisma db seed
```

## Build for Production

### 1. Install Dependencies

```bash
cd apps/frontend
npm install
```

### 2. Build Application

```bash
npm run build
```

This will:
- Compile TypeScript
- Bundle JavaScript
- Optimize images
- Generate static pages

### 3. Test Production Build Locally

```bash
npm run start
```

Visit `http://localhost:3000` to verify.

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   - Push code to GitHub/GitLab/Bitbucket
   - Import project in Vercel dashboard

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Root Directory: `apps/frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add Environment Variables**
   - Add all variables from `.env.local`
   - Set `NEXTAUTH_URL` to your Vercel domain

4. **Deploy**
   - Vercel auto-deploys on push to main branch

### Option 2: Docker

1. **Create Dockerfile** (already exists in `apps/frontend/`)

2. **Build Image**
```bash
docker build -t fidevoltz-app ./apps/frontend
```

3. **Run Container**
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  -e NEXTAUTH_SECRET="..." \
  fidevoltz-app
```

### Option 3: VPS (Ubuntu/Debian)

1. **Install Dependencies**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2
```

2. **Clone Repository**
```bash
git clone https://github.com/yourusername/fidevoltz-website.git
cd fidevoltz-website/apps/frontend
```

3. **Install & Build**
```bash
npm install
npm run build
```

4. **Start with PM2**
```bash
pm2 start npm --name "fidevoltz" -- start
pm2 save
pm2 startup
```

5. **Setup Nginx Reverse Proxy**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Enable HTTPS with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Database Hosting

### Recommended Providers

1. **Vercel Postgres** (if using Vercel)
   - Integrated with Vercel
   - Auto-scaling
   - Easy setup

2. **Supabase**
   - Free tier available
   - Built on PostgreSQL
   - Additional features (auth, storage)

3. **Railway**
   - Simple setup
   - PostgreSQL included
   - Affordable pricing

4. **AWS RDS**
   - Enterprise-grade
   - High availability
   - More complex setup

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] HTTPS enabled
- [ ] NEXTAUTH_URL points to production domain
- [ ] Database backups configured
- [ ] Error monitoring setup (Sentry, LogRocket)
- [ ] Analytics configured (Google Analytics, Plausible)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Create admin user account
- [ ] Test all critical flows:
  - [ ] User registration
  - [ ] Login/logout
  - [ ] Product creation
  - [ ] Order placement
  - [ ] Cart operations
  - [ ] Comment posting

## Monitoring

### Error Tracking

Install Sentry:
```bash
npm install @sentry/nextjs
```

Configure in `next.config.ts`:
```typescript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(nextConfig, {
  org: "your-org",
  project: "fidevoltz",
});
```

### Performance Monitoring

Vercel Analytics (if using Vercel):
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## Scaling Considerations

### Database
- Enable connection pooling (PgBouncer)
- Add read replicas for heavy read operations
- Implement caching (Redis)

### Application
- Use CDN for static assets
- Enable Next.js Image Optimization
- Implement rate limiting
- Add database indexes for frequently queried fields

### Caching Strategy

```typescript
// In API routes
export const revalidate = 60; // Revalidate every 60 seconds

// For specific data
export async function GET() {
  const data = await fetch('...', {
    next: { revalidate: 3600 } // 1 hour
  });
}
```

## Backup Strategy

### Database Backups

**Automated (Recommended)**:
```bash
# Daily backup script
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup_$(date +%Y%m%d).sql s3://your-bucket/backups/
```

**Manual**:
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore from Backup

```bash
psql $DATABASE_URL < backup.sql
```

## Rollback Procedure

If deployment fails:

1. **Vercel**: Revert to previous deployment in dashboard
2. **Docker**: Run previous image version
3. **VPS**: 
   ```bash
   git checkout previous-commit
   npm run build
   pm2 restart fidevoltz
   ```

## Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Clear `.next` and `node_modules`
- Run `npm install` again

### Database Connection Issues
- Verify DATABASE_URL format
- Check firewall rules
- Ensure database accepts connections from deployment IP

### NextAuth Errors
- Verify NEXTAUTH_URL matches deployment URL
- Check NEXTAUTH_SECRET is set
- Ensure cookies are enabled

### 500 Errors
- Check server logs
- Verify all environment variables
- Check database connectivity
- Review Prisma schema matches database

## Support

For deployment issues:
- Check Next.js deployment docs
- Review Vercel/platform-specific guides
- Check application logs
- Test locally with production build first
