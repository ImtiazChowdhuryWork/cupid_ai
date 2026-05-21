import 'package:cupid_ai/features/auth/domain/entities/user.dart';
import 'package:cupid_ai/features/auth/domain/repositories/auth_repository.dart';

class RegisterUseCase {
  const RegisterUseCase(this._repository);

  final AuthRepository _repository;

  Future<({User user, String accessToken, String refreshToken})> execute({
    required String email,
    required String password,
    required String displayName,
  }) {
    return _repository.register(
      email: email,
      password: password,
      displayName: displayName,
    );
  }
}
