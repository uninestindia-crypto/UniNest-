# App Store Preparation Checklist for Uninest

## Required Before Submission

### 1. App Icons

Create the following icon files in `apps/mobile/assets/`:

| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 1024×1024 | App Store icon (both platforms) |
| `adaptive-icon.png` | 1024×1024 | Android adaptive icon foreground |
| `favicon.png` | 48×48 | Web favicon |
| `splash.png` | 1284×2778 | Splash screen image |
| `notification-icon.png` | 96×96 | Push notification icon (Android) |

> **Tip**: Use [Expo Icon Generator](https://buildicon.netlify.app/) for quick generation.

---

### 2. App Store Listing Content

#### App Name
**Uninest** (30 characters max on iOS, 50 on Android)

#### Subtitle (iOS only)
*Student Services Marketplace* (30 characters max)

#### Short Description (Play Store)
*Find hostels, PG, mess, and more - all in one app!* (80 characters max)

#### Full Description
```
Uninest is your one-stop platform for student services.

🏠 Find the perfect accommodation
Browse verified hostels, PGs, and rental rooms near your college. Compare prices, amenities, and reviews.

🍽️ Discover food services
Find mess halls, tiffin services, and canteens. Check menus, pricing, and subscribe to meal plans.

📚 Book study spaces
Reserve seats at nearby libraries and study centers. Hourly and monthly plans available.

💪 Access fitness facilities
Explore gyms and fitness centers with student-friendly pricing.

For Vendors:
• List your services easily
• Manage bookings in real-time
• Track revenue and orders
• Reach thousands of students

Download now and simplify your campus life!
```

---

### 3. Screenshots

Create 6-8 screenshots for each platform:

| Screen | Description |
|--------|-------------|
| Home | Marketplace with categories |
| Search | Search results |
| Product Detail | Listing with book button |
| Booking | Payment flow |
| Profile | User profile |
| Vendor Dashboard | (For vendor-focused marketing) |

**Recommended Sizes**:
- iPhone: 1290×2796 (6.7" display)
- Android: 1080×1920 (Phone), 1200×1920 (7" Tablet)

---

### 4. Privacy & Compliance

- [ ] Privacy Policy URL (required)
- [ ] Terms of Service URL (required)
- [ ] Data collection disclosure
- [ ] Age rating questionnaire
- [ ] Export compliance (None if no encryption)

---

### 5. Technical Requirements

**iOS (App Store Connect)**:
- [ ] Apple Developer Account ($99/year)
- [ ] Bundle ID: `com.uninest.app`
- [ ] App Store Connect app created
- [ ] TestFlight for beta testing

**Android (Play Console)**:
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Package name: `com.uninest.app`
- [ ] Signing key generated (handled by EAS)
- [ ] Content rating questionnaire completed

---

### 6. Build Commands

```bash
# Development build (for testing native modules)
eas build --profile development --platform all

# Preview build (internal testing)
eas build --profile preview --platform all

# Production build (store submission)
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

### 7. Pre-Launch Checklist

- [ ] All screens tested on physical devices
- [ ] Push notifications working
- [ ] Deep links configured
- [ ] Analytics implemented
- [ ] Crash reporting (Sentry) configured
- [ ] Performance tested (startup < 3s)
- [ ] Accessibility labels added
- [ ] RTL support tested (if applicable)
