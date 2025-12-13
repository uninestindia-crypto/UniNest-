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
    },
    android: {
        adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#ffffff',
        },
        package: getBundleIdentifier(),
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
    ],
    experiments: {
        typedRoutes: true,
    },
    extra: {
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        razorpayKeyId: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
        eas: {
            projectId: '00a3c9e9-4033-4bfa-a419-e29777796f7d',
        },
    },
});
