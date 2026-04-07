# Vercel Deployment Guide

A complete guide to deploy **SAurForm** to production on Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up free at [vercel.com](https://vercel.com))
- OpenAI API key (from [platform.openai.com](https://platform.openai.com/api-keys))
- MongoDB URI (optional — for database persistence)

## Step 1: Prepare Your Git Repository

### 1.1 Initialize Git (if not already done)

```bash
cd Form_creator
git init
git add .
git commit -m "Initial commit: SAurForm SaaS"
```

### 1.2 Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `saur-forms` (or your preference)
3. Click **"Create repository"**
4. Follow the instructions to push your local code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/saur-forms.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### 2.1 Connect GitHub to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Paste your GitHub repo URL: `https://github.com/YOUR_USERNAME/saur-forms.git`
5. Click **"Import"**

### 2.2 Configure Build Settings

Vercel auto-detects Next.js. Confirm:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

All should be pre-filled. Click **"Continue"**.

## Step 3: Set Environment Variables

### 3.1 Add Environment Variables

Before deploying, add your secrets:

1. In the Vercel import flow, find **"Environment Variables"** section
2. Add the following:

| Key | Value | Required |
|---|---|---|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `NEXT_PUBLIC_USE_MONGODB` | `false` (for now) | No |
| `MONGODB_URI` | (leave blank for now) | No |

3. Click **"Deploy"**

Vercel will build and deploy your app. The URL will be something like:
```
https://saur-forms.vercel.app
```

## Step 4: Access Your Production App

Once deployment completes (indicated by a ✓ checkmark):

1. Click the deployment preview URL
2. Your app is live! 🚀
3. Test the AI form generation and all features

## Step 5: (Optional) Connect MongoDB for Database Persistence

### 5.1 Get a MongoDB Connection String

**Option A: MongoDB Atlas (Cloud)**
1. Go to [mongodb.com/cloud](https://mongodb.com/cloud)
2. Sign up / Log in
3. Create a free cluster
4. Go to **"Database Access"** → **"Add New Database User"**
   - Username: `saur-forms`
   - Password: (generate strong password, copy it)
5. Go to **"Network Access"** → **"Add IP Address"**
   - Add `0.0.0.0/0` (allows Vercel)
6. Click **"Databases"** → **"Connect"**
   - Choose **"Drivers"** (not MongoDB Compass)
   - Copy the connection string
   - Replace `<password>` with your password
   - Replace `myFirstDatabase` with `saur-forms`

**Example:**
```
mongodb+srv://saur-forms:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/saur-forms?retryWrites=true&w=majority
```

**Option B: Local MongoDB (for development only)**
```
mongodb://localhost:27017/saur-forms
```

### 5.2 Update Vercel Environment Variables

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your **saur-forms** project
3. Click **"Settings"** → **"Environment Variables"**
4. Add / Update:
   - `MONGODB_URI`: Paste your connection string
   - `NEXT_PUBLIC_USE_MONGODB`: Change to `true`
5. Click **"Save"**
6. Vercel will auto-redeploy with the new env vars

### 5.3 Verify MongoDB Connection

Once redeployed:
1. Open your app at `https://saur-forms.vercel.app`
2. Create a new form
3. Submit a response
4. Check production MongoDB to confirm data persisted:
   - MongoDB Atlas → Browse Collections → Check `saur_forms` collection

## Step 6: Custom Domain (Optional)

1. Go to Vercel project → **"Settings"** → **"Domains"**
2. Enter your domain (e.g., `forms.yourcompany.com`)
3. Update DNS records as shown
4. Once propagated, your app is accessible at your custom domain

## Troubleshooting

### Deployment fails with "Build error"

1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Verify `npm run build` works locally:
   ```bash
   npm run build
   npm run start
   ```

### MongoDB connection fails

1. Verify `MONGODB_URI` format is correct
2. Check MongoDB credentials are correct
3. Ensure IP `0.0.0.0/0` is whitelisted in MongoDB Atlas (for Vercel IPs)
4. Test locally with the same URI to confirm connectivity

### OpenAI API returns 401

1. Verify `OPENAI_API_KEY` is copied correctly (no trailing spaces)
2. Check the key has "gpt-4o-mini" model access
3. Confirm your OpenAI account has available credits/quota

### App runs locally but not on Vercel

1. Check Vercel function logs:
   - Go to Vercel dashboard → Deployments → Function Logs
2. Verify all dependencies are in `package.json`
3. Check for hardcoded paths or URLs that won't work in Vercel

## Redeployment

### Auto-redeployment (Recommended)

Every `git push` to `main` branch auto-triggers a new Vercel deployment:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Manual Redeployment

1. Vercel dashboard → Select project
2. Click **"Deployments"** → **"Redeploy"** (on latest deployment)

## Monitoring and Logs

1. **Vercel Analytics**: Dashboard → **"Analytics"** tab
2. **Function Logs**: Deployments tab → Select deployment → **"Function Logs"**
3. **Errors**: Check browser console (F12) and Vercel logs for API errors

## Production Readiness Checklist

- ✅ GitHub repo created and pushed
- ✅ Vercel project connected
- ✅ `OPENAI_API_KEY` set in Vercel env vars
- ✅ App builds successfully (`npm run build` passes)
- ✅ App runs without errors at https://YOUR_PROJECT.vercel.app
- ✅ AI form generation works
- ✅ Forms and responses submit correctly
- ✅ (Optional) MongoDB configured and storing data
- ✅ (Optional) Custom domain configured

## Next Steps

- **Monitor**: Check Vercel analytics and logs regularly
- **Scale**: Add MongoDB when you need cross-device persistence
- **Iterate**: Push updates via git; Vercel auto-deploys

---

**Questions?** Check the [Vercel Docs](https://vercel.com/docs) or open an issue on GitHub.
