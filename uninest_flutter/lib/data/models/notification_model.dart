import 'package:json_annotation/json_annotation.dart';

part 'notification_model.g.dart';

@JsonSerializable()
class NotificationModel {
  final int id;
  @JsonKey(name: 'user_id')
  final String userId;
  @JsonKey(name: 'sender_id')
  final String? senderId;
  final String type;
  final String title;
  final String content;
  @JsonKey(name: 'action_url')
  final String? actionUrl;
  @JsonKey(name: 'is_read')
  final bool isRead;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  
  // Sender profile (populated via join)
  Map<String, dynamic>? sender;
  
  NotificationModel({
    required this.id,
    required this.userId,
    this.senderId,
    required this.type,
    required this.title,
    required this.content,
    this.actionUrl,
    required this.isRead,
    required this.createdAt,
    this.sender,
  });
  
  factory NotificationModel.fromJson(Map<String, dynamic> json) => _$NotificationModelFromJson(json);
  Map<String, dynamic> toJson() => _$NotificationModelToJson(this);
  
  NotificationModel copyWith({
    int? id,
    String? userId,
    String? senderId,
    String? type,
    String? title,
    String? content,
    String? actionUrl,
    bool? isRead,
    DateTime? createdAt,
    Map<String, dynamic>? sender,
  }) {
    return NotificationModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      senderId: senderId ?? this.senderId,
      type: type ?? this.type,
      title: title ?? this.title,
      content: content ?? this.content,
      actionUrl: actionUrl ?? this.actionUrl,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt ?? this.createdAt,
      sender: sender ?? this.sender,
    );
  }
  
  String get senderName => sender?['full_name'] ?? 'System';
  String? get senderAvatar => sender?['avatar_url'];
}
