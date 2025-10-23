import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/app_config.dart';

class SupabaseService {
  static SupabaseService? _instance;
  late final SupabaseClient _client;
  
  SupabaseService._() {
    _client = Supabase.instance.client;
  }
  
  factory SupabaseService() {
    _instance ??= SupabaseService._();
    return _instance!;
  }
  
  SupabaseClient get client => _client;
  
  // Auth methods
  Future<AuthResponse> signIn({
    required String email,
    required String password,
  }) async {
    return await _client.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }
  
  Future<AuthResponse> signUp({
    required String email,
    required String password,
    Map<String, dynamic>? metadata,
  }) async {
    return await _client.auth.signUp(
      email: email,
      password: password,
      data: metadata,
    );
  }
  
  Future<void> signOut() async {
    await _client.auth.signOut();
  }
  
  Future<void> resetPassword(String email) async {
    await _client.auth.resetPasswordForEmail(email);
  }
  
  User? get currentUser => _client.auth.currentUser;
  Session? get currentSession => _client.auth.currentSession;
  
  // Database methods
  SupabaseQueryBuilder from(String table) {
    return _client.from(table);
  }
  
  // Storage methods
  StorageFileApi storage(String bucket) {
    return _client.storage.from(bucket);
  }
  
  // Realtime methods
  RealtimeChannel channel(String name) {
    return _client.channel(name);
  }
  
  // RPC methods
  Future<dynamic> rpc(
    String functionName, {
    Map<String, dynamic>? params,
  }) async {
    return await _client.rpc(functionName, params: params);
  }
  
  // Helper methods for common queries
  Future<List<Map<String, dynamic>>> getProducts({
    String? category,
    String? vendorId,
    int? limit,
    int? offset,
  }) async {
    var query = _client.from('products').select();
    
    if (category != null) {
      query = query.eq('category', category);
    }
    if (vendorId != null) {
      query = query.eq('vendor_id', vendorId);
    }
    if (limit != null) {
      query = query.limit(limit);
    }
    if (offset != null) {
      query = query.range(offset, offset + (limit ?? 10) - 1);
    }
    
    return await query;
  }
  
  Future<Map<String, dynamic>?> getProfile(String userId) async {
    return await _client
        .from('profiles')
        .select()
        .eq('id', userId)
        .maybeSingle();
  }
  
  Future<void> updateProfile(
    String userId,
    Map<String, dynamic> updates,
  ) async {
    await _client
        .from('profiles')
        .update(updates)
        .eq('id', userId);
  }
  
  Future<List<Map<String, dynamic>>> getNotifications(String userId) async {
    return await _client
        .from('notifications')
        .select('*, sender:sender_id (full_name, avatar_url)')
        .eq('user_id', userId)
        .order('created_at', ascending: false);
  }
  
  Future<void> markNotificationAsRead(int notificationId) async {
    await _client
        .from('notifications')
        .update({'is_read': true})
        .eq('id', notificationId);
  }
  
  Future<List<Map<String, dynamic>>> getOrders({
    String? userId,
    String? vendorId,
    String? status,
  }) async {
    var query = _client.from('orders').select();
    
    if (userId != null) {
      query = query.eq('user_id', userId);
    }
    if (vendorId != null) {
      query = query.eq('vendor_id', vendorId);
    }
    if (status != null) {
      query = query.eq('status', status);
    }
    
    return await query.order('created_at', ascending: false);
  }
  
  Future<Map<String, dynamic>> createOrder(Map<String, dynamic> order) async {
    return await _client
        .from('orders')
        .insert(order)
        .select()
        .single();
  }
  
  Future<void> updateOrderStatus(String orderId, String status) async {
    await _client
        .from('orders')
        .update({'status': status})
        .eq('id', orderId);
  }
  
  // Vendor specific methods
  Future<Map<String, dynamic>?> getVendorProfile(String vendorId) async {
    return await _client
        .from('vendor_profiles')
        .select()
        .eq('id', vendorId)
        .maybeSingle();
  }
  
