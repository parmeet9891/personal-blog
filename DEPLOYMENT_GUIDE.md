# Deployment Guide - Vercel

## Prerequisites

- ✅ MongoDB Atlas account (free tier)
- ✅ Vercel account (free tier)
- ✅ Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 Free tier is sufficient)

2. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and strong password
   - Set privileges to "Read and write to any database"
   - Save the credentials securely

3. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is required for Vercel's dynamic IPs
   - Confirm the change

4. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `personal-blog`
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/personal-blog?retryWrites=true&w=majority`

## Step 2: Push Code to Git Repository

1. **Initialize Git (if not already done)**
   ```bash
   cd personal-blog
   git init
   git add .
   git commit -m "Initial commit - Personal Blog"
   ```

2. **Create GitHub Repository**
   - Go to [GitHub](https://github.com)
   - Click "New Repository"
   - Name it (e.g., "personal-blog")
   - Don't initialize with README (you already have code)
   - Create repository

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/personal-blog.git
   git branch -M main
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

1. **Sign Up/Login to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Sign up with your GitHub account
   - This will automatically connect your repositories

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your `personal-blog` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Add Environment Variables**
   Click "Environment Variables" and add these:

   | Name | Value | Notes |
   |------|-------|-------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string | From Step 1 |
   | `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` | Keep this secret! |
   | `NEXTAUTH_URL` | Leave empty for now | Vercel will auto-set this |
   | `ADMIN_USERNAME` | `Parmeet` | Your admin username |
   | `ADMIN_PASSWORD` | Your secure password | Change from default! |

   **Important**: Make sure to add these to all environments (Production, Preview, Development)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for the build to complete
   - Vercel will provide you with a URL (e.g., `https://personal-blog-xyz.vercel.app`)

6. **Update NEXTAUTH_URL**
   - After deployment, go to your project settings
   - Go to "Environment Variables"
   - Update `NEXTAUTH_URL` with your Vercel URL
   - Redeploy the project

## Step 4: Verify Deployment

1. **Test Public Pages**
   - Visit your Vercel URL
   - Check homepage loads correctly
   - Navigate to `/blog` page
   - Try viewing an article (if you have any)

2. **Test Admin Access**
   - Go to `/admin/login`
   - Login with your credentials
   - Create a test article
   - Verify it appears on the homepage and blog page

3. **Test Database Connection**
   - Check Vercel deployment logs for any MongoDB errors
   - Verify articles are being saved to MongoDB Atlas

## Step 5: Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to your project settings in Vercel
   - Click "Domains"
   - Add your custom domain (e.g., `blog.yourdomain.com`)
   - Follow Vercel's DNS configuration instructions

2. **Update Environment Variables**
   - Update `NEXTAUTH_URL` to your custom domain
   - Redeploy

## Environment Variables Reference

```env
# Required for Production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/personal-blog?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-secure-random-string-here
NEXTAUTH_URL=https://your-app.vercel.app
ADMIN_USERNAME=Parmeet
ADMIN_PASSWORD=your-secure-password
```

## Troubleshooting

### Build Fails
- Check Vercel build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Database Connection Errors
- Verify MongoDB Atlas connection string is correct
- Check that IP whitelist includes 0.0.0.0/0
- Ensure database user has correct permissions
- Check MongoDB Atlas cluster is running

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your deployment URL
- Clear browser cookies and try again

### Articles Not Showing
- Check MongoDB Atlas to see if articles are being saved
- Verify `isPublished` field is set to `true`
- Check Vercel function logs for API errors

## Continuous Deployment

Once set up, Vercel automatically:
- Deploys on every push to `main` branch
- Creates preview deployments for pull requests
- Provides deployment URLs for testing

To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Vercel will automatically build and deploy your changes!

## Security Recommendations

1. **Change Default Password**: Update `ADMIN_PASSWORD` from the default
2. **Use Strong Secrets**: Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`
3. **Keep Credentials Private**: Never commit `.env.local` to Git
4. **Regular Backups**: Export MongoDB data periodically
5. **Monitor Logs**: Check Vercel logs for suspicious activity

## Cost Considerations

- **Vercel Free Tier**: 
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  - Perfect for personal blogs

- **MongoDB Atlas Free Tier**:
  - 512 MB storage
  - Shared cluster
  - Sufficient for thousands of articles

Both free tiers are more than enough for a personal blog!

## Support

If you encounter issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Check [Next.js Documentation](https://nextjs.org/docs)
- Check [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- Review Vercel deployment logs for errors
