import 'package:dio/dio.dart';
import 'package:cupid_ai/core/network/api_client.dart';
import 'package:cupid_ai/features/auth/data/models/user_model.dart';

abstract interface class AuthRemoteDataSource {
  Future<({UserModel user, String accessToken, String refreshToken})> login({
    required String email,
    required String password,
  });

  Future<({UserModel user, String accessToken, String refreshToken})> register({
    required String email,
    required String password,
    required String displayName,
  });

  Future<void> logout();

  Future<String> refreshToken(String refreshToken);
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  const AuthRemoteDataSourceImpl(this._dio);

  final Dio _dio;

  @override
  Future<({UserModel user, String accessToken, String refreshToken})> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      final data = response.data as Map<String, dynamic>;
      return (
        user: UserModel.fromJson(data['user'] as Map<String, dynamic>),
        accessToken: data['access_token'] as String,
        refreshToken: data['refresh_token'] as String,
      );
    } catch (e) {
      throw ApiClient.handleError(e);
    }
  }

  @override
  Future<({UserModel user, String accessToken, String refreshToken})> register({
    required String email,
    required String password,
    required String displayName,
  }) async {
    try {
      final response = await _dio.post('/auth/register', data: {
        'email': email,
        'password': password,
        'display_name': displayName,
      });
      final data = response.data as Map<String, dynamic>;
      return (
        user: UserModel.fromJson(data['user'] as Map<String, dynamic>),
        accessToken: data['access_token'] as String,
        refreshToken: data['refresh_token'] as String,
      );
    } catch (e) {
      throw ApiClient.handleError(e);
    }
  }

  @override
  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } catch (_) {
      // Logout locally even if request fails
    }
  }

  @override
  Future<String> refreshToken(String refreshToken) async {
    try {
      final response = await _dio.post('/auth/refresh', data: {
        'refresh_token': refreshToken,
      });
      return response.data['access_token'] as String;
    } catch (e) {
      throw ApiClient.handleError(e);
    }
  }
}
