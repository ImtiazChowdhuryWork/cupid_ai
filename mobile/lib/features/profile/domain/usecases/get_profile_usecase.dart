import 'package:cupid_ai/features/profile/domain/entities/user_profile.dart';
import 'package:cupid_ai/features/profile/domain/repositories/profile_repository.dart';

class GetProfileUseCase {
  const GetProfileUseCase(this._repository);

  final ProfileRepository _repository;

  Future<UserProfile> execute() => _repository.getProfile();
}
