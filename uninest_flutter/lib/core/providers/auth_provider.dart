import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../data/models/user_model.dart';
import '../../data/models/notification_model.dart';
import '../../data/services/supabase_service.dart';

// User role enum matching React app
enum UserRole {
  student,
  vendor,
  coAdmin,
  admin,
  guest,
}

// Vendor subscription status
class VendorSubscriptionStatus {
  final bool isVendorActive;
  final bool isTrialActive;
  final bool hasActiveSubscription;
  
  const VendorSubscriptionStatus({
    required this.isVendorActive,
    required this.isTrialActive,
    required this.hasActiveSubscription,
  });
}

// Auth state class
class AuthState {
  final User? user;
  final UserRole role;
  final List<String> vendorCategories;
  final VendorSubscriptionStatus vendorSubscriptionStatus;
  final bool loading;
  final List<NotificationModel> notifications;
  final int unreadCount;
  
  const AuthState({
    this.user,
    this.role = UserRole.guest,
    this.vendorCategories = const [],
    this.vendorSubscriptionStatus = const VendorSubscriptionStatus(
      isVendorActive: false,
      isTrialActive: false,
      hasActiveSubscription: false,
    ),
    this.loading = true,
    this.notifications = const [],
    this.unreadCount = 0,
  });
  
  AuthState copyWith({
    User? user,
    UserRole? role,
    List<String>? vendorCategories,
    VendorSubscriptionStatus? vendorSubscriptionStatus,
    bool? loading,
    List<NotificationModel>? notifications,
    int? unreadCount,
  }) {
    return AuthState(
      user: user ?? this.user,
      role: role ?? this.role,
      vendorCategories: vendorCategories ?? this.vendorCategories,
      vendorSubscriptionStatus: vendorSubscriptionStatus ?? this.vendorSubscriptionStatus,
      loading: loading ?? this.loading,
      notifications: notifications ?? this.notifications,
      unreadCount: unreadCount ?? this.unreadCount,
    );
  }
}

// Auth provider
class AuthNotifier extends StateNotifier<AuthState> {
  final SupabaseService _supabaseService;
  StreamSubscription<AuthState>? _authStateSubscription;
  RealtimeChannel? _notificationChannel;
  
  AuthNotifier(this._supabaseService) : super(const AuthState()) {
    _initialize();
  }
  
  Future<void> _initialize() async {
    try {
      // Get initial session
      final session = _supabaseService.client.auth.currentSession;
      await _updateUserState(session?.user);
      
      // Listen to auth state changes
      _authStateSubscription = _supabaseService.client.auth.onAuthStateChange.listen((data) {
        _updateUserState(data.session?.user);
      });
    } catch (e) {
      debugPrint('Auth initialization error: $e');
      state = state.copyWith(loading: false);
    }
  }
  
  Future<void> _updateUserState(User? user) async {
    if (user == null) {
      state = const AuthState(loading: false);
      _notificationChannel?.unsubscribe();
      return;
    }
    
    // Determine role
    final role = _determineRole(user);
    
    // Get vendor categories
    final vendorCategories = _getVendorCategories(user);
    
    // Get vendor subscription status
    final subscriptionStatus = _getVendorSubscriptionStatus(user);
    
    // Ensure profile record exists
    await _ensureProfileRecord(user);
    
    // Fetch notifications
    final notifications = await _fetchNotifications(user.id);
    final unreadCount = notifications.where((n) => !n.isRead).length;
    
    state = AuthState(
      user: user,
      role: role,
      vendorCategories: vendorCategories,
      vendorSubscriptionStatus: subscriptionStatus,
      loading: false,
      notifications: notifications,
      unreadCount: unreadCount,
    );
    
    // Setup realtime notifications
    _setupRealtimeNotifications(user.id);
  }
  
  UserRole _determineRole(User? user) {
    if (user == null) return UserRole.guest;
    
    final roleString = user.userMetadata?['role'] as String?;
    switch (roleString) {
      case 'admin':
        return UserRole.admin;
      case 'vendor':
        return UserRole.vendor;
      case 'co-admin':
        return UserRole.coAdmin;
      case 'student':
      default:
        return UserRole.student;
    }
  }
  
  List<String> _getVendorCategories(User? user) {
    if (user == null || user.userMetadata?['role'] != 'vendor') {
      return [];
    }
    
    final categories = user.userMetadata?['vendor_categories'] as List<dynamic>?;
    return categories?.cast<String>() ?? [];
  }
  
