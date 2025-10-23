# 🔒 Security Setup Guide for UniNest Flutter

## ⚠️ CRITICAL: Your API Keys Were Exposed

Your Supabase and Razorpay credentials were committed to the codebase. **You must rotate them immediately.**

### Step 1: Rotate Compromised Credentials

#### Rotate Supabase Keys
1. Go to https://supabase.com/dashboard/project/dfkgefoqodjccrrqmqis/settings/api
2. Click "Generate new anon key"
3. Update your `.env` file with the new key
4. **Do NOT commit the new key to Git**

#### Rotate Razorpay Keys
1. Go to https://dashboard.razorpay.com/app/keys
2. Generate new API keys
3. Update your `.env` file
4. Delete the old keys from Razorpay dashboard

### Step 2: Set Up Environment Variables

1. **Create `.env` file** (this file should be in `.gitignore`):
```bash
cd c:\Users\JA\OneDrive\Desktop\uninest_flutter
cp .env.example .env
```

2. **Add your NEW credentials** to `.env`:
```env
SUPABASE_URL=https://your-new-project.supabase.co
SUPABASE_ANON_KEY=your-new-anon-key
RAZORPAY_KEY=your-new-razorpay-key
API_BASE_URL=https://api.uninest.app
```

3. **Verify `.gitignore` includes**:
```
.env
.env.local
*.env
```

### Step 3: Run App With Environment Variables

#### For Development:

**Windows (PowerShell)**:
```powershell
$env:SUPABASE_URL="your-url"; $env:SUPABASE_ANON_KEY="your-key"; flutter run --dart-define=SUPABASE_URL=$env:SUPABASE_URL --dart-define=SUPABASE_ANON_KEY=$env:SUPABASE_ANON_KEY
```

**Linux/Mac**:
```bash
chmod +x run_with_env.sh
./run_with_env.sh
```

#### For Production Builds:

**Web**:
```bash
flutter build web --release \
  --dart-define=SUPABASE_URL=$SUPABASE_URL \
  --dart-define=SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
  --dart-define=RAZORPAY_KEY=$RAZORPAY_KEY
```

**Android**:
```bash
flutter build apk --release \
  --dart-define=SUPABASE_URL=$SUPABASE_URL \
  --dart-define=SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
  --dart-define=RAZORPAY_KEY=$RAZORPAY_KEY
```

**iOS**:
```bash
flutter build ios --release \
  --dart-define=SUPABASE_URL=$SUPABASE_URL \
  --dart-define=SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
  --dart-define=RAZORPAY_KEY=$RAZORPAY_KEY
```

### Step 4: Additional Security Measures

1. **Enable Row Level Security (RLS)** on all Supabase tables
2. **Set up Razorpay webhooks** with signature verification
3. **Use service role key** only on backend (never in Flutter app)
4. **Implement rate limiting** on API endpoints
5. **Enable 2FA** on Supabase and Razorpay accounts

### Step 5: Monitor for Exposed Secrets

Install git-secrets to prevent future commits with secrets:
```bash
# Install git-secrets
git secrets --install
git secrets --register-aws
```

## ✅ Security Checklist

- [ ] Rotated Supabase anon key
- [ ] Rotated Razorpay keys
- [ ] Created `.env` file with new credentials
- [ ] Verified `.env` is in `.gitignore`
- [ ] Removed hardcoded keys from `app_config.dart`
- [ ] Enabled RLS on Supabase tables
- [ ] Set up webhook signature verification
- [ ] Enabled 2FA on all accounts
- [ ] Tested app with environment variables
- [ ] Updated deployment pipelines with secret management
