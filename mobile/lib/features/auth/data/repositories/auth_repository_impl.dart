import 'package:shared_preferences/shared_preferences.dart';
import 'package:cupid_ai/core/constants/app_constants.dart';
import 'package:cupid_ai/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:cupid_ai/features/auth/domain/entities/user.dart';
import 'package:cupid_ai/features/auth/domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  const AuthRepositoryImpl(this._remote, this._prefs);

  final AuthRemoteDataSource _remote;
  final SharedPreferences _prefs;

  @override
  bool get isLoggedIn =>
      _prefs.getString(AppConstants.accessTokenKey)?.isNotEmpty ?? false;

  @override
  Future<({User user, String accessToken, String refreshToken})> login({
    required String email,
    required String password,
  }) async {
    final result = await _remote.login(email: email, password: password);
    await _saveTokens(result.accessToken, result.refreshToken);
    await _prefs.setString(AppConstants.userIdKey, result.user.id);
    return result;
  }

  @override
  Future<({User user, String accessToken, String refreshToken})> register({
    required String email,
    required String password,
    required String displayName,
  }) async {
    final result = await _remote.register(
      email: email,
      password: password,
      displayName: displayName,
    );
    await _saveTokens(result.accessToken, result.refreshToken);
    await _prefs.setString(AppConstants.userIdKey, result.user.id);
    return result;
  }

  @override
  Future<void> logout() async {
    await _remote.logout();
    await _prefs.remove(AppConstants.accessTokenKey);
    await _prefs.remove(AppConstants.refreshTokenKey);
    await _prefs.remove(AppConstants.userIdKey);
  }

  @override
  Future<User?> getCurrentUser() async {
    // Returns null here; full profile fetch is handled by ProfileRepository
    return null;
  }

  @override
  Future<String> refreshToken(String refreshToken) async {
    final newToken = await _remote.refreshToken(refreshToken);
    await _prefs.setString(AppConstants.accessTokenKey, newToken);
    return newToken;
  }

  Future<void> _saveTokens(String access, String refresh) async {
    await _prefs.setString(AppConstants.accessTokenKey, access);
    await _prefs.setString(AppConstants.refreshTokenKey, refresh);
  }
}
