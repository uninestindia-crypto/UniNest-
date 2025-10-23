import 'package:flutter_test/flutter_test.dart';
import 'package:uninest_flutter/core/utils/validators.dart';

void main() {
  group('AppValidators', () {
    group('Email validation', () {
      test('should return null for valid email', () {
        expect(AppValidators.email('test@example.com'), null);
        expect(AppValidators.email('user.name@domain.co.uk'), null);
        expect(AppValidators.email('user+tag@example.com'), null);
      });

      test('should return error for invalid email', () {
        expect(AppValidators.email(''), isNotNull);
        expect(AppValidators.email('invalid'), isNotNull);
        expect(AppValidators.email('@example.com'), isNotNull);
        expect(AppValidators.email('user@'), isNotNull);
        expect(AppValidators.email('user @example.com'), isNotNull);
      });
    });

    group('Password validation', () {
      test('should return null for valid password', () {
        expect(AppValidators.password('password123'), null);
        expect(AppValidators.password('MyP@ssw0rd'), null);
      });

      test('should return error for passwords less than 6 characters', () {
        expect(AppValidators.password('12345'), isNotNull);
        expect(AppValidators.password('abc'), isNotNull);
      });

      test('should return error for empty password', () {
        expect(AppValidators.password(''), isNotNull);
      });
    });

    group('Phone validation', () {
      test('should return null for valid phone numbers', () {
        expect(AppValidators.phone('1234567890'), null);
        expect(AppValidators.phone('9876543210'), null);
      });

      test('should return error for invalid phone numbers', () {
        expect(AppValidators.phone(''), isNotNull);
        expect(AppValidators.phone('123'), isNotNull);
        expect(AppValidators.phone('abcdefghij'), isNotNull);
        expect(AppValidators.phone('12345'), isNotNull);
      });
    });

    group('Required field validation', () {
      test('should return null for non-empty values', () {
        expect(AppValidators.required('test'), null);
        expect(AppValidators.required('a'), null);
      });

      test('should return error for empty or null values', () {
        expect(AppValidators.required(''), isNotNull);
        expect(AppValidators.required('   '), isNotNull);
      });
    });

    group('Min length validation', () {
      test('should return null when length meets minimum', () {
        expect(AppValidators.minLength(5)('12345'), null);
        expect(AppValidators.minLength(3)('test'), null);
      });

      test('should return error when length is less than minimum', () {
        expect(AppValidators.minLength(5)('1234'), isNotNull);
        expect(AppValidators.minLength(10)('short'), isNotNull);
      });
    });

    group('Max length validation', () {
      test('should return null when length is within maximum', () {
        expect(AppValidators.maxLength(10)('12345'), null);
        expect(AppValidators.maxLength(5)('test'), null);
      });

      test('should return error when length exceeds maximum', () {
        expect(AppValidators.maxLength(5)('toolongstring'), isNotNull);
        expect(AppValidators.maxLength(3)('test'), isNotNull);
      });
    });

    group('Number validation', () {
      test('should return null for valid numbers', () {
        expect(AppValidators.number('123'), null);
        expect(AppValidators.number('45.67'), null);
        expect(AppValidators.number('-100'), null);
      });

      test('should return error for invalid numbers', () {
        expect(AppValidators.number('abc'), isNotNull);
        expect(AppValidators.number('12.34.56'), isNotNull);
        expect(AppValidators.number(''), isNotNull);
      });
    });

    group('URL validation', () {
      test('should return null for valid URLs', () {
        expect(AppValidators.url('https://example.com'), null);
        expect(AppValidators.url('http://subdomain.example.co.uk'), null);
        expect(AppValidators.url('https://example.com/path?query=value'), null);
      });

      test('should return error for invalid URLs', () {
        expect(AppValidators.url('not a url'), isNotNull);
        expect(AppValidators.url('htp://wrong.com'), isNotNull);
        expect(AppValidators.url(''), isNotNull);
      });
    });
  });
}