  Future<List<Map<String, dynamic>>> getVendorProducts(String vendorId) async {
    return await _client
        .from('products')
        .select()
        .eq('vendor_id', vendorId)
        .order('created_at', ascending: false);
  }
  
  Future<Map<String, dynamic>> getVendorAnalytics(String vendorId) async {
    // This would typically call a stored procedure or aggregate function
    return await _client.rpc('get_vendor_analytics', params: {
      'vendor_id': vendorId,
    });
  }
  
  // Admin specific methods
  Future<List<Map<String, dynamic>>> getAllUsers({
    String? role,
    int? limit,
    int? offset,
  }) async {
    var query = _client.from('profiles').select();
    
    if (role != null) {
      query = query.eq('role', role);
    }
    if (limit != null) {
      query = query.limit(limit);
    }
    if (offset != null) {
      query = query.range(offset, offset + (limit ?? 10) - 1);
    }
    
    return await query;
  }
  
  Future<void> updateUserRole(String userId, String role) async {
    await _client
        .from('profiles')
        .update({'role': role})
        .eq('id', userId);
  }
  
  Future<Map<String, dynamic>> getAdminDashboardStats() async {
    return await _client.rpc('get_admin_dashboard_stats');
  }
  
  // Marketplace methods
  Future<List<Map<String, dynamic>>> searchProducts(String query) async {
    return await _client
        .from('products')
        .select()
        .textSearch('name', query)
        .limit(20);
  }
  
  Future<Map<String, dynamic>?> getProductDetails(String productId) async {
    return await _client
        .from('products')
        .select('*, vendor:vendor_id (full_name, avatar_url)')
        .eq('id', productId)
        .maybeSingle();
  }
  
  // Booking methods
  Future<Map<String, dynamic>> createBooking(Map<String, dynamic> booking) async {
    return await _client
        .from('bookings')
        .insert(booking)
        .select()
        .single();
  }
  
  Future<List<Map<String, dynamic>>> getUserBookings(String userId) async {
    return await _client
        .from('bookings')
        .select('*, hostel:hostel_id (name, address, image_url)')
        .eq('user_id', userId)
        .order('created_at', ascending: false);
  }
  
  // Social features
  Future<List<Map<String, dynamic>>> getFeedPosts({
    int? limit,
    int? offset,
  }) async {
    var query = _client
        .from('posts')
        .select('*, author:user_id (full_name, avatar_url, handle)');
    
    if (limit != null) {
      query = query.limit(limit);
    }
    if (offset != null) {
      query = query.range(offset, offset + (limit ?? 10) - 1);
    }
    
    return await query.order('created_at', ascending: false);
  }
  
  Future<Map<String, dynamic>> createPost(Map<String, dynamic> post) async {
    return await _client
        .from('posts')
        .insert(post)
        .select()
        .single();
  }
  
  Future<void> likePost(String postId, String userId) async {
    await _client.from('post_likes').insert({
      'post_id': postId,
      'user_id': userId,
    });
  }
  
  Future<void> unlikePost(String postId, String userId) async {
    await _client
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
  }
  
  // Chat methods
  Future<List<Map<String, dynamic>>> getConversations(String userId) async {
    return await _client
        .from('conversations')
        .select('*, participants!inner(*), last_message:messages(content, created_at)')
        .or('user1_id.eq.$userId,user2_id.eq.$userId')
        .order('updated_at', ascending: false);
  }
  
  Future<List<Map<String, dynamic>>> getMessages(String conversationId) async {
    return await _client
        .from('messages')
        .select('*, sender:sender_id (full_name, avatar_url)')
        .eq('conversation_id', conversationId)
        .order('created_at', ascending: true);
  }
  
  Future<Map<String, dynamic>> sendMessage(Map<String, dynamic> message) async {
    return await _client
        .from('messages')
        .insert(message)
        .select()
        .single();
  }
}
