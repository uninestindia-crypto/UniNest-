# 🚀 Production Readiness Checklist for UniNest Flutter

## ✅ Completed Tasks

### 1. Security ✓
- [x] Removed hardcoded API keys from `app_config.dart`
- [x] Created `.env.example` template
- [x] Created `run_with_env.sh` for environment variable loading
- [x] Documented credential rotation process

---

## 🔴 Critical Tasks (Do Before Launch)

### 2. Rotate Compromised Credentials - **URGENT**
- [ ] **Rotate Supabase anon key** (exposed in Git history)
- [ ] **Rotate Razorpay keys** (exposed in Git history)
- [ ] Create new `.env` file with fresh credentials
- [ ] Test app with new credentials
- [ ] Delete old keys from service dashboards

**⏰ Estimated Time**: 30 minutes  
**📖 Guide**: See `SECURITY_SETUP.md`

---

### 3. Complete Feature Implementations

#### Remove Placeholder Functions
These functions currently show "coming soon" messages and need real implementations:

- [ ] **Story feature** in `lib/presentation/pages/social/social_page.dart`
  - `_showAddStoryDialog()` - Upload and create stories
  - `_viewStory()` - Story viewer with swipe navigation
  
- [ ] **Share functionality** in `lib/presentation/pages/social/social_page.dart`
  - `_sharePost()` - Share to external apps
  
- [ ] **AI Optimizer** in `lib/presentation/pages/vendor/vendor_dashboard_page.dart`
  - `_showAIOptimizer()` - Product listing optimization with AI

- [ ] **Competition filters** in `lib/presentation/pages/workspace/workspace_page.dart`
  - `_showCompetitionFilters()` - Advanced filtering UI

- [ ] **Create opportunity dialog** in `lib/presentation/pages/workspace/workspace_page.dart`
  - `_showCreateOpportunity()` - Full internship/competition posting flow

**⏰ Estimated Time**: 2-3 days  
**Priority**: High - These affect user experience

---

### 4. Backend Contract Validation

Create and run integration tests for all services:

- [ ] **Supabase Service** (`lib/data/services/supabase_service.dart`)
  - [ ] Test authentication flows (signup, login, logout, password reset)
  - [ ] Test all database queries (products, orders, users, notifications)
  - [ ] Test RPC functions (analytics, payment verification)
  - [ ] Verify Row Level Security policies work correctly

- [ ] **Payment Service** (`lib/data/services/payment_service.dart`)
  - [ ] Test Razorpay order creation
  - [ ] Test payment verification with signature
  - [ ] Test refund initiation
  - [ ] Test webhook handling

- [ ] **Storage Service** (`lib/data/services/storage_service.dart`)
  - [ ] Test image uploads (products, avatars)
  - [ ] Test document uploads
  - [ ] Test file deletion
  - [ ] Test bucket creation and permissions

- [ ] **Realtime Service** (`lib/data/services/realtime_service.dart`)
  - [ ] Test notification subscriptions
  - [ ] Test chat message delivery
  - [ ] Test presence tracking
  - [ ] Test broadcast events

**⏰ Estimated Time**: 1-2 days  
**Priority**: Critical - Prevents runtime failures

---

### 5. Add Quality Gates

#### Unit Tests
Create test files for core business logic:

- [ ] Create `test/unit/models/` tests
  - [ ] `product_model_test.dart`
  - [ ] `order_model_test.dart`
  - [ ] `user_model_test.dart`

- [ ] Create `test/unit/providers/` tests
  - [ ] `auth_provider_test.dart`
  - [ ] `marketplace_provider_test.dart`
  - [ ] `cart_provider_test.dart`

- [ ] Create `test/unit/utils/` tests
  - [ ] `validators_test.dart`
  - [ ] `responsive_test.dart`

#### Widget Tests
- [ ] Create `test/widgets/` tests for key UI components
  - [ ] `product_card_test.dart`
  - [ ] `loading_button_test.dart`
  - [ ] `navigation_test.dart`

#### Integration Tests
- [ ] Create `integration_test/app_test.dart`
  - [ ] User signup flow
  - [ ] Product browsing and purchase
  - [ ] Vendor dashboard navigation
  - [ ] Real-time notifications

#### CI/CD Setup
- [ ] Create `.github/workflows/flutter.yml` for GitHub Actions
- [ ] Configure automated testing on PR
- [ ] Add code coverage reporting
- [ ] Set up automated builds for releases

**⏰ Estimated Time**: 3-4 days  
**Priority**: High - Ensures code quality

---

### 6. Release Hygiene

#### Analytics & Monitoring Setup
- [ ] **Firebase Setup**
  - [ ] Create Firebase project
  - [ ] Add Firebase to Flutter (Web, Android, iOS)
  - [ ] Configure Firebase Analytics
  - [ ] Configure Firebase Crashlytics
  - [ ] Add custom analytics events

- [ ] **Error Logging**
  - [ ] Integrate Sentry or Firebase Crashlytics
  - [ ] Add error boundaries to critical flows
  - [ ] Set up alert notifications

- [ ] **Performance Monitoring**
  - [ ] Add Firebase Performance Monitoring
  - [ ] Monitor app startup time
  - [ ] Monitor API response times
  - [ ] Track screen rendering performance

#### Deployment Pipeline
- [ ] **Web Deployment**
  - [ ] Configure Netlify/Vercel deployment
  - [ ] Set up environment variables in hosting
  - [ ] Configure custom domain
  - [ ] Enable HTTPS

