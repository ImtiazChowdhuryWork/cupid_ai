import 'package:cupid_ai/features/profile/domain/entities/user_profile.dart';

class UserProfileModel extends UserProfile {
  const UserProfileModel({
    required super.id,
    required super.email,
    required super.displayName,
    required super.subscriptionTier,
    required super.totalAnalyses,
    required super.currentStreak,
    required super.bestStreak,
    required super.dailyAnalysesUsed,
    required super.dailyAnalysesLimit,
    required super.createdAt,
    super.avatarUrl,
  });

  factory UserProfileModel.fromJson(Map<String, dynamic> json) =>
      UserProfileModel(
        id: json['id'] as String,
        email: json['email'] as String,
        displayName: json['display_name'] as String? ?? '',
        subscriptionTier: json['subscription_tier'] as String? ?? 'free',
        totalAnalyses: json['total_analyses'] as int? ?? 0,
        currentStreak: json['current_streak'] as int? ?? 0,
        bestStreak: json['best_streak'] as int? ?? 0,
        dailyAnalysesUsed: json['daily_analyses_used'] as int? ?? 0,
        dailyAnalysesLimit: json['daily_analyses_limit'] as int? ?? 3,
        createdAt: DateTime.parse(json['created_at'] as String),
        avatarUrl: json['avatar_url'] as String?,
      );
}