  VendorSubscriptionStatus _getVendorSubscriptionStatus(User? user) {
    if (user == null || user.userMetadata?['role'] != 'vendor') {
      return const VendorSubscriptionStatus(
        isVendorActive: false,
        isTrialActive: false,
        hasActiveSubscription: false,
      );
    }
    
    // TODO: Implement vendor subscription logic based on user metadata
    return const VendorSubscriptionStatus(
      isVendorActive: true,
      isTrialActive: false,
      hasActiveSubscription: true,
    );
  }
  
  Future<void> _ensureProfileRecord(User user) async {
    try {
      // Check if profile exists
      final response = await _supabaseService.client
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
      
      if (response == null) {
        // Create profile if it doesn't exist
        await _supabaseService.client.from('profiles').insert({
          'id': user.id,
          'full_name': user.userMetadata?['full_name'],
          'avatar_url': user.userMetadata?['avatar_url'],
          'handle': user.userMetadata?['handle'],
        });
      }
    } catch (e) {
      debugPrint('Error ensuring profile record: $e');
    }
  }
  
  Future<List<NotificationModel>> _fetchNotifications(String userId) async {
    try {
      final response = await _supabaseService.client
          .from('notifications')
          .select('*, sender:sender_id (full_name, avatar_url)')
          .eq('user_id', userId)
          .order('created_at', ascending: false);
      
      return (response as List)
          .map((json) => NotificationModel.fromJson(json))
          .toList();
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
      return [];
    }
  }
  
  void _setupRealtimeNotifications(String userId) {
    _notificationChannel?.unsubscribe();
    
    _notificationChannel = _supabaseService.client
        .channel('notifications_$userId')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'notifications',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'user_id',
            value: userId,
          ),
          callback: (payload) async {
            final newNotification = NotificationModel.fromJson(payload.newRecord);
            
            // Fetch sender profile
            try {
              final senderResponse = await _supabaseService.client
                  .from('profiles')
                  .select('full_name, avatar_url')
                  .eq('id', newNotification.senderId)
                  .single();
              
              newNotification.sender = senderResponse;
            } catch (e) {
              debugPrint('Error fetching sender profile: $e');
            }
            
            state = state.copyWith(
              notifications: [newNotification, ...state.notifications],
              unreadCount: state.unreadCount + 1,
            );
          },
        )
        .subscribe();
  }
  
  Future<void> markAsRead(int notificationId) async {
    if (state.user == null) return;
    
    try {
      await _supabaseService.client
          .from('notifications')
          .update({'is_read': true})
          .eq('id', notificationId);
      
      final updatedNotifications = state.notifications.map((n) {
        if (n.id == notificationId) {
          return n.copyWith(isRead: true);
        }
        return n;
      }).toList();
      
      state = state.copyWith(
        notifications: updatedNotifications,
        unreadCount: (state.unreadCount - 1).clamp(0, double.infinity).toInt(),
      );
    } catch (e) {
      debugPrint('Error marking notification as read: $e');
    }
  }
  
  Future<void> signIn({required String email, required String password}) async {
    state = state.copyWith(loading: true);
    
    try {
      final response = await _supabaseService.client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      
      if (response.user != null) {
        await _updateUserState(response.user);
      }
    } catch (e) {
      state = state.copyWith(loading: false);
      rethrow;
    }
  }
  
  Future<void> signUp({
    required String email,
    required String password,
    required String fullName,
    required String role,
  }) async {
    state = state.copyWith(loading: true);
    
    try {
      final response = await _supabaseService.client.auth.signUp(
        email: email,
        password: password,
        data: {
          'full_name': fullName,
          'role': role,
        },
      );
      
      if (response.user != null) {
        await _updateUserState(response.user);
      }
    } catch (e) {
      state = state.copyWith(loading: false);
      rethrow;
    }
  }
  
  Future<void> signOut() async {
    await _supabaseService.client.auth.signOut();
    state = const AuthState(loading: false);
  }
  
  @override
  void dispose() {
    _authStateSubscription?.cancel();
    _notificationChannel?.unsubscribe();
    super.dispose();
  }
}

// Provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final supabaseService = ref.watch(supabaseServiceProvider);
  return AuthNotifier(supabaseService);
});
