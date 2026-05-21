import 'package:equatable/equatable.dart';

class UserProfile extends Equatable {
  const UserProfile({
    required this.id,
    required this.email,
    required this.displayName,
    required this.subscriptionTier,
    required this.totalAnalyses,
    required this.currentStreak,
    required this.bestStreak,
    required this.dailyAnalysesUsed,
    required this.dailyAnalysesLimit,
    required this.createdAt,
    this.avatarUrl,
  });

  final String id;
  final String email;
  final String displayName;
  final String subscriptionTier;
  final int totalAnalyses;
  final int currentStreak;
  final int bestStreak;
  final int dailyAnalysesUsed;
  final int dailyAnalysesLimit;
  final DateTime createdAt;
  final String? avatarUrl;

  int get dailyAnalysesRemaining =>
      (dailyAnalysesLimit - dailyAnalysesUsed).clamp(0, dailyAnalysesLimit);

  bool get isPremium =>
      subscriptionTier == 'monthly' || subscriptionTier == 'premium';

  @override
  List<Object?> get props => [
        id, email, displayName, subscriptionTier,
        totalAnalyses, currentStreak, bestStreak,
        dailyAnalysesUsed, dailyAnalysesLimit, createdAt, avatarUrl,
      ];
}
