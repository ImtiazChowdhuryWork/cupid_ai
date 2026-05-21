import 'package:dio/dio.dart';
import 'package:cupid_ai/core/network/api_client.dart';
import 'package:cupid_ai/features/profile/data/models/user_profile_model.dart';

abstract interface class ProfileRemoteDataSource {
  Future<UserProfileModel> getProfile();
  Future<UserProfileModel> updateDisplayName(String displayName);
}

class ProfileRemoteDataSourceImpl implements ProfileRemoteDataSource {
  const ProfileRemoteDataSourceImpl(this._dio);

  final Dio _dio;

  @override
  Future<UserProfileModel> getProfile() async {
    try {
      final response = await _dio.get('/profile');
      return UserProfileModel.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiClient.handleError(e);
    }
  }

  @override
  Future<UserProfileModel> updateDisplayName(String displayName) async {
    try {
      final response = await _dio.patch('/profile', data: {
        'display_name': displayName,
      });
      return UserProfileModel.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiClient.handleError(e);
    }
  }
}
