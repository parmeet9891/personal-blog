# Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment

- [ ] **MongoDB Atlas Setup**
  - [ ] Created MongoDB Atlas account
  - [ ] Created a cluster (M0 Free tier)
  - [ ] Created database user with password
  - [ ] Whitelisted all IPs (0.0.0.0/0)
  - [ ] Copied connection string
  - [ ] Tested connection locally

- [ ] **Code Preparation**
  - [ ] All code committed to Git
  - [ ] `.env.local` is in `.gitignore` (never commit secrets!)
  - [ ] Build succeeds locally (`npm run build`)
  - [ ] Tests pass (`npm test`)
  - [ ] Profile photo added to `/public/profile.jpg`

- [ ] **Git Repository**
  - [ ] Code pushed to GitHub/GitLab/Bitbucket
  - [ ] Repository is accessible
  - [ ] Main branch is up to date

## Deployment

- [ ] **Vercel Account**
  - [ ] Created Vercel account
  - [ ] Connected to Git provider (GitHub/GitLab/Bitbucket)

- [ ] **Import Project**
  - [ ] Imported repository to Vercel
  - [ ] Framework detected as Next.js
  - [ ] Root directory set correctly

- [ ] **Environment Variables**
  - [ ] `MONGODB_URI` - MongoDB Atlas connection string
  - [ ] `NEXTAUTH_SECRET` - Generated secure secret
  - [ ] `ADMIN_USERNAME` - Your admin username
  - [ ] `ADMIN_PASSWORD` - Secure password (changed from default!)
  - [ ] Variables added to all environments (Production, Preview, Development)

- [ ] **Deploy**
  - [ ] Clicked "Deploy" button
  - [ ] Build completed successfully
  - [ ] Received deployment URL

## Post-Deployment

- [ ] **Update Environment Variables**
  - [ ] Updated `NEXTAUTH_URL` with Vercel URL
  - [ ] Redeployed project

- [ ] **Testing**
  - [ ] Homepage loads correctly
  - [ ] Navigation works (Home, Blog)
  - [ ] Blog listing page works
  - [ ] Admin login works (`/admin/login`)
  - [ ] Can create new article
  - [ ] Can edit existing article
  - [ ] Can delete article
  - [ ] Articles appear on homepage
  - [ ] Articles appear on blog page
  - [ ] Individual article pages work
  - [ ] Markdown rendering works correctly

- [ ] **Database Verification**
  - [ ] Articles saved to MongoDB Atlas
  - [ ] Can query articles from Atlas dashboard
  - [ ] Sessions working correctly

## Optional

- [ ] **Custom Domain**
  - [ ] Added custom domain in Vercel
  - [ ] Configured DNS settings
  - [ ] Updated `NEXTAUTH_URL` to custom domain
  - [ ] SSL certificate active

- [ ] **Performance**
  - [ ] Checked Lighthouse score
  - [ ] Verified images are optimized
  - [ ] Tested on mobile devices

- [ ] **Security**
  - [ ] Changed default admin password
  - [ ] Verified environment variables are secure
  - [ ] Tested unauthorized access redirects

## Quick Commands

```bash
# Generate secure secret for NEXTAUTH_SECRET
openssl rand -base64 32

# Test build locally
npm run build

# Run tests
npm test

# Push to Git
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Common Issues

**Build fails**: Check Vercel logs, ensure all dependencies are in package.json

**Database errors**: Verify MongoDB connection string and IP whitelist

**Auth not working**: Check NEXTAUTH_SECRET and NEXTAUTH_URL are set correctly

**Articles not showing**: Verify isPublished is true and check API logs

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Full detailed guide
