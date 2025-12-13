module.exports = {
    preset: 'jest-expo',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', '<rootDir>/jest.setup.js'],
    transformIgnorePatterns: [
        'node_modules/(?!(.pnpm/.*|)(react-native|@react-native|expo|@expo|react-navigation|@react-navigation|@unimodules|unimodules|sentry-expo|native-base|react-native-svg|@supabase|@tanstack|zustand))',
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@uninest/shared-types$': '<rootDir>/../../packages/shared-types/src',
        '^@uninest/api-client$': '<rootDir>/../../packages/api-client/src',
    },
    collectCoverageFrom: [
        '**/*.{js,jsx,ts,tsx}',
        '!**/coverage/**',
        '!**/node_modules/**',
        '!**/babel.config.js',
        '!**/jest.config.js',
        '!**/metro.config.js',
        '!**/.expo/**',
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
    testMatch: ['**/__tests__/**/*.test.{js,jsx,ts,tsx}', '**/*.test.{js,jsx,ts,tsx}'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
