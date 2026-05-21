import 'package:cupid_ai/features/profile/domain/entities/user_profile.dart';

abstract interface class ProfileRepository {
  Future<UserProfile> getProfile();
  Future<UserProfile> updateDisplayName(String displayName);
}
