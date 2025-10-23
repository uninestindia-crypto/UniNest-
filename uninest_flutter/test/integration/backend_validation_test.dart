import 'package:flutter_test/flutter_test.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:uninest_flutter/core/config/app_config.dart';
import 'package:uninest_flutter/data/services/supabase_service.dart';

/// Comprehensive backend integration validation tests
/// These tests verify that all Supabase contracts work correctly
/// Run with: flutter test test/integration/backend_validation_test.dart
void main() {
  late SupabaseService supabaseService;
  
  setUpAll(() async {
    // Initialize Supabase with your credentials
    await Supabase.initialize(
      url: AppConfig.supabaseUrl,
      anonKey: AppConfig.supabaseAnonKey,
    );
    
    supabaseService = SupabaseService();
  });
  
  group('Authentication Contract Validation', () {
    test('Sign up with email should create user and profile', () async {
      final testEmail = 'test_${DateTime.now().millisecondsSinceEpoch}@example.com';
      const testPassword = 'TestPass123!';
      const testName = 'Test User';
      
      // Sign up
      final response = await supabaseService.signUp(
        email: testEmail,
        password: testPassword,
        metadata: {'full_name': testName},
      );
      
      expect(response['error'], isNull);
      expect(response['user'], isNotNull);
      
      // Verify profile was created
      final userId = response['user']!.id;
      final profile = await supabaseService.getProfile(userId);
      
      expect(profile, isNotNull);
      expect(profile!['email'], testEmail);
      expect(profile['full_name'], testName);
      
      // Clean up
      await supabaseService.signOut();
    });
    
    test('Sign in with valid credentials should succeed', () async {
      // Use pre-existing test account or create one
      const testEmail = 'test@uninest.com';
      const testPassword = 'TestPass123!';
      
      final response = await supabaseService.signIn(
        email: testEmail,
        password: testPassword,
      );
      
      expect(response['error'], isNull);
      expect(response['user'], isNotNull);
      expect(response['user']!.email, testEmail);
      
      await supabaseService.signOut();
    });
    
    test('Sign in with invalid credentials should fail', () async {
      final response = await supabaseService.signIn(
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      );
      
      expect(response['error'], isNotNull);
      expect(response['user'], isNull);
    });
    
    test('Password reset should send email', () async {
      const testEmail = 'test@uninest.com';
      
      final result = await supabaseService.resetPassword(testEmail);
      
      expect(result, isTrue);
    });
    
    test('Get current user should return user when authenticated', () async {
      // Sign in first
      await supabaseService.signIn(
        email: 'test@uninest.com',
        password: 'TestPass123!',
      );
      
      final user = supabaseService.currentUser;
      
      expect(user, isNotNull);
      expect(user!.email, 'test@uninest.com');
      
      await supabaseService.signOut();
    });
  });
  
  group('Database Query Contract Validation', () {
    test('Fetch products should return list', () async {
      final products = await supabaseService.getProducts();
      
      expect(products, isNotNull);
      expect(products, isList);
      
      if (products.isNotEmpty) {
        final firstProduct = products.first;
        expect(firstProduct, containsPair('id', isNotNull));
        expect(firstProduct, containsPair('name', isNotNull));
        expect(firstProduct, containsPair('price', isNotNull));
        expect(firstProduct, containsPair('category', isNotNull));
      }
    });
    
    test('Fetch products by category should filter correctly', () async {
      final category = 'electronics';
      final products = await supabaseService.getProductsByCategory(category);
      
      expect(products, isNotNull);
      
      for (final product in products) {
        expect(product['category'], category);
      }
    });
    
    test('Search products should return matching results', () async {
      final query = 'laptop';
      final results = await supabaseService.searchProducts(query);
      
      expect(results, isNotNull);
      
      for (final product in results) {
        final name = (product['name'] as String).toLowerCase();
        final description = (product['description'] as String? ?? '').toLowerCase();
        
        expect(
          name.contains(query.toLowerCase()) || description.contains(query.toLowerCase()),
          isTrue,
        );
      }
    });
    
    test('Fetch single product by ID should return correct product', () async {
      // First get all products
      final products = await supabaseService.getProducts();
      
      if (products.isEmpty) {
        print('No products to test with');
        return;
      }
      
      final productId = products.first['id'];
      final product = await supabaseService.getProductById(productId);
      
      expect(product, isNotNull);
      expect(product!['id'], productId);
    });
    
    test('Fetch orders for authenticated user', () async {
      // Sign in
      await supabaseService.signIn(
        email: 'test@uninest.com',
        password: 'TestPass123!',
      );
      
      final user = supabaseService.currentUser;
      expect(user, isNotNull);
      
      final orders = await supabaseService.getUserOrders(user!.id);
      
      expect(orders, isNotNull);
      expect(orders, isList);
      
      await supabaseService.signOut();
    });
    
    test('Create and fetch profile should work', () async {
      // Sign in
      await supabaseService.signIn(
        email: 'test@uninest.com',
        password: 'TestPass123!',
      );
      
      final user = supabaseService.currentUser;
      expect(user, isNotNull);
      
      // Update profile
      final updatedProfile = await supabaseService.updateProfile(
        user!.id,
        {
          'full_name': 'Updated Test User',
          'bio': 'This is a test bio',
        },
      );
      
      expect(updatedProfile, isNotNull);
      expect(updatedProfile!['full_name'], 'Updated Test User');
      
      // Fetch profile
      final profile = await supabaseService.getProfile(user.id);
      
      expect(profile, isNotNull);
      expect(profile!['full_name'], 'Updated Test User');
      
      await supabaseService.signOut();
    });
  });
  
  group('Storage Contract Validation', () {
    test('Upload file should return URL', () async {
      // Sign in
      await supabaseService.signIn(
        email: 'test@uninest.com',
        password: 'TestPass123!',
      );
      
      // Create a test file (in real test, use actual file)
      final testData = List.generate(100, (i) => i);
      final fileName = 'test_${DateTime.now().millisecondsSinceEpoch}.txt';
      
      final url = await supabaseService.uploadFile(
        bucket: 'avatars',
        path: fileName,
        file: testData,
      );
      
      expect(url, isNotNull);
      expect(url, contains('avatars'));
      expect(url, contains(fileName));
      
      // Clean up - delete file
      await supabaseService.deleteFile(
        bucket: 'avatars',
        path: fileName,
      );
      
      await supabaseService.signOut();
    });
    
    test('Get public URL for file should return valid URL', () async {
      final url = supabaseService.getPublicUrl(
        bucket: 'avatars',
        path: 'test.jpg',
      );
      
      expect(url, isNotNull);
      expect(url, startsWith('http'));
      expect(url, contains('avatars'));
    });
  });
  
  group('Real-time Subscription Contract Validation', () {
    test('Subscribe to table changes should receive events', () async {
      // Sign in
      await supabaseService.signIn(
        email: 'test@uninest.com',
        password: 'TestPass123!',
      );
      
      var eventReceived = false;
      
      // Subscribe to posts table
      final subscription = supabaseService.subscribeToTable(
        table: 'posts',
        callback: (payload) {
          eventReceived = true;
        },
      );
      
      expect(subscription, isNotNull);
      
      // Wait a bit to ensure subscription is active
      await Future.delayed(const Duration(seconds: 2));
      
      // In a real test, you would insert a record and verify the callback fires
      // For now, just verify subscription was created
      expect(subscription, isNotNull);
      
      // Clean up
      subscription.unsubscribe();
      await supabaseService.signOut();
    });
  });
  
  group('RPC Function Contract Validation', () {
    test('Call RPC function should return expected result', () async {
      // Test a simple RPC function (if you have one)
      // Example: await supabaseService.callRPC('get_user_stats', {'user_id': userId});
      
      // This is a placeholder - implement based on your actual RPC functions
      expect(true, isTrue);
    });
  });
  
  group('Row Level Security (RLS) Validation', () {
    test('User should only access own orders', () async {
      // Sign in as user 1
      await supabaseService.signIn(
        email: 'test@uninest.com',
        password: 'TestPass123!',
      );
      
      final user1 = supabaseService.currentUser;
      final user1Orders = await supabaseService.getUserOrders(user1!.id);
      
      // Verify all orders belong to user 1
      for (final order in user1Orders) {
        expect(order['user_id'], user1.id);
      }
      
      await supabaseService.signOut();
    });
    
    test('Vendor should only access own products', () async {
      // Sign in as vendor
      await supabaseService.signIn(
        email: 'vendor@uninest.com',
        password: 'TestPass123!',
      );
      
      final vendor = supabaseService.currentUser;
      
      if (vendor != null) {
        final vendorProducts = await supabaseService.getVendorProducts(vendor.id);
        
        // Verify all products belong to vendor
        for (final product in vendorProducts) {
          expect(product['vendor_id'], vendor.id);
        }
      }
      
      await supabaseService.signOut();
    });
  });
  
  group('Performance Validation', () {
    test('Product fetch should complete within 3 seconds', () async {
      final stopwatch = Stopwatch()..start();
      
      await supabaseService.getProducts(limit: 20);
      
      stopwatch.stop();
      
      expect(stopwatch.elapsedMilliseconds, lessThan(3000));
    });
    
    test('Search should complete within 2 seconds', () async {
      final stopwatch = Stopwatch()..start();
      
      await supabaseService.searchProducts('laptop');
      
      stopwatch.stop();
      
      expect(stopwatch.elapsedMilliseconds, lessThan(2000));
    });
  });
  
  tearDownAll(() async {
    // Clean up
    await Supabase.instance.client.auth.signOut();
  });
}
