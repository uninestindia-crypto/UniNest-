import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  final String id;
  @JsonKey(name: 'full_name')
  final String? fullName;
  final String? email;
  @JsonKey(name: 'avatar_url')
  final String? avatarUrl;
  final String? handle;
  final String? role;
  final String? bio;
  final String? phone;
  final String? university;
  final String? course;
  final int? year;
  @JsonKey(name: 'vendor_categories')
  final List<String>? vendorCategories;
  @JsonKey(name: 'vendor_subscription')
  final Map<String, dynamic>? vendorSubscription;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;
  
  UserModel({
    required this.id,
    this.fullName,
    this.email,
    this.avatarUrl,
    this.handle,
    this.role,
    this.bio,
    this.phone,
    this.university,
    this.course,
    this.year,
    this.vendorCategories,
    this.vendorSubscription,
    this.createdAt,
    this.updatedAt,
  });
  
  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);
  Map<String, dynamic> toJson() => _$UserModelToJson(this);
  
  UserModel copyWith({
    String? id,
    String? fullName,
    String? email,
    String? avatarUrl,
    String? handle,
    String? role,
    String? bio,
    String? phone,
    String? university,
    String? course,
    int? year,
    List<String>? vendorCategories,
    Map<String, dynamic>? vendorSubscription,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      handle: handle ?? this.handle,
      role: role ?? this.role,
      bio: bio ?? this.bio,
      phone: phone ?? this.phone,
      university: university ?? this.university,
      course: course ?? this.course,
      year: year ?? this.year,
      vendorCategories: vendorCategories ?? this.vendorCategories,
      vendorSubscription: vendorSubscription ?? this.vendorSubscription,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
