import 'package:json_annotation/json_annotation.dart';

part 'competition_model.g.dart';

@JsonSerializable()
class CompetitionModel {
  final String id;
  final String title;
  final String description;
  @JsonKey(name: 'organizer_id')
  final String organizerId;
  final String category;
  final String type; // hackathon, quiz, debate, sports, cultural
  @JsonKey(name: 'prize_pool')
  final double? prizePool;
  final List<Map<String, dynamic>>? prizes;
  final List<String> rules;
  final List<String> eligibility;
  @JsonKey(name: 'registration_fee')
  final double? registrationFee;
  @JsonKey(name: 'team_size_min')
  final int? teamSizeMin;
  @JsonKey(name: 'team_size_max')
  final int? teamSizeMax;
  @JsonKey(name: 'start_date')
  final DateTime startDate;
  @JsonKey(name: 'end_date')
  final DateTime endDate;
  @JsonKey(name: 'registration_deadline')
  final DateTime registrationDeadline;
  final String venue;
  @JsonKey(name: 'is_online')
  final bool isOnline;
  @JsonKey(name: 'is_featured')
  final bool isFeatured;
  final String status; // upcoming, ongoing, completed, cancelled
  @JsonKey(name: 'participant_count')
  final int participantCount;
  @JsonKey(name: 'max_participants')
  final int? maxParticipants;
  @JsonKey(name: 'image_url')
  final String? imageUrl;
  final List<String>? sponsors;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;
  
  // Relations
  final Map<String, dynamic>? organizer;
  final List<Map<String, dynamic>>? registrations;
  final List<Map<String, dynamic>>? winners;
  
  CompetitionModel({
    required this.id,
    required this.title,
    required this.description,
    required this.organizerId,
    required this.category,
    required this.type,
    this.prizePool,
    this.prizes,
    required this.rules,
    required this.eligibility,
    this.registrationFee,
    this.teamSizeMin,
    this.teamSizeMax,
    required this.startDate,
    required this.endDate,
    required this.registrationDeadline,
    required this.venue,
    required this.isOnline,
    required this.isFeatured,
    required this.status,
    required this.participantCount,
    this.maxParticipants,
    this.imageUrl,
    this.sponsors,
    required this.createdAt,
    required this.updatedAt,
    this.organizer,
    this.registrations,
    this.winners,
  });
  
  factory CompetitionModel.fromJson(Map<String, dynamic> json) => _$CompetitionModelFromJson(json);
  Map<String, dynamic> toJson() => _$CompetitionModelToJson(this);
  
  // Computed properties
  String get organizerName => organizer?['name'] ?? 'Unknown Organizer';
  String? get organizerLogo => organizer?['logo_url'];
  bool get isOrganizerVerified => organizer?['verified'] ?? false;
  
  bool get isRegistrationOpen {
    final now = DateTime.now();
    return now.isBefore(registrationDeadline) && status == 'upcoming';
  }
  
  bool get isOngoing {
    final now = DateTime.now();
    return now.isAfter(startDate) && now.isBefore(endDate) && status == 'ongoing';
  }
  
  bool get isCompleted => status == 'completed' || DateTime.now().isAfter(endDate);
  
  int get daysUntilStart {
    final now = DateTime.now();
    if (startDate.isBefore(now)) return 0;
    return startDate.difference(now).inDays;
  }
  
  int get daysUntilRegistrationDeadline {
    final now = DateTime.now();
    if (registrationDeadline.isBefore(now)) return 0;
    return registrationDeadline.difference(now).inDays;
  }
  
  String get statusDisplay {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'ongoing':
        return 'Ongoing';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }
  
  String get registrationStatus {
    if (isRegistrationOpen) {
      final days = daysUntilRegistrationDeadline;
      if (days == 0) return 'Registration closes today';
      if (days == 1) return 'Registration closes tomorrow';
      return 'Registration open ($days days left)';
    }
    return 'Registration closed';
  }
  
  String get teamSizeDisplay {
    if (teamSizeMin == null && teamSizeMax == null) {
      return 'Individual';
    } else if (teamSizeMin == teamSizeMax) {
      return 'Team of $teamSizeMin';
    } else {
      return 'Team of $teamSizeMin-$teamSizeMax';
    }
  }
  
  String get prizeDisplay {
    if (prizePool == null) return 'Prizes to be announced';
    return '₹${prizePool!.toStringAsFixed(0)} Prize Pool';
  }
  
  bool get hasSlots {
    if (maxParticipants == null) return true;
    return participantCount < maxParticipants!;
  }
  
  int get availableSlots {
    if (maxParticipants == null) return -1;
    return maxParticipants! - participantCount;
  }
  
  CompetitionModel copyWith({
    String? id,
    String? title,
    String? description,
    String? organizerId,
    String? category,
    String? type,
    double? prizePool,
    List<Map<String, dynamic>>? prizes,
    List<String>? rules,
    List<String>? eligibility,
    double? registrationFee,
    int? teamSizeMin,
    int? teamSizeMax,
    DateTime? startDate,
    DateTime? endDate,
    DateTime? registrationDeadline,
    String? venue,
    bool? isOnline,
    bool? isFeatured,
    String? status,
    int? participantCount,
    int? maxParticipants,
    String? imageUrl,
    List<String>? sponsors,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? organizer,
    List<Map<String, dynamic>>? registrations,
    List<Map<String, dynamic>>? winners,
  }) {
    return CompetitionModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      organizerId: organizerId ?? this.organizerId,
      category: category ?? this.category,
      type: type ?? this.type,
      prizePool: prizePool ?? this.prizePool,
      prizes: prizes ?? this.prizes,
      rules: rules ?? this.rules,
      eligibility: eligibility ?? this.eligibility,
      registrationFee: registrationFee ?? this.registrationFee,
      teamSizeMin: teamSizeMin ?? this.teamSizeMin,
      teamSizeMax: teamSizeMax ?? this.teamSizeMax,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      registrationDeadline: registrationDeadline ?? this.registrationDeadline,
      venue: venue ?? this.venue,
      isOnline: isOnline ?? this.isOnline,
      isFeatured: isFeatured ?? this.isFeatured,
      status: status ?? this.status,
      participantCount: participantCount ?? this.participantCount,
      maxParticipants: maxParticipants ?? this.maxParticipants,
      imageUrl: imageUrl ?? this.imageUrl,
      sponsors: sponsors ?? this.sponsors,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      organizer: organizer ?? this.organizer,
      registrations: registrations ?? this.registrations,
      winners: winners ?? this.winners,
    );
  }
}
