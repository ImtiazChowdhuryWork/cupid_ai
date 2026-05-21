import 'package:cupid_ai/features/auth/domain/entities/user.dart';

abstract interface class AuthRepository {
  Future<({User user, String accessToken, String refreshToken})> login({
    required String email,
    required String password,
  });

  Future<({User user, String accessToken, String refreshToken})> register({
    required String email,
    required String password,
    required String displayName,
  });

  Future<void> logout();

  Future<User?> getCurrentUser();

  Future<String> refreshToken(String refreshToken);

  bool get isLoggedIn;
}
