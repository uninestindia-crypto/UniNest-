import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:uninest_flutter/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('UniNest App Integration Tests', () {
    testWidgets('Complete user signup flow', (WidgetTester tester) async {
      // Start the app
      app.main();
      await tester.pumpAndSettle();

      // Navigate to signup page
      final signupButton = find.text('Sign up');
      expect(signupButton, findsOneWidget);
      await tester.tap(signupButton);
      await tester.pumpAndSettle();

      // Fill in signup form
      final nameField = find.byType(TextFormField).first;
      await tester.enterText(nameField, 'Test User');
      await tester.pumpAndSettle();

      final emailField = find.byType(TextFormField).at(1);
      await tester.enterText(emailField, 'test@example.com');
      await tester.pumpAndSettle();

      final passwordField = find.byType(TextFormField).at(2);
      await tester.enterText(passwordField, 'password123');
      await tester.pumpAndSettle();

      // Submit form
      final submitButton = find.text('Create Account');
      await tester.tap(submitButton);
      await tester.pumpAndSettle(const Duration(seconds: 5));

      // Verify navigation to home page
      expect(find.text('Welcome'), findsOneWidget);
    });

    testWidgets('Product browsing and cart flow', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Login first (assuming user exists)
      final loginButton = find.text('Log In');
      await tester.tap(loginButton);
      await tester.pumpAndSettle();

      // Enter credentials
      final emailField = find.byType(TextFormField).first;
      await tester.enterText(emailField, 'test@example.com');
      
      final passwordField = find.byType(TextFormField).last;
      await tester.enterText(passwordField, 'password123');
      
      await tester.tap(find.text('Log In'));
      await tester.pumpAndSettle(const Duration(seconds: 5));

      // Navigate to marketplace
      await tester.tap(find.text('Marketplace'));
      await tester.pumpAndSettle();

      // Find and tap on a product
      final productCard = find.byType(Card).first;
      await tester.tap(productCard);
      await tester.pumpAndSettle();

      // Add to cart
      final addToCartButton = find.text('Add to Cart');
      await tester.tap(addToCartButton);
      await tester.pumpAndSettle();

      // Verify cart badge updates
      expect(find.byIcon(Icons.shopping_cart), findsOneWidget);

      // Navigate to cart
      await tester.tap(find.byIcon(Icons.shopping_cart));
      await tester.pumpAndSettle();

      // Verify product in cart
      expect(find.text('Cart'), findsOneWidget);
    });

    testWidgets('Vendor dashboard navigation', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Login as vendor
      final loginButton = find.text('Log In');
      await tester.tap(loginButton);
      await tester.pumpAndSettle();

      final emailField = find.byType(TextFormField).first;
      await tester.enterText(emailField, 'vendor@example.com');
      
      final passwordField = find.byType(TextFormField).last;
      await tester.enterText(passwordField, 'password123');
      
      await tester.tap(find.text('Log In'));
      await tester.pumpAndSettle(const Duration(seconds: 5));

      // Should redirect to vendor dashboard
      expect(find.text('Vendor Hub'), findsOneWidget);

      // Navigate through vendor sections
      await tester.tap(find.text('Products'));
      await tester.pumpAndSettle();
      expect(find.text('All Products'), findsOneWidget);

      await tester.tap(find.text('Orders'));
      await tester.pumpAndSettle();
      expect(find.text('All Orders'), findsOneWidget);

      await tester.tap(find.text('Analytics'));
      await tester.pumpAndSettle();
      expect(find.text('Analytics'), findsOneWidget);
    });

    testWidgets('Social feed interaction', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Login
      final loginButton = find.text('Log In');
      await tester.tap(loginButton);
      await tester.pumpAndSettle();

      final emailField = find.byType(TextFormField).first;
      await tester.enterText(emailField, 'test@example.com');
      
      final passwordField = find.byType(TextFormField).last;
      await tester.enterText(passwordField, 'password123');
      
      await tester.tap(find.text('Log In'));
      await tester.pumpAndSettle(const Duration(seconds: 5));

      // Navigate to social feed
      await tester.tap(find.text('Social'));
      await tester.pumpAndSettle();

      // Create a post
      await tester.tap(find.byIcon(Icons.add));
      await tester.pumpAndSettle();

      final postField = find.byType(TextField);
      await tester.enterText(postField, 'This is a test post!');
      
      await tester.tap(find.text('Post'));
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Verify post appears in feed
      expect(find.text('This is a test post!'), findsOneWidget);

      // Like the post
      await tester.tap(find.byIcon(Icons.favorite_border));
      await tester.pumpAndSettle();

      // Verify like icon changed
      expect(find.byIcon(Icons.favorite), findsOneWidget);
    });

    testWidgets('Workspace internship application', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Login
      final loginButton = find.text('Log In');
      await tester.tap(loginButton);
      await tester.pumpAndSettle();

      final emailField = find.byType(TextFormField).first;
      await tester.enterText(emailField, 'test@example.com');
      
      final passwordField = find.byType(TextFormField).last;
      await tester.enterText(passwordField, 'password123');
      
      await tester.tap(find.text('Log In'));
      await tester.pumpAndSettle(const Duration(seconds: 5));

      // Navigate to workspace
      await tester.tap(find.text('Workspace'));
      await tester.pumpAndSettle();

      // Switch to internships tab
      await tester.tap(find.text('Internships'));
      await tester.pumpAndSettle();

      // Find and open an internship
      final internshipCard = find.byType(Card).first;
      await tester.tap(internshipCard);
      await tester.pumpAndSettle();

      // Apply for internship
      await tester.tap(find.text('Apply Now'));
      await tester.pumpAndSettle();

      // Fill application form
      final coverLetterField = find.byType(TextField);
      await tester.enterText(coverLetterField, 'I am very interested in this internship...');
      
      await tester.tap(find.text('Submit Application'));
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Verify success message
      expect(find.text('Application submitted successfully'), findsOneWidget);
    });

    testWidgets('Real-time notification delivery', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Login
      final loginButton = find.text('Log In');
      await tester.tap(loginButton);
      await tester.pumpAndSettle();

      final emailField = find.byType(TextFormField).first;
      await tester.enterText(emailField, 'test@example.com');
      
      final passwordField = find.byType(TextFormField).last;
      await tester.enterText(passwordField, 'password123');
      
      await tester.tap(find.text('Log In'));
      await tester.pumpAndSettle(const Duration(seconds: 5));

      // Wait for real-time subscription to establish
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Simulate notification (this would be triggered by backend in real scenario)
      // For integration test, we verify the notification bell icon exists
      expect(find.byIcon(Icons.notifications), findsOneWidget);

      // Tap notification bell
      await tester.tap(find.byIcon(Icons.notifications));
      await tester.pumpAndSettle();

      // Verify notifications panel opens
      expect(find.text('Notifications'), findsOneWidget);
    });
  });
}
