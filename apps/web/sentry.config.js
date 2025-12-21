// Sentry configuration for Next.js
// This configures Sentry SDK behavior for this app

const nextJsOptions = {
    // Upload source maps for better error debugging
    // Set to false if you don't want to upload source maps
    hideSourceMaps: true,

    // Disable the Sentry webpack plugin in dev mode
    disableLogger: true,
};

export const sentryWebpackPluginOptions = {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,

    // Only upload source maps if auth token is present
    silent: !process.env.SENTRY_AUTH_TOKEN,

    // Pass the auth token
    authToken: process.env.SENTRY_AUTH_TOKEN,
};

export default nextJsOptions;
