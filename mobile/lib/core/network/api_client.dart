import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:cupid_ai/core/constants/app_constants.dart';
import 'package:cupid_ai/core/errors/app_error.dart';
import 'package:cupid_ai/core/network/auth_interceptor.dart';

class ApiClient {
  ApiClient._();

  static Dio create({required String? Function() tokenProvider}) {
    final dio = Dio(
      BaseOptions(
        baseUrl: AppConstants.baseUrl,
        connectTimeout: AppConstants.connectTimeout,
        receiveTimeout: AppConstants.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.addAll([
      AuthInterceptor(tokenProvider: tokenProvider),
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        error: true,
        logPrint: (obj) => debugPrint(obj.toString()),
      ),
    ]);

    return dio;
  }

  static AppError handleError(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.receiveTimeout:
        case DioExceptionType.sendTimeout:
          return const TimeoutError();
        case DioExceptionType.connectionError:
          return const NetworkError();
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          final data = error.response?.data;
          final message = data is Map ? data['message'] as String? : null;

          return switch (statusCode) {
            400 => ValidationError(message: message ?? 'Invalid request'),
            401 => const UnauthorizedError(),
            403 => QuotaExceededError(message: message ?? 'Access denied'),
            404 => const NotFoundError(),
            429 => const QuotaExceededError(),
            500 || 502 || 503 => ServerError(message: message ?? 'Server error'),
            _ => UnknownError(message: message ?? 'Unknown error'),
          };
        default:
          return const UnknownError();
      }
    }
    return const UnknownError();
  }
}
