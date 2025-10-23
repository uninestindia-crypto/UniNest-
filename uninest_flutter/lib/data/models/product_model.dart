import 'package:json_annotation/json_annotation.dart';

part 'product_model.g.dart';

@JsonSerializable()
class ProductModel {
  final String id;
  final String name;
  final String description;
  final double price;
  @JsonKey(name: 'original_price')
  final double? originalPrice;
  final String category;
  @JsonKey(name: 'vendor_id')
  final String vendorId;
  @JsonKey(name: 'image_url')
  final String? imageUrl;
  final List<String>? images;
  final int stock;
  final bool available;
  final bool featured;
  final double rating;
  @JsonKey(name: 'review_count')
  final int reviewCount;
  @JsonKey(name: 'sales_count')
  final int salesCount;
  final Map<String, dynamic>? specifications;
  final List<String>? tags;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;
  
  // Relations
  final Map<String, dynamic>? vendor;
  final Map<String, dynamic>? categoryData;
  final List<Map<String, dynamic>>? reviews;
  
  ProductModel({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.originalPrice,
    required this.category,
    required this.vendorId,
    this.imageUrl,
    this.images,
    required this.stock,
    required this.available,
    required this.featured,
    required this.rating,
    required this.reviewCount,
    required this.salesCount,
    this.specifications,
    this.tags,
    required this.createdAt,
    required this.updatedAt,
    this.vendor,
    this.categoryData,
    this.reviews,
  });
  
  factory ProductModel.fromJson(Map<String, dynamic> json) => _$ProductModelFromJson(json);
  Map<String, dynamic> toJson() => _$ProductModelToJson(this);
  
  // Computed properties
  bool get hasDiscount => originalPrice != null && originalPrice! > price;
  double get discountPercentage {
    if (!hasDiscount) return 0;
    return ((originalPrice! - price) / originalPrice! * 100);
  }
  
  String get vendorName => vendor?['full_name'] ?? 'Unknown Vendor';
  String? get vendorAvatar => vendor?['avatar_url'];
  bool get isVendorVerified => vendor?['verified'] ?? false;
  double get vendorRating => vendor?['rating']?.toDouble() ?? 0.0;
  
  String get categoryName => categoryData?['name'] ?? category;
  String? get categoryIcon => categoryData?['icon'];
  
  ProductModel copyWith({
    String? id,
    String? name,
    String? description,
    double? price,
    double? originalPrice,
    String? category,
    String? vendorId,
    String? imageUrl,
    List<String>? images,
    int? stock,
    bool? available,
    bool? featured,
    double? rating,
    int? reviewCount,
    int? salesCount,
    Map<String, dynamic>? specifications,
    List<String>? tags,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? vendor,
    Map<String, dynamic>? categoryData,
    List<Map<String, dynamic>>? reviews,
  }) {
    return ProductModel(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      price: price ?? this.price,
      originalPrice: originalPrice ?? this.originalPrice,
      category: category ?? this.category,
      vendorId: vendorId ?? this.vendorId,
      imageUrl: imageUrl ?? this.imageUrl,
      images: images ?? this.images,
      stock: stock ?? this.stock,
      available: available ?? this.available,
      featured: featured ?? this.featured,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      salesCount: salesCount ?? this.salesCount,
      specifications: specifications ?? this.specifications,
      tags: tags ?? this.tags,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      vendor: vendor ?? this.vendor,
      categoryData: categoryData ?? this.categoryData,
      reviews: reviews ?? this.reviews,
    );
  }
}
