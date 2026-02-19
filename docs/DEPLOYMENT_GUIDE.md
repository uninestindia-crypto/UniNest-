# 🚀 UniNest Deployment & Launch Guide

A comprehensive, step-by-step guide to deploy and launch the UniNest platform across all environments.

---

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Environment Setup](#-environment-setup)
3. [Local Development](#-local-development)
4. [Web Deployment (Vercel)](#-web-deployment-vercel)
5. [Mobile App Deployment (EAS)](#-mobile-app-deployment-eas)
6. [Supabase Backend Setup](#-supabase-backend-setup)
7. [CI/CD Pipelines](#-cicd-pipelines)
8. [Production Checklist](#-production-checklist)
9. [Troubleshooting](#-troubleshooting)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | v20+ | JavaScript runtime |
| **pnpm** | v9.0.0 | Package manager (monorepo) |
| **Git** | Latest | Version control |
| **VS Code** | Latest | Recommended IDE |

### Install pnpm
```bash
npm install -g pnpm@9.0.0
```

### Accounts Required
- **[Supabase](https://supabase.com)** - Backend database & auth
- **[Vercel](https://vercel.com)** - Web hosting (free tier available)
- **[Expo](https://expo.dev)** - Mobile app builds (EAS)
- **[Razorpay](https://razorpay.com)** - Payment processing

---

## 🔧 Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/studio-uninest.git
cd studio-uninest
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Supabase (from your Supabase project settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Razorpay (from Razorpay Dashboard → Settings → API Keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# Admin credentials
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_password

# Optional: Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

> ⚠️ **Security Note**: Never commit `.env` files to version control!

---

## 💻 Local Development

### Start All Apps
```bash
pnpm dev
```

### Start Web App Only
```bash
pnpm dev:web
```
Open [http://localhost:3000](http://localhost:3000) to view the web app.

### Start Mobile App Only
```bash
pnpm dev:mobile
```
This starts Expo Dev Server. Scan the QR code with the **Expo Go** app on your phone.

### Run Tests
```bash
pnpm test
```

### Lint & Type Check
```bash
pnpm lint
pnpm typecheck
```

---

## 🌐 Web Deployment (Vercel)

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/studio-uninest)

### Option 2: Manual Deployment

#### Step 1: Connect to Vercel
```bash
npm install -g vercel
vercel login
```

#### Step 2: Link Your Project
```bash
vercel link
```

#### Step 3: Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

| Variable | Environment |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `SUPABASE_SERVICE_KEY` | Production |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Production |
| `RAZORPAY_KEY_SECRET` | Production |

#### Step 4: Deploy
```bash
vercel --prod
```

### Deployment Settings (vercel.json)
The project includes a `vercel.json` for function timeout configuration:
```json
{
  "functions": {
    "src/app/api/create-order/route.ts": {
      "maxDuration": 15
    }
  }
}
```

---

## 📱 Mobile App Deployment (EAS)

### Prerequisites
1. Create an [Expo account](https://expo.dev/signup)
2. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   eas login
   ```

### Configure Mobile Environment

Navigate to the mobile app:
```bash
cd apps/mobile
```

Copy environment variables:
```bash
cp .env.example .env
```

### Build Profiles

The project supports three build profiles:

| Profile | Purpose | Command |
|---------|---------|---------|
| `development` | Local testing with dev client | `eas build --profile development` |
| `preview` | Internal testing (TestFlight/Internal Track) | `eas build --profile preview` |
| `production` | App Store/Play Store release | `eas build --profile production` |

### Build Commands

```bash
# Development build (creates a dev client)
eas build --profile development --platform all

# Preview build (internal testing)
eas build --profile preview --platform all

# Production build (store submission)
eas build --profile production --platform all
```

### Submit to App Stores

```bash
# Submit to Apple App Store
eas submit --platform ios

# Submit to Google Play Store
eas submit --platform android
```

> 📖 For detailed app store preparation, see [apps/mobile/APP_STORE_PREP.md](apps/mobile/APP_STORE_PREP.md)

---

## 🗄️ Supabase Backend Setup

### 1. Create a New Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to initialize

### 2. Get Your API Keys
Navigate to **Settings → API** and copy:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_KEY`

### 3. Apply Database Indexes
For optimal performance, apply the recommended indexes:

```bash
node scripts/apply_indexes.mjs
```

Or run the SQL manually in Supabase SQL Editor:
```sql
-- See scripts/supabase_indexes.sql for full index definitions
```

### 4. Configure Authentication
In Supabase Dashboard → Authentication → Settings:
- Enable Email/Password sign-ups
- Configure OAuth providers (optional)
- Set redirect URLs for your domain

### 5. Configure Storage Buckets
Create buckets for:
- `avatars` - User profile images
- `products` - Product/listing images
- `documents` - Uploaded files

---

## 🔄 CI/CD Pipelines

The project includes GitHub Actions workflows for automated deployment:

### Web CI (`web-ci.yml`)
Triggers on changes to `apps/web/**` or `packages/**`:
1. **Lint & Typecheck** - Code quality checks
2. **Unit Tests** - Run test suite
3. **Build** - Verify production build succeeds

### Mobile CI (`mobile-ci.yml`)
Triggers on changes to `apps/mobile/**`:
1. **Lint** - Code quality checks
2. **Typecheck** - TypeScript validation
3. **Unit Tests** - Run Jest tests

### Mobile EAS Build (`mobile-eas-build.yml`)
Triggers on push to `main` branch or manual dispatch:
- Builds Android & iOS apps via EAS
- Optional: Auto-submit to stores for production builds

### Required GitHub Secrets

Add these secrets in **GitHub → Settings → Secrets**:

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `EXPO_TOKEN` | Expo access token (from expo.dev) |

---

## ✅ Production Checklist

### Before Launch

#### Web App
- [ ] Environment variables configured in Vercel
- [ ] Custom domain connected
- [ ] SSL certificate active
- [ ] Analytics configured (Google Analytics / Vercel Analytics)
- [ ] Error tracking setup (Sentry)
- [ ] SEO meta tags configured
- [ ] Sitemap generated
- [ ] robots.txt configured

#### Mobile App
- [ ] App icons created (1024×1024)
- [ ] Splash screen designed
- [ ] App Store listing content ready
- [ ] Screenshots for all device sizes
- [ ] Privacy Policy URL live
- [ ] Terms of Service URL live
- [ ] Push notifications tested
- [ ] Deep links configured

#### Backend
- [ ] Production Supabase project created
- [ ] Database indexes applied
- [ ] Row Level Security (RLS) policies enabled
- [ ] Storage bucket policies configured
- [ ] Edge Functions deployed (if any)
- [ ] Backup strategy in place

#### Payments
- [ ] Razorpay production keys configured
- [ ] Webhook endpoints verified
- [ ] Test transactions completed

---

## 🔧 Troubleshooting

### Common Issues

#### `pnpm install` fails
```bash
# Clear cache and retry
pnpm store prune
rm -rf node_modules
pnpm install
```

#### Turbo cache issues
```bash
# Clear Turbo cache
rm -rf .turbo
pnpm dev
```

#### EAS build fails
```bash
# Ensure you're logged in
eas login

# Check build logs
eas build:list
```

#### Supabase connection errors
- Verify environment variables are correct
- Check if Supabase project is active (not paused)
- Confirm RLS policies aren't blocking access

#### Vercel deployment fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure `pnpm-lock.yaml` is committed

### Getting Help
- 📖 [Next.js Documentation](https://nextjs.org/docs)
- 📖 [Expo Documentation](https://docs.expo.dev)
- 📖 [Supabase Documentation](https://supabase.com/docs)
- 📖 [TurboRepo Documentation](https://turbo.build/repo/docs)

---

## 📚 Quick Reference

### Essential Commands

```bash
# Development
pnpm dev              # Start all apps
pnpm dev:web          # Start web only
pnpm dev:mobile       # Start mobile only

# Quality
pnpm lint             # Run linter
pnpm typecheck        # Type checking
pnpm test            # Run tests

# Build
pnpm build            # Build all apps

# Mobile Builds
cd apps/mobile
eas build --profile preview --platform all    # Internal testing
eas build --profile production --platform all # Store release
eas submit --platform ios                     # Submit to App Store
eas submit --platform android                 # Submit to Play Store
```

### Project Structure

```
studio-uninest/
├── apps/
│   ├── mobile/         # React Native (Expo) app
│   └── web/           # Next.js web app
├── packages/          # Shared packages
├── scripts/           # Utility scripts
├── docs/             # Documentation
├── .github/workflows/ # CI/CD pipelines
└── src/              # Main web app source
```

---

**Happy Deploying! 🎉**

*Last updated: December 2024*
