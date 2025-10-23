import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';

class FirebaseService {
  static FirebaseService? _instance;
  late FirebaseAnalytics _analytics;
  late FirebaseCrashlytics _crashlytics;
  
  FirebaseService._();
  
  factory FirebaseService() {
    _instance ??= FirebaseService._();
    return _instance!;
  }
  
  Future<void> initialize() async {
    try {
      await Firebase.initializeApp();
      
      _analytics = FirebaseAnalytics.instance;
      _crashlytics = FirebaseCrashlytics.instance;
      
      // Enable crash reporting in production
      if (kReleaseMode) {
        await _crashlytics.setCrashlyticsCollectionEnabled(true);
        
        // Pass all uncaught errors to Crashlytics
        FlutterError.onError = _crashlytics.recordFlutterFatalError;
        
        // Pass all uncaught asynchronous errors to Crashlytics
        PlatformDispatcher.instance.onError = (error, stack) {
          _crashlytics.recordError(error, stack, fatal: true);
          return true;
        };
      }
      
      debugPrint('Firebase initialized successfully');
    } catch (e) {
      debugPrint('Failed to initialize Firebase: $e');
    }
  }
  
  // Analytics Methods
  Future<void> logEvent({
    required String name,
    Map<String, dynamic>? parameters,
  }) async {
    try {
      await _analytics.logEvent(
        name: name,
        parameters: parameters,
      );
    } catch (e) {
      debugPrint('Failed to log analytics event: $e');
    }
  }
  
  Future<void> logScreenView({
    required String screenName,
    String? screenClass,
  }) async {
    try {
      await _analytics.logScreenView(
        screenName: screenName,
        screenClass: screenClass,
      );
    } catch (e) {
      debugPrint('Failed to log screen view: $e');
    }
  }
  
  Future<void> setUserId(String userId) async {
    try {
      await _analytics.setUserId(id: userId);
      await _crashlytics.setUserIdentifier(userId);
    } catch (e) {
      debugPrint('Failed to set user ID: $e');
    }
  }
  
  Future<void> setUserProperties({
    required String name,
    required String value,
  }) async {
    try {
      await _analytics.setUserProperty(
        name: name,
        value: value,
      );
      await _crashlytics.setCustomKey(name, value);
    } catch (e) {
      debugPrint('Failed to set user property: $e');
    }
  }
  
  // Crashlytics Methods
  Future<void> recordError(
    dynamic exception,
    StackTrace? stack, {
    bool fatal = false,
    dynamic context,
  }) async {
    try {
      await _crashlytics.recordError(
        exception,
        stack,
        fatal: fatal,
        information: context != null ? [context] : null,
      );
    } catch (e) {
      debugPrint('Failed to record error: $e');
    }
  }
  
  Future<void> log(String message) async {
    try {
      await _crashlytics.log(message);
    } catch (e) {
      debugPrint('Failed to log message: $e');
    }
  }
  
  // Predefined Events
  Future<void> logLogin(String method) async {
    await logEvent(
      name: 'login',
      parameters: {'method': method},
    );
  }
  
  Future<void> logSignUp(String method) async {
    await logEvent(
      name: 'sign_up',
      parameters: {'method': method},
    );
  }
  
  Future<void> logPurchase({
    required String transactionId,
    required double value,
    required String currency,
    List<Map<String, dynamic>>? items,
  }) async {
    await logEvent(
      name: 'purchase',
      parameters: {
        'transaction_id': transactionId,
        'value': value,
        'currency': currency,
        if (items != null) 'items': items,
      },
    );
  }
  
  Future<void> logAddToCart({
    required String productId,
    required String productName,
    required double price,
  }) async {
    await logEvent(
      name: 'add_to_cart',
      parameters: {
        'item_id': productId,
        'item_name': productName,
        'price': price,
      },
    );
  }
  
  Future<void> logSearch(String searchTerm) async {
    await logEvent(
      name: 'search',
      parameters: {'search_term': searchTerm},
    );
  }
  
  Future<void> logShare({
    required String contentType,
    required String itemId,
  }) async {
    await logEvent(
      name: 'share',
      parameters: {
        'content_type': contentType,
        'item_id': itemId,
      },
    );
  }
  
  Future<void> logViewItem({
    required String itemId,
    required String itemName,
    required String itemCategory,
  }) async {
    await logEvent(
      name: 'view_item',
      parameters: {
        'item_id': itemId,
        'item_name': itemName,
        'item_category': itemCategory,
      },
    );
  }
}
