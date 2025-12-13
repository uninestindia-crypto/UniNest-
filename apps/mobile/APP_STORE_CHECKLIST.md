# App Store Submission Checklist

## Pre-Submission Requirements

### ✅ Completed
- [x] Core app functionality implemented
- [x] Authentication flow working
- [x] Push notifications configured
- [x] Deep linking set up
- [x] Crash reporting (Sentry) integrated
- [x] Analytics tracking implemented
- [x] Offline support configured
- [x] Privacy policy screen added

### 📦 Assets Required

#### App Icons
Create the following files in `apps/mobile/assets/`:

| File | Size | Platform | Notes |
|------|------|----------|-------|
| `icon.png` | 1024×1024 | Both | Main app icon, no transparency |
| `adaptive-icon.png` | 1024×1024 | Android | Foreground layer for adaptive icons |
| `splash.png` | 1284×2778 | Both | Splash screen, centered logo |
| `notification-icon.png` | 96×96 | Android | Monochrome, for notifications |
| `favicon.png` | 48×48 | Web | Browser favicon |

> **Design Tips:**
> - Use your brand blue (#3b82f6) as primary color
> - Ensure icon is recognizable at small sizes
> - Avoid text in the icon
> - Test on both light and dark backgrounds

#### Screenshots (Required for Store Listings)

**iPhone Screenshots** (6.7" display: 1290×2796):
1. Home/Marketplace view
2. Product detail page
3. Search results
4. Booking flow
5. Profile page
6. Vendor dashboard (optional)

**Android Screenshots** (Phone: 1080×1920):
1. Same screens as iPhone
2. At least 2 screenshots required

> **Tip:** Use Expo Go or a simulator to capture. Tools like [Fastlane Screengrab](https://docs.fastlane.tools/actions/screengrab/) can automate this.

---

## Store Listing Content

### App Name
**Uninest** (Max: 30 chars iOS, 50 chars Android)

### Subtitle (iOS only)
*Student Services Marketplace* (Max: 30 chars)

### Short Description (Android)
*Find hostels, PG, mess & more - all in one app!* (Max: 80 chars)

### Full Description

```
Uninest is your one-stop platform for student services.

🏠 FIND PERFECT ACCOMMODATION
Browse verified hostels, PGs, and rental rooms near your college. Compare prices, amenities, and reviews to find your ideal home away from home.

🍽️ DISCOVER FOOD SERVICES
Find mess halls, tiffin services, and canteens. Check menus, pricing, and subscribe to meal plans that fit your schedule and budget.

📚 BOOK STUDY SPACES
Reserve seats at nearby libraries and co-working spaces. Hourly and monthly plans available for focused study sessions.

💼 EXPLORE OPPORTUNITIES
Discover internships, competitions, and events tailored for students. Stay ahead with curated opportunities from top companies.

FOR VENDORS:
• List your services easily with our vendor dashboard
• Manage bookings and orders in real-time
• Track revenue with detailed analytics
• Reach thousands of students in your area

WHY UNINEST?
✓ Verified listings only
✓ Secure payments with Razorpay
✓ Real-time notifications
✓ 24/7 customer support

Download now and simplify your campus life!
```

### Keywords (iOS only)
`student, hostel, PG, accommodation, mess, food, study, workspace, booking, campus, college, rent, room`

### Category
- Primary: **Lifestyle**
- Secondary: **Productivity** or **Education**

---

## Technical Requirements

### iOS (App Store Connect)

- [ ] Apple Developer Account ($99/year)
- [ ] Bundle ID registered: `com.uninest.app`
- [ ] App Store Connect app created
- [ ] App Information completed
- [ ] Privacy policy URL provided
- [ ] Age rating questionnaire completed
- [ ] Export compliance (Set to "No" for standard encryption)

### Android (Google Play Console)

- [ ] Google Play Developer Account ($25 one-time)
- [ ] Package name: `com.uninest.app`
- [ ] App signing by Google Play enabled
- [ ] Store listing completed
- [ ] Content rating questionnaire completed
- [ ] Privacy policy URL provided
- [ ] Target audience declared (13+)

---

## Build & Submit Commands

```bash
# Navigate to mobile app
cd apps/mobile

# Install dependencies
npm install

# Build for both platforms
eas build --profile production --platform all

# Or build separately
eas build --profile production --platform ios
eas build --profile production --platform android

# Submit to stores
eas submit --platform ios --latest
eas submit --platform android --latest
```

---

## Pre-Launch Testing

### TestFlight (iOS)
1. Build with `eas build --profile production --platform ios`
2. Submit to App Store Connect via `eas submit --platform ios`
3. Add internal testers in TestFlight
4. Distribute and gather feedback

### Internal Testing (Android)
1. Build with `eas build --profile production --platform android`
2. Upload to Play Console
3. Set up Internal Testing track
4. Add testers via email list
5. Distribute and gather feedback

---

## Final Review Checklist

### Functionality
- [ ] All screens load correctly
- [ ] Login/signup works
- [ ] Payments process successfully
- [ ] Push notifications received
- [ ] Deep links work
- [ ] Offline mode handles gracefully

### Performance
- [ ] App starts in < 3 seconds
- [ ] Smooth scrolling (60fps)
- [ ] Images load efficiently
- [ ] No memory leaks

### Compliance
- [ ] Privacy policy accessible
- [ ] Terms of service accessible
- [ ] Data collection disclosed
- [ ] Permissions explained

### Accessibility
- [ ] VoiceOver/TalkBack tested
- [ ] Touch targets ≥ 44pt
- [ ] Color contrast meets WCAG AA
- [ ] Labels on all interactive elements

---

## Post-Launch

- [ ] Monitor crash reports in Sentry
- [ ] Track user analytics
- [ ] Respond to user reviews
- [ ] Plan first update with bug fixes
- [ ] Set up A/B testing for screenshots
