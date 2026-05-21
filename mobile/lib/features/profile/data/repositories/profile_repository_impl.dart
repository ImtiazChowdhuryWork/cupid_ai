import 'package:cupid_ai/features/profile/data/datasources/profile_remote_datasource.dart';
import 'package:cupid_ai/features/profile/domain/entities/user_profile.dart';
import 'package:cupid_ai/features/profile/domain/repositories/profile_repository.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  const ProfileRepositoryImpl(this._remote);

  final ProfileRemoteDataSource _remote;

  @override
  Future<UserProfile> getProfile() => _remote.getProfile();

  @override
  Future<UserProfile> updateDisplayName(String displayName) =>
      _remote.updateDisplayName(displayName);
}
