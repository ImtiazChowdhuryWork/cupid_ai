import 'package:cupid_ai/features/auth/domain/entities/user.dart';

class UserModel extends User {
  const UserModel({
    required super.id,
    required super.email,
    required super.displayName,
    required super.subscriptionTier,
    required super.createdAt,
    super.avatarUrl,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: json['id'] as String,
        email: json['email'] as String,
        displayName: json['display_name'] as String? ?? '',
        subscriptionTier: json['subscription_tier'] as String? ?? 'free',
        createdAt: DateTime.parse(json['created_at'] as String),
        avatarUrl: json['avatar_url'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'display_name': displayName,
        'subscription_tier': subscriptionTier,
        'created_at': createdAt.toIso8601String(),
        'avatar_url': avatarUrl,
      };
}
