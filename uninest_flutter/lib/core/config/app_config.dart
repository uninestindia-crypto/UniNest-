class AppConfig {
  // Supabase Configuration
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: '', // Never commit actual keys
  );
  
  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: '', // Never commit actual keys
  );
  
  // Razorpay Configuration
  static const String razorpayKey = String.fromEnvironment(
    'RAZORPAY_KEY',
    defaultValue: '', // Never commit actual keys
  );
  
  // API Configuration
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.uninest.app',
  );
  
  // App Configuration
  static const String appName = 'UniNest';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'Your Digital Campus Hub';
  
  // Social Links
  static const String instagramUrl = 'https://www.instagram.com/uninest_x?igsh=MXhyaXhybmFndzY0NQ==';
  
  // Feature Flags
  static const bool enablePWA = true;
  static const bool enableNotifications = true;
  static const bool enableAnalytics = true;
  
  // Development
  static const bool isDevelopment = bool.fromEnvironment('dart.vm.product') == false;
}
