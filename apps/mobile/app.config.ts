import { ExpoConfig, ConfigContext } from 'expo/config';

const IS_DEV = process.env.APP_ENV === 'development';
const IS_PREVIEW = process.env.APP_ENV === 'preview';

const getAppName = () => {
    if (IS_DEV) return 'Uninest (Dev)';
    if (IS_PREVIEW) return 'Uninest (Preview)';
    return 'Uninest';
};

const getBundleIdentifier = () => {
    if (IS_DEV) return 'com.uninest.app.dev';
    if (IS_PREVIEW) return 'com.uninest.app.preview';
    return 'com.uninest.app';
};

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: getAppName(),
    slug: 'uninest',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'uninest',
    userInterfaceStyle: 'automatic',
    splash: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
        supportsTablet: true,
        bundleIdentifier: getBundleIdentifier(),
        config: {
            usesNonExemptEncryption: false,
        },
        infoPlist: {
            NSCameraUsageDescription: 'Used to take photos for listings and profile pictures',
            NSPhotoLibraryUsageDescription: 'Used to select photos for listings and profile pictures',
        },
        associatedDomains: ['applinks:uninest.app'],
    },
    android: {
        adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#ffffff',
        },
        package: getBundleIdentifier(),
        permissions: [
            'android.permission.CAMERA',
            'android.permission.READ_EXTERNAL_STORAGE',
            'android.permission.VIBRATE',
        ],
        intentFilters: [
            {
                action: 'VIEW',
                autoVerify: true,
                data: [{ scheme: 'https', host: 'uninest.app', pathPrefix: '/' }],
                category: ['BROWSABLE', 'DEFAULT'],
            },
        ],
    },
    web: {
        bundler: 'metro',
        output: 'static',
        favicon: './assets/favicon.png',
    },
    plugins: [
        'expo-router',
        'expo-secure-store',
        [
            'expo-notifications',
            {
                icon: './assets/notification-icon.png',
                color: '#3b82f6',
            },
        ],
        [
            'expo-image-picker',
            {
                photosPermission: 'Allow Uninest to access your photos for listings and profile pictures',
                cameraPermission: 'Allow Uninest to use your camera for listings and profile pictures',
            },
        ],
    ],
    experiments: {
        typedRoutes: true,
    },
    extra: {
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        razorpayKeyId: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
        apiUrl: process.env.EXPO_PUBLIC_API_URL,
        sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    },
});

