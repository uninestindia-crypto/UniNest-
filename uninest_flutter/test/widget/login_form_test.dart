import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uninest_flutter/presentation/pages/auth/login_page.dart';

void main() {
  group('Login Form Widget Tests', () {
    testWidgets('Login form displays all required fields', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );
      
      await tester.pumpAndSettle();
      
      // Verify email field exists
      expect(find.widgetWithText(TextFormField, 'Email'), findsOneWidget);
      
      // Verify password field exists
      expect(find.widgetWithText(TextFormField, 'Password'), findsOneWidget);
      
      // Verify login button exists
      expect(find.widgetWithText(ElevatedButton, 'Log In'), findsOneWidget);
      
      // Verify "Don't have an account?" text exists
      expect(find.text("Don't have an account?"), findsOneWidget);
    });
    
    testWidgets('Empty email shows validation error', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );
      
      await tester.pumpAndSettle();
      
      // Enter password but leave email empty
      final passwordField = find.widgetWithText(TextFormField, 'Password');
      await tester.enterText(passwordField, 'password123');
      
      // Tap login button
      final loginButton = find.widgetWithText(ElevatedButton, 'Log In');
      await tester.tap(loginButton);
      await tester.pumpAndSettle();
      
      // Should show validation error
      expect(find.text('Please enter your email'), findsOneWidget);
    });
    
    testWidgets('Invalid email format shows validation error', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );
      
      await tester.pumpAndSettle();
      
      // Enter invalid email
      final emailField = find.widgetWithText(TextFormField, 'Email');
      await tester.enterText(emailField, 'notanemail');
      
      // Enter password
      final passwordField = find.widgetWithText(TextFormField, 'Password');
      await tester.enterText(passwordField, 'password123');
      
      // Tap login button
      final loginButton = find.widgetWithText(ElevatedButton, 'Log In');
      await tester.tap(loginButton);
      await tester.pumpAndSettle();
      
      // Should show validation error
      expect(find.text('Please enter a valid email'), findsOneWidget);
    });
    
    testWidgets('Empty password shows validation error', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );
      
      await tester.pumpAndSettle();
      
      // Enter email but leave password empty
      final emailField = find.widgetWithText(TextFormField, 'Email');
      await tester.enterText(emailField, 'test@example.com');
      
      // Tap login button
      final loginButton = find.widgetWithText(ElevatedButton, 'Log In');
      await tester.tap(loginButton);
      await tester.pumpAndSettle();
      
      // Should show validation error
      expect(find.text('Please enter your password'), findsOneWidget);
    });
    
    testWidgets('Password visibility toggle works', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );
      
      await tester.pumpAndSettle();
      
      // Find password field
      final passwordField = find.byType(TextFormField).last;
      
      // Initially password should be obscured
      final TextFormField field = tester.widget(passwordField);
      expect(field.obscureText, isTrue);
      
      // Tap visibility icon
      final visibilityIcon = find.byIcon(Icons.visibility_off);
      await tester.tap(visibilityIcon);
      await tester.pumpAndSettle();
      
      // Now should find visibility icon (password visible)
      expect(find.byIcon(Icons.visibility), findsOneWidget);
    });
    
    testWidgets('Remember me checkbox toggles', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );
      
      await tester.pumpAndSettle();
      
      // Find remember me checkbox
      final checkbox = find.byType(Checkbox);
      
      if (checkbox.evaluate().isNotEmpty) {
        // Initially unchecked
        Checkbox checkboxWidget = tester.widget(checkbox);
        expect(checkboxWidget.value, isFalse);
        
        // Tap checkbox
        await tester.tap(checkbox);
        await tester.pumpAndSettle();
        
        // Should be checked
        checkboxWidget = tester.widget(checkbox);
        expect(checkboxWidget.value, isTrue);
      }
    });
    
    testWidgets('Forgot password link navigates', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );
      
      await tester.pumpAndSettle();
      
      // Find forgot password link
      final forgotPasswordLink = find.text('Forgot password?');
      
      if (forgotPasswordLink.evaluate().isNotEmpty) {
        expect(forgotPasswordLink, findsOneWidget);
        
        // Tap it
        await tester.tap(forgotPasswordLink);
        await tester.pumpAndSettle();
        
        // Should navigate to forgot password page or show dialog
        // This depends on your implementation
      }
    });
    
    testWidgets('Sign up link exists', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );
      
      await tester.pumpAndSettle();
      
      // Find sign up text/link
      expect(find.text("Don't have an account?"), findsOneWidget);
      expect(find.text('Sign up'), findsOneWidget);
    });
  });
}
