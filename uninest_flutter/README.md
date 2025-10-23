# UniNest Flutter Application

A complete Flutter replication of the UniNest React + Node.js web application, providing a digital campus hub experience across Web, Android, and iOS platforms.

## 📱 Features

- **Authentication System**: Complete Supabase integration with role-based access (Student, Vendor, Admin)
- **Responsive Design**: Pixel-perfect UI matching the original React application
- **Real-time Updates**: WebSocket integration for live notifications and chat
- **Payment Integration**: Razorpay for secure transactions
- **Multi-platform**: Single codebase for Web, Android, and iOS

## 🚀 Getting Started

### Prerequisites

- Flutter SDK (>=3.0.0)
- Dart SDK
- Android Studio / Xcode (for mobile development)
- Supabase account
- Razorpay account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/uninest_flutter.git
cd uninest_flutter
```

2. **Install dependencies**
```bash
flutter pub get
```

3. **Configure environment variables**

Create a `.env` file in the root directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
RAZORPAY_KEY=your_razorpay_key
API_BASE_URL=https://api.uninest.app
```

4. **Run the application**

For Web:
```bash
flutter run -d chrome --dart-define=SUPABASE_URL=your_url --dart-define=SUPABASE_ANON_KEY=your_key
```

For Android:
```bash
flutter run -d android --dart-define=SUPABASE_URL=your_url --dart-define=SUPABASE_ANON_KEY=your_key
```

For iOS:
```bash
flutter run -d ios --dart-define=SUPABASE_URL=your_url --dart-define=SUPABASE_ANON_KEY=your_key
```

## 📁 Project Structure

```
lib/
├── core/
│   ├── config/         # App configuration
│   ├── constants/      # App constants
│   ├── providers/      # Riverpod providers
│   ├── router/         # GoRouter navigation
│   ├── theme/          # App theming
│   └── utils/          # Utility functions
├── data/
│   ├── models/         # Data models
│   ├── repositories/   # Data repositories
│   └── services/       # API services
├── presentation/
│   ├── pages/          # App pages/screens
│   ├── widgets/        # Reusable widgets
│   └── layouts/        # Layout components
└── main.dart           # App entry point
```

## 🎨 UI Components

All UI components exactly match the React application:

- **Layouts**: MainLayout, VendorLayout, AdminLayout
- **Navigation**: Sidebar, BottomNav, UserDropdown
- **Forms**: LoginForm, SignupForm, ProfileForm
- **Cards**: ProductCard, HostelCard, NotificationCard
- **Modals**: Dialogs, BottomSheets, Popups

## 🔧 State Management

Using Riverpod for state management:

- **AuthProvider**: User authentication state
- **ThemeProvider**: Theme mode (light/dark)
- **NotificationProvider**: Real-time notifications
- **VendorProvider**: Vendor-specific state
- **AdminProvider**: Admin dashboard state

## 🌐 API Integration

All API endpoints match the original Node.js backend:

- **Authentication**: `/api/auth/*`
- **User Management**: `/api/users/*`
- **Marketplace**: `/api/marketplace/*`
- **Bookings**: `/api/bookings/*`
- **Payments**: `/api/payments/*`
- **Admin**: `/api/admin/*`
- **Vendor**: `/api/vendor/*`

## 📱 Responsive Design

The app is fully responsive with breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🏗️ Building for Production

### Web Build
```bash
flutter build web --release --dart-define=SUPABASE_URL=your_url --dart-define=SUPABASE_ANON_KEY=your_key
```

### Android Build
```bash
flutter build apk --release --dart-define=SUPABASE_URL=your_url --dart-define=SUPABASE_ANON_KEY=your_key
flutter build appbundle --release --dart-define=SUPABASE_URL=your_url --dart-define=SUPABASE_ANON_KEY=your_key
```

### iOS Build
```bash
flutter build ios --release --dart-define=SUPABASE_URL=your_url --dart-define=SUPABASE_ANON_KEY=your_key
```

## 🚀 Deployment

### Web Deployment (Netlify/Vercel)
1. Build the web version
2. Deploy the `build/web` folder

### Android Deployment (Google Play)
1. Build the app bundle
2. Upload to Google Play Console

### iOS Deployment (App Store)
1. Build the iOS app
2. Upload via Xcode or Transporter

## 🧪 Testing

Run tests:
```bash
flutter test
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