- [ ] **Android Deployment**
  - [ ] Generate release keystore
  - [ ] Configure app signing
  - [ ] Create Google Play Console account
  - [ ] Prepare store listing
  - [ ] Create internal testing track

- [ ] **iOS Deployment**
  - [ ] Create Apple Developer account
  - [ ] Configure code signing
  - [ ] Create App Store Connect listing
  - [ ] Set up TestFlight for beta testing

**⏰ Estimated Time**: 2-3 days  
**Priority**: Medium - Needed for launch

---

### 7. Launch Collateral

#### Legal & Compliance
- [ ] Create Privacy Policy page
- [ ] Create Terms of Service page
- [ ] Add cookie consent banner (for web)
- [ ] Add GDPR compliance measures
- [ ] Create data deletion flow

#### Store Listings
- [ ] **Google Play Store**
  - [ ] App icon (512x512)
  - [ ] Feature graphic (1024x500)
  - [ ] Screenshots (min 2, max 8)
  - [ ] App description (4000 chars max)
  - [ ] Promotional video (optional)

- [ ] **Apple App Store**
  - [ ] App icon (1024x1024)
  - [ ] Screenshots (6.5", 5.5", 12.9")
  - [ ] App preview video (optional)
  - [ ] App description (4000 chars max)
  - [ ] Keywords (100 chars max)

#### Support Infrastructure
- [ ] Set up support email (support@uninest.app)
- [ ] Create FAQ page
- [ ] Set up feedback collection form
- [ ] Create user documentation
- [ ] Set up status page for service monitoring

#### Marketing Materials
- [ ] Create landing page
- [ ] Prepare social media posts
- [ ] Create press release
- [ ] Design promotional graphics

**⏰ Estimated Time**: 3-4 days  
**Priority**: Medium - Can be done in parallel

---

## 📊 Testing Requirements

### Manual Testing Checklist

#### Authentication Flow
- [ ] User can sign up with email
- [ ] User can log in
- [ ] User can reset password
- [ ] User stays logged in after app restart
- [ ] Role-based routing works (student/vendor/admin)

#### Marketplace Flow
- [ ] Browse products with filters
- [ ] Search products
- [ ] View product details
- [ ] Add to cart
- [ ] Update cart quantities
- [ ] Complete checkout with Razorpay
- [ ] View order history

#### Vendor Dashboard
- [ ] View analytics
- [ ] Add new product
- [ ] Edit product
- [ ] Delete product
- [ ] View orders
- [ ] Update order status
- [ ] Manage subscription

#### Social Features
- [ ] Create post
- [ ] Like/unlike post
- [ ] Comment on post
- [ ] View user profiles
- [ ] Send messages

#### Workspace
- [ ] Browse internships
- [ ] Apply for internship
- [ ] Save internship
- [ ] Browse competitions
- [ ] Register for competition

### Device Testing Matrix

#### Web Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### Android Devices
- [ ] Android 10+ (multiple screen sizes)
- [ ] Test on emulator
- [ ] Test on physical device

#### iOS Devices
- [ ] iOS 14+ (iPhone & iPad)
- [ ] Test on simulator
- [ ] Test on physical device

---

## 📈 Success Metrics

Track these metrics post-launch:

- **User Engagement**
  - Daily/Monthly Active Users
  - Session duration
  - Screen views per session
  
- **Performance**
  - App crash rate (should be < 1%)
  - API error rate (should be < 0.1%)
  - Page load time (should be < 3s)
  
- **Business**
  - User signups
  - Order completion rate
  - Vendor registrations
  - Payment success rate

---

## 🎯 Launch Timeline

### Week 1: Critical Security & Backend
- Days 1-2: Rotate credentials, validate backend
- Days 3-5: Complete feature implementations
- Days 6-7: Integration testing

### Week 2: Quality & Infrastructure  
- Days 1-3: Add tests and CI/CD
- Days 4-5: Set up analytics and monitoring
- Days 6-7: Manual QA testing

### Week 3: Polish & Prepare
- Days 1-2: Fix bugs from QA
- Days 3-4: Prepare store listings
- Days 5-7: Create legal pages and support infrastructure

### Week 4: Soft Launch
- Days 1-2: Deploy to internal testing
- Days 3-5: Beta testing with select users
- Days 6-7: Fix critical issues

### Week 5: Public Launch 🚀

---

## 🆘 Need Help?

If you're not an expert (as indicated), here's where to get help:

1. **Flutter Documentation**: https://docs.flutter.dev
2. **Supabase Docs**: https://supabase.com/docs
3. **Razorpay Docs**: https://razorpay.com/docs
4. **Firebase Setup**: https://firebase.google.com/docs/flutter/setup
5. **Stack Overflow**: Tag questions with `flutter`, `supabase`, `razorpay`

---

## ✅ Final Verification Before Launch

Run this checklist the day before launch:

- [ ] All credentials rotated and secured
- [ ] All "coming soon" features completed or hidden
- [ ] All integration tests passing
- [ ] Manual testing completed on all platforms
- [ ] Analytics and crash reporting configured
- [ ] Privacy policy and terms of service published
- [ ] Store listings submitted and approved
- [ ] Support channels ready
- [ ] Monitoring dashboards set up
- [ ] Backup and disaster recovery plan in place
- [ ] Team trained on incident response

---

**Last Updated**: October 23, 2025  
**Status**: In Progress  
**Target Launch Date**: TBD (recommended 5-6 weeks from now)
