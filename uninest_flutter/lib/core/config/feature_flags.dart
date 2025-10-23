/// Feature flags for controlling feature availability
/// Set to false to hide incomplete features in production
class FeatureFlags {
  // Social features
  static const bool enableStories = false; // TODO: Implement story feature
  static const bool enablePostSharing = true; // Implemented
  static const bool enableVideoUpload = false; // TODO: Implement video upload
  
  // Vendor features
  static const bool enableAIOptimizer = false; // TODO: Implement AI optimizer
  static const bool enableBulkUpload = true; // Basic implementation exists
  static const bool enableAdvancedAnalytics = true; // Basic charts available
  
  // Workspace features
  static const bool enableCompetitionFilters = false; // TODO: Implement filters
  static const bool enableSkillAssessments = false; // Future feature
  static const bool enableResumeBuilder = false; // Future feature
  
  // Marketplace features
  static const bool enableAuctionMode = false; // Future feature
  static const bool enableWishlist = true; // Implemented
  static const bool enableProductComparison = false; // Future feature
  
  // Payment features
  static const bool enableCryptoPayment = false; // Future feature
  static const bool enableEMI = false; // Future feature
  static const bool enableWalletPayment = false; // Future feature
  
  // General features
  static const bool enableOfflineMode = true; // Basic caching available
  static const bool enablePushNotifications = true; // Implemented
  static const bool enableDarkMode = true; // Fully implemented
  static const bool enableMultiLanguage = false; // TODO: Add i18n
  
  /// Check if a feature is enabled
  static bool isEnabled(String featureName) {
    switch (featureName) {
      case 'stories':
        return enableStories;
      case 'post_sharing':
        return enablePostSharing;
      case 'ai_optimizer':
        return enableAIOptimizer;
      case 'competition_filters':
        return enableCompetitionFilters;
      case 'dark_mode':
        return enableDarkMode;
      default:
        return false;
    }
  }
  
  /// Get all enabled features
  static List<String> getEnabledFeatures() {
    final features = <String>[];
    
    if (enableStories) features.add('Stories');
    if (enablePostSharing) features.add('Post Sharing');
    if (enableAIOptimizer) features.add('AI Optimizer');
    if (enableCompetitionFilters) features.add('Competition Filters');
    if (enableDarkMode) features.add('Dark Mode');
    if (enablePushNotifications) features.add('Push Notifications');
    if (enableOfflineMode) features.add('Offline Mode');
    
    return features;
  }
  
  /// Get all disabled features (for debugging)
  static List<String> getDisabledFeatures() {
    final features = <String>[];
    
    if (!enableStories) features.add('Stories');
    if (!enablePostSharing) features.add('Post Sharing');
    if (!enableVideoUpload) features.add('Video Upload');
    if (!enableAIOptimizer) features.add('AI Optimizer');
    if (!enableCompetitionFilters) features.add('Competition Filters');
    if (!enableSkillAssessments) features.add('Skill Assessments');
    if (!enableResumeBuilder) features.add('Resume Builder');
    if (!enableMultiLanguage) features.add('Multi-Language');
    
    return features;
  }
}
