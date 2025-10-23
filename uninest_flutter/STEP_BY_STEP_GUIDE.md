# 📘 Step-by-Step Production Launch Guide for UniNest Flutter

This guide is designed for developers who may not be experts. Follow each step carefully.

---

## 🚨 **WEEK 1: Critical Security & Setup** (Days 1-7)

### Day 1-2: Secure Your API Keys (URGENT - 2-3 hours)

#### Step 1: Rotate Compromised Credentials

**Your keys were exposed in Git history. You MUST change them immediately.**

1. **Open your browser and go to Supabase:**
   - URL: https://supabase.com/dashboard
   - Login to your account
   - Click on your project "dfkgefoqodjccrrqmqis"

2. **Generate NEW Supabase keys:**
   - Click "Settings" → "API"
   - Find "anon/public" key
   - Click "Reset" button
   - Copy the NEW key (it will look different from the old one)
   - Save it somewhere safe (we'll use it in Step 3)

3. **Rotate Razorpay keys:**
   - Go to https://dashboard.razorpay.com/app/keys
   - Find your current keys
   - Click "Generate New Key Pair"
   - Copy BOTH the Key ID and Secret
   - Save them somewhere safe

#### Step 2: Create .env File

1. **Open your file explorer:**
   - Navigate to: `C:\Users\JA\OneDrive\Desktop\uninest_flutter`

2. **Create a new file called `.env`** (note the dot at the start):
   ```
   Right-click → New → Text Document
   Name it: .env (remove .txt extension)
   ```

3. **Open `.env` with Notepad and paste:**
   ```env
   SUPABASE_URL=https://dfkgefoqodjccrrqmqis.supabase.co
   SUPABASE_ANON_KEY=YOUR_NEW_SUPABASE_KEY_HERE
   RAZORPAY_KEY=YOUR_NEW_RAZORPAY_KEY_HERE
   API_BASE_URL=https://api.uninest.app
   ```

4. **Replace the placeholder values:**
   - Replace `YOUR_NEW_SUPABASE_KEY_HERE` with the new Supabase key you copied
   - Replace `YOUR_NEW_RAZORPAY_KEY_HERE` with the new Razorpay key

5. **Save and close the file**

#### Step 3: Verify .gitignore

1. **Open `.gitignore` file** in your project
2. **Make sure it contains:**
   ```
   .env
   .env.local
   *.env
   ```
3. **If not, add those lines and save**

#### Step 4: Test With New Keys

1. **Open PowerShell** (Windows Key + X → PowerShell)

2. **Navigate to your project:**
   ```powershell
   cd C:\Users\JA\OneDrive\Desktop\uninest_flutter
   ```

3. **Load environment variables and run:**
   ```powershell
   $env:SUPABASE_URL = Get-Content .env | Select-String "SUPABASE_URL" | ForEach-Object { $_.ToString().Split('=')[1] }
   $env:SUPABASE_ANON_KEY = Get-Content .env | Select-String "SUPABASE_ANON_KEY" | ForEach-Object { $_.ToString().Split('=')[1] }
   $env:RAZORPAY_KEY = Get-Content .env | Select-String "RAZORPAY_KEY" | ForEach-Object { $_.ToString().Split('=')[1] }
   
   flutter run --dart-define=SUPABASE_URL=$env:SUPABASE_URL --dart-define=SUPABASE_ANON_KEY=$env:SUPABASE_ANON_KEY --dart-define=RAZORPAY_KEY=$env:RAZORPAY_KEY
   ```

4. **If app runs successfully, keys are working!**

#### Step 5: Delete Old Keys from Services

1. **Go back to Supabase dashboard**
   - Delete or disable the old anon key

2. **Go back to Razorpay dashboard**
   - Deactivate the old key pair

✅ **Checkpoint: Your app should now run with new, secure keys**

---

### Day 3-4: Set Up Firebase (4-6 hours)

#### Why Firebase?
Firebase provides crash reporting, analytics, and performance monitoring - essential for production apps.

#### Step 1: Create Firebase Project

1. **Go to https://console.firebase.google.com/**
2. **Click "Add Project"**
3. **Name it:** "UniNest Flutter"
4. **Enable Google Analytics:** Yes
5. **Click "Create Project"**

#### Step 2: Add Flutter App to Firebase

**For Android:**
1. In Firebase console, click "Add app" → Android icon
2. **Android package name:** `com.uninest.app` (use the same one from your project)
3. Download `google-services.json`
4. Place it in: `C:\Users\JA\OneDrive\Desktop\uninest_flutter\android\app\`

**For iOS:**
1. Click "Add app" → iOS icon
2. **iOS bundle ID:** `com.uninest.app`
3. Download `GoogleService-Info.plist`
4. Place it in: `C:\Users\JA\OneDrive\Desktop\uninest_flutter\ios\Runner\`

**For Web:**
1. Click "Add app" → Web icon
2. **App nickname:** "UniNest Web"
3. Copy the Firebase config object
4. We'll use it in Step 3

#### Step 3: Configure Firebase in Flutter

1. **Open `pubspec.yaml`**
2. **Add these dependencies:**
   ```yaml
   dependencies:
     firebase_core: ^2.24.0
     firebase_analytics: ^10.8.0
     firebase_crashlytics: ^3.4.0
   ```

3. **Save and run:**
   ```powershell
   flutter pub get
   ```

4. **Update `lib/main.dart`** - find this line:
   ```dart
   void main() async {
   ```
   
   And add Firebase initialization:
   ```dart
   void main() async {
     WidgetsFlutterBinding.ensureInitialized();
     
     // Initialize Firebase
     await FirebaseService().initialize();
     
     // Rest of your existing code...
   ```

#### Step 4: Enable Crashlytics

1. **Go to Firebase Console**
2. **Click "Crashlytics" in left menu**
3. **Click "Enable Crashlytics"**
4. **Follow the setup wizard**

#### Step 5: Test Firebase Integration

1. **Run your app:**
   ```powershell
   flutter run
   ```

2. **Check Firebase Console:**
   - Go to Analytics → Events
   - You should see some initial events within 24 hours

✅ **Checkpoint: Firebase is now tracking your app**

---

### Day 5-7: Validate Backend Integration (8-10 hours)

#### What This Means:
Test that all your Supabase queries, Razorpay payments, and file uploads actually work.

#### Step 1: Test Authentication Flow

1. **Run your app**
2. **Try these actions and note any errors:**
   - [ ] Sign up with a new email
   - [ ] Log in with existing email
   - [ ] Reset password
   - [ ] Log out
   - [ ] Stay logged in after closing and reopening app

**If anything fails:**
- Check your Supabase dashboard → Authentication → Settings
- Ensure email provider is enabled
- Check browser console for errors

#### Step 2: Test Database Queries

1. **Browse products in Marketplace:**
   - [ ] Products load successfully
   - [ ] Search works
   - [ ] Filters work
   - [ ] Product details page loads

**If products don't load:**
- Open Supabase dashboard → Table Editor
- Check if `products` table exists and has data
- Check Row Level Security (RLS) policies

2. **Test Orders:**
   - [ ] Can add products to cart
   - [ ] Cart persists after page reload
   - [ ] Can view past orders

#### Step 3: Test Razorpay Payment

1. **Add product to cart**
2. **Click "Checkout"**
3. **Test payment with Razorpay test card:**
   - Card Number: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: Any future date

4. **Verify:**
   - [ ] Payment dialog opens
   - [ ] Payment completes successfully
   - [ ] Order status updates to "paid"
   - [ ] Payment appears in Razorpay dashboard

**If payment fails:**
- Check Razorpay dashboard → Settings → API Keys
- Ensure test mode is enabled
- Check webhook configuration

#### Step 4: Test File Uploads

1. **Try uploading a profile picture:**
   - [ ] File picker opens
   - [ ] Image uploads successfully
   - [ ] Image appears in UI
   - [ ] Image URL is saved to database

2. **Check Supabase Storage:**
   - Dashboard → Storage
   - Verify `avatars` bucket exists
   - Check if uploaded file is there

**If uploads fail:**
- Check storage bucket policies
- Ensure bucket is public or has correct RLS

#### Step 5: Test Real-time Features

1. **Open app in two browsers/devices**
2. **Send a chat message from one**
3. **Verify it appears instantly on the other**

**If real-time doesn't work:**
- Check Supabase dashboard → Database → Replication
- Ensure real-time is enabled for tables
- Check browser console for WebSocket errors

✅ **Checkpoint: All integrations working**

---

## 📊 **WEEK 2: Quality & Testing** (Days 8-14)

### Day 8-10: Implement Missing Features (12-16 hours)

#### Current Placeholders to Replace:

1. **Story Feature** (`lib/presentation/pages/social/social_page.dart`)
   - Lines showing "Story feature will be available soon"
   - **Action needed:** Implement story upload and viewer OR hide the feature

2. **Share Functionality**
   - Currently shows "Share feature coming soon"
   - **Action needed:** Add share_plus package and implement sharing

3. **AI Optimizer** in Vendor Dashboard
   - Shows placeholder dialog
   - **Action needed:** Implement or hide behind feature flag

#### How to Hide Features (Quick Fix):

**Option 1: Comment out the feature**
```dart
// Temporarily disabled - coming in v2
// IconButton(
//   icon: Icon(Icons.share),
//   onPressed: () => _sharePost(context, post),
// ),
```

**Option 2: Add feature flag**
```dart
class FeatureFlags {
  static const bool enableStories = false;
  static const bool enableSharing = false;
  static const bool enableAIOptimizer = false;
}

// Then in code:
if (FeatureFlags.enableStories) {
  // Show stories
}
```

### Day 11-12: Write Tests (8-10 hours)

#### Step 1: Run Existing Tests

```powershell
cd C:\Users\JA\OneDrive\Desktop\uninest_flutter
flutter test
```

**You should see:**
- `test/unit/models/product_model_test.dart` - PASS
- `test/unit/utils/validators_test.dart` - PASS

#### Step 2: Add Widget Tests

Create `test/widgets/product_card_test.dart`:
```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:uninest_flutter/presentation/widgets/marketplace/product_card.dart';

void main() {
  testWidgets('ProductCard displays product information', (WidgetTester tester) async {
    // Test code here
  });
}
```

#### Step 3: Run Integration Tests

```powershell
flutter test integration_test/app_test.dart
```

**This will take 5-10 minutes to run all flows**

### Day 13-14: Set Up CI/CD (4-6 hours)

#### Step 1: Create GitHub Repository

1. **Go to https://github.com/new**
2. **Name:** `uninest-flutter`
3. **Private repository:** Yes (recommended)
4. **Click "Create repository"**

#### Step 2: Push Your Code

```powershell
cd C:\Users\JA\OneDrive\Desktop\uninest_flutter
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/uninest-flutter.git
git push -u origin main
```

#### Step 3: Add Secrets to GitHub

1. **Go to your repository**
2. **Settings → Secrets and variables → Actions**
3. **Click "New repository secret"**
4. **Add these secrets:**
   - Name: `SUPABASE_URL`, Value: (your Supabase URL)
   - Name: `SUPABASE_ANON_KEY`, Value: (your Supabase anon key)
   - Name: `RAZORPAY_KEY`, Value: (your Razorpay key)

#### Step 4: Enable GitHub Actions

1. **GitHub automatically detects `.github/workflows/flutter_ci.yml`**
2. **Go to "Actions" tab**
3. **You should see workflow running**

✅ **Checkpoint: Tests run automatically on every commit**

---

## 🚀 **WEEK 3: Release Preparation** (Days 15-21)

### Day 15-16: Create Legal Pages (4-6 hours)

#### Privacy Policy

1. **Use a generator:** https://www.privacypolicygenerator.info/
2. **Fill in:**
   - Company name: UniNest
   - App name: UniNest
   - Data collected: Email, Name, Profile picture, Usage data
   - Third parties: Supabase, Razorpay, Firebase
3. **Download the generated policy**
4. **Create page:** `lib/presentation/pages/legal/privacy_policy_page.dart`

#### Terms of Service

1. **Use generator:** https://www.termsofservicegenerator.net/
2. **Create page:** `lib/presentation/pages/legal/terms_of_service_page.dart`

### Day 17-18: Prepare Store Listings (6-8 hours)

#### App Icons

1. **Create 1024x1024 PNG logo**
2. **Use https://appicon.co/ to generate all sizes**
3. **Place generated icons in:**
   - Android: `android/app/src/main/res/`
   - iOS: `ios/Runner/Assets.xcassets/AppIcon.appiconset/`

#### Screenshots

**You need screenshots for:**
- **Android:** 
  - Phone (1080x1920)
  - Tablet (1920x1200)
- **iOS:**
  - 6.5" iPhone (1284x2778)
  - 5.5" iPhone (1242x2208)
  - 12.9" iPad (2048x2732)

**How to capture:**
```powershell
# Run on specific device
flutter run -d <device_id>

# Take screenshots using device tools
```

#### App Description

**For both stores (max 4000 characters):**
```
UniNest - Your Complete Campus Companion

🏠 Find Your Perfect PG
Browse verified PG accommodations near your campus with real photos, reviews, and instant booking.

📚 Study Hub
Access shared notes, study materials, and resources from students across India.

💼 Internships & Competitions
Discover internship opportunities and participate in national-level competitions.

🛒 Campus Marketplace
Buy and sell products, find services, and connect with vendors in your campus ecosystem.

👥 Social Connect
Connect with fellow students, share updates, and stay engaged with your campus community.

Features:
✓ Verified listings and profiles
✓ Secure payments via Razorpay
✓ Real-time notifications
✓ Multi-language support
✓ Dark mode support
✓ Works offline

Join thousands of students already using UniNest!
```

### Day 19-21: Final Testing & Bug Fixes (8-12 hours)

#### Test Matrix

**Test on these devices:**
- [ ] Android Phone (Android 10+)
- [ ] Android Tablet
- [ ] iPhone (iOS 14+)
- [ ] iPad
- [ ] Chrome Browser
- [ ] Safari Browser

**Test these flows:**
- [ ] Complete signup → login → browse → purchase flow
- [ ] Vendor: Add product → receive order → update status
- [ ] Social: Create post → like → comment → delete
- [ ] Workspace: Apply for internship → check status
- [ ] Settings: Change profile → upload avatar → save

**Performance:**
- [ ] App starts in < 3 seconds
- [ ] Pages load in < 2 seconds
- [ ] No crashes during 30-minute usage
- [ ] Memory usage stays < 200MB

✅ **Checkpoint: App is stable and tested**

---

## 🎉 **WEEK 4: Soft Launch** (Days 22-28)

### Day 22-23: Deploy to Testing

#### Web (Netlify)

1. **Go to https://app.netlify.com/signup**
2. **Connect your GitHub account**
3. **New site from Git → Select your repo**
4. **Build settings:**
   - Build command: `flutter build web --release`
   - Publish directory: `build/web`
5. **Environment variables:**
   - Add all your secrets from `.env`
6. **Deploy!**

#### Android (Internal Testing)

1. **Build APK:**
   ```powershell
   flutter build apk --release
   ```

2. **Create Google Play Console account**
   - Cost: $25 one-time fee
   - URL: https://play.google.com/console/signup

3. **Create app:**
   - App name: UniNest
   - Category: Education
   - Content rating: Everyone

4. **Upload APK to Internal Testing track**
5. **Add test users' emails**
6. **Send test link to 5-10 users**

#### iOS (TestFlight)

1. **Create Apple Developer account**
   - Cost: $99/year
   - URL: https://developer.apple.com/programs/

2. **Build iOS:**
   ```powershell
   flutter build ios --release
   ```

3. **Open Xcode:**
   ```powershell
   open ios/Runner.xcworkspace
   ```

4. **Archive → Upload to App Store Connect**
5. **Add to TestFlight**
6. **Invite beta testers**

### Day 24-26: Beta Testing

**Send to 10-20 trusted users:**
- 5 students
- 3 vendors
- 2 admins

**Ask them to test:**
- All major features
- Report any bugs
- Give UI/UX feedback

**Create a Google Form for feedback:**
- What worked well?
- What didn't work?
- Any crashes?
- Suggestions?

### Day 27-28: Fix Critical Bugs

**Priority:**
1. **Critical:** App crashes, payment failures, data loss
2. **High:** Missing features, broken navigation, UI issues
3. **Medium:** Performance issues, minor bugs
4. **Low:** UI tweaks, feature requests

---

## 🚀 **WEEK 5: Public Launch!**

### Pre-Launch Checklist

- [ ] All critical bugs fixed
- [ ] Privacy policy live and linked in app
- [ ] Terms of service live and linked in app
- [ ] Support email set up (support@uninest.app)
- [ ] Analytics dashboard configured
- [ ] Crash reporting working
- [ ] Payment system tested with real transactions
- [ ] All API keys rotated and secured
- [ ] Backup system in place
- [ ] Monitoring alerts configured

### Launch Day Actions

1. **Submit to App Stores:**
   - Google Play: Review takes 1-3 days
   - Apple App Store: Review takes 1-7 days

2. **Announce:**
   - Social media posts
   - Email to early users
   - Campus forums/groups

3. **Monitor:**
   - Check Firebase Crashlytics every hour
   - Monitor Supabase real-time dashboard
   - Watch payment transactions

4. **Be Ready:**
   - Have your team on standby
   - Respond to user issues within 1 hour
   - Push hotfixes if critical bugs appear

---

## 🆘 **Need Help?**

### Getting Stuck?

1. **Check the error message** - Google it
2. **Read documentation:**
   - Flutter: https://docs.flutter.dev
   - Supabase: https://supabase.com/docs
   - Razorpay: https://razorpay.com/docs

3. **Ask for help:**
   - Stack Overflow (tag: flutter, supabase)
   - Flutter Discord: https://discord.gg/flutter
   - Reddit: r/FlutterDev

### Common Issues & Solutions

**"Flutter command not found"**
- Solution: Install Flutter SDK from https://docs.flutter.dev/get-started/install

**"Supabase client error"**
- Check your `.env` file has correct keys
- Verify Supabase project URL is correct

**"Build failed"**
- Run: `flutter clean && flutter pub get`
- Delete `build` folder and rebuild

**"App crashes on startup"**
- Check Firebase Crashlytics for error logs
- Verify all required permissions are granted

---

## ✅ **Final Verification**

**One day before public launch, verify:**

- [ ] App runs on all target platforms
- [ ] All features work as expected
- [ ] No "coming soon" placeholders visible
- [ ] Payment processing works
- [ ] Real-time features operational
- [ ] Analytics tracking events
- [ ] Crash reporting configured
- [ ] Support channels ready
- [ ] Legal pages accessible
- [ ] Store listings approved
- [ ] Marketing materials ready
- [ ] Team briefed on launch plan

---

**🎊 Congratulations! You're ready to launch UniNest Flutter!**

**Last updated:** October 23, 2025  
**Estimated total time:** 5-6 weeks  
**Questions?** Check `PRODUCTION_CHECKLIST.md` for detailed task breakdown
