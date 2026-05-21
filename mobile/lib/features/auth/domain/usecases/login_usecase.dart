import 'package:cupid_ai/features/auth/domain/entities/user.dart';
import 'package:cupid_ai/features/auth/domain/repositories/auth_repository.dart';

class LoginUseCase {
  const LoginUseCase(this._repository);

  final AuthRepository _repository;

  Future<({User user, String accessToken, String refreshToken})> execute({
    required String email,
    required String password,
  }) {
    return _repository.login(email: email, password: password);
  }
}
