import 'package:json_annotation/json_annotation.dart';

part 'internship_model.g.dart';

@JsonSerializable()
class InternshipModel {
  final String id;
  final String title;
  final String description;
  @JsonKey(name: 'company_id')
  final String companyId;
  final String location;
  final String category;
  final String duration;
  final String type; // full-time, part-time, remote
  @JsonKey(name: 'stipend_min')
  final double? stipendMin;
  @JsonKey(name: 'stipend_max')
  final double? stipendMax;
  final List<String> requirements;
  final List<String> responsibilities;
  final List<String> skills;
  final DateTime deadline;
  @JsonKey(name: 'start_date')
  final DateTime? startDate;
  @JsonKey(name: 'is_active')
  final bool isActive;
  @JsonKey(name: 'is_featured')
  final bool isFeatured;
  @JsonKey(name: 'application_count')
  final int applicationCount;
  @JsonKey(name: 'view_count')
  final int viewCount;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;
  
  // Relations
  final Map<String, dynamic>? company;
  final List<Map<String, dynamic>>? applications;
  
  InternshipModel({
    required this.id,
    required this.title,
    required this.description,
    required this.companyId,
    required this.location,
    required this.category,
    required this.duration,
    required this.type,
    this.stipendMin,
    this.stipendMax,
    required this.requirements,
    required this.responsibilities,
    required this.skills,
    required this.deadline,
    this.startDate,
    required this.isActive,
    required this.isFeatured,
    required this.applicationCount,
    required this.viewCount,
    required this.createdAt,
    required this.updatedAt,
    this.company,
    this.applications,
  });
  
  factory InternshipModel.fromJson(Map<String, dynamic> json) => _$InternshipModelFromJson(json);
  Map<String, dynamic> toJson() => _$InternshipModelToJson(this);
  
  // Computed properties
  String get companyName => company?['name'] ?? 'Unknown Company';
  String? get companyLogo => company?['logo_url'];
  String? get companyLocation => company?['location'];
  bool get isCompanyVerified => company?['verified'] ?? false;
  
  String get stipendDisplay {
    if (stipendMin == null && stipendMax == null) {
      return 'Unpaid';
    } else if (stipendMin == stipendMax) {
      return '₹${stipendMin?.toStringAsFixed(0)}/month';
    } else {
      return '₹${stipendMin?.toStringAsFixed(0)} - ₹${stipendMax?.toStringAsFixed(0)}/month';
    }
  }
  
  bool get isExpired => deadline.isBefore(DateTime.now());
  
  int get daysUntilDeadline {
    final now = DateTime.now();
    if (deadline.isBefore(now)) return 0;
    return deadline.difference(now).inDays;
  }
  
  String get deadlineDisplay {
    if (isExpired) return 'Expired';
    final days = daysUntilDeadline;
    if (days == 0) return 'Today';
    if (days == 1) return 'Tomorrow';
    if (days <= 7) return '$days days left';
    if (days <= 30) return '${(days / 7).floor()} weeks left';
    return '${(days / 30).floor()} months left';
  }
  
  InternshipModel copyWith({
    String? id,
    String? title,
    String? description,
    String? companyId,
    String? location,
    String? category,
    String? duration,
    String? type,
    double? stipendMin,
    double? stipendMax,
    List<String>? requirements,
    List<String>? responsibilities,
    List<String>? skills,
    DateTime? deadline,
    DateTime? startDate,
    bool? isActive,
    bool? isFeatured,
    int? applicationCount,
    int? viewCount,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? company,
    List<Map<String, dynamic>>? applications,
  }) {
    return InternshipModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      companyId: companyId ?? this.companyId,
      location: location ?? this.location,
      category: category ?? this.category,
      duration: duration ?? this.duration,
      type: type ?? this.type,
      stipendMin: stipendMin ?? this.stipendMin,
      stipendMax: stipendMax ?? this.stipendMax,
      requirements: requirements ?? this.requirements,
      responsibilities: responsibilities ?? this.responsibilities,
      skills: skills ?? this.skills,
      deadline: deadline ?? this.deadline,
      startDate: startDate ?? this.startDate,
      isActive: isActive ?? this.isActive,
      isFeatured: isFeatured ?? this.isFeatured,
      applicationCount: applicationCount ?? this.applicationCount,
      viewCount: viewCount ?? this.viewCount,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      company: company ?? this.company,
      applications: applications ?? this.applications,
    );
  }
}
