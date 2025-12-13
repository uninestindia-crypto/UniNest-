const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable Hermes for better performance
config.transformer.getTransformOptions = async () => ({
    transform: {
        experimentalImportSupport: false,
        inlineRequires: true, // Reduces startup time
    },
});

// Optimize bundle by removing unused code
config.transformer.minifierConfig = {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
        keep_classnames: true,
        keep_fnames: true,
    },
};

// Enable lazy loading for large modules
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
