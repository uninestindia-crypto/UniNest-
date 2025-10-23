import 'package:flutter_test/flutter_test.dart';
import 'package:uninest_flutter/data/models/product_model.dart';

void main() {
  group('ProductModel', () {
    test('should calculate discount percentage correctly', () {
      final product = ProductModel(
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 800,
        originalPrice: 1000,
        category: 'test',
        vendorId: 'vendor1',
        stock: 10,
        available: true,
        featured: false,
        rating: 4.5,
        reviewCount: 10,
        salesCount: 5,
        requirements: [],
        responsibilities: [],
        skills: [],
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(product.hasDiscount, true);
      expect(product.discountPercentage, 20.0);
    });

    test('should return correct stipend display for no stipend', () {
      final product = ProductModel(
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 0,
        category: 'test',
        vendorId: 'vendor1',
        stock: 10,
        available: true,
        featured: false,
        rating: 4.5,
        reviewCount: 10,
        salesCount: 5,
        requirements: [],
        responsibilities: [],
        skills: [],
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(product.hasDiscount, false);
      expect(product.discountPercentage, 0);
    });

    test('should parse from JSON correctly', () {
      final json = {
        'id': '1',
        'name': 'Test Product',
        'description': 'Test Description',
        'price': 500.0,
        'category': 'electronics',
        'vendor_id': 'vendor1',
        'stock': 10,
        'available': true,
        'featured': false,
        'rating': 4.5,
        'review_count': 10,
        'sales_count': 5,
        'created_at': DateTime.now().toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
      };

      final product = ProductModel.fromJson(json);

      expect(product.id, '1');
      expect(product.name, 'Test Product');
      expect(product.price, 500.0);
      expect(product.category, 'electronics');
    });

    test('should convert to JSON correctly', () {
      final product = ProductModel(
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 500,
        category: 'electronics',
        vendorId: 'vendor1',
        stock: 10,
        available: true,
        featured: false,
        rating: 4.5,
        reviewCount: 10,
        salesCount: 5,
        requirements: [],
        responsibilities: [],
        skills: [],
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      final json = product.toJson();

      expect(json['id'], '1');
      expect(json['name'], 'Test Product');
      expect(json['price'], 500);
    });

    test('copyWith should create new instance with updated values', () {
      final product = ProductModel(
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 500,
        category: 'electronics',
        vendorId: 'vendor1',
        stock: 10,
        available: true,
        featured: false,
        rating: 4.5,
        reviewCount: 10,
        salesCount: 5,
        requirements: [],
        responsibilities: [],
        skills: [],
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      final updated = product.copyWith(
        name: 'Updated Product',
        price: 600,
      );

      expect(updated.name, 'Updated Product');
      expect(updated.price, 600);
      expect(updated.id, product.id);
      expect(updated.category, product.category);
    });
  });
}
