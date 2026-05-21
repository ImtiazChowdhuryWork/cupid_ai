import 'package:equatable/equatable.dart';

class User extends Equatable {
  const User({
    required this.id,
    required this.email,
    required this.displayName,
    required this.subscriptionTier,
    required this.createdAt,
    this.avatarUrl,
  });

  final String id;
  final String email;
  final String displayName;
  final String subscriptionTier;
  final DateTime createdAt;
  final String? avatarUrl;

  bool get isPremium =>
      subscriptionTier == 'monthly' || subscriptionTier == 'premium';

  @override
  List<Object?> get props =>
      [id, email, displayName, subscriptionTier, createdAt, avatarUrl];
}
