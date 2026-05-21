import 'package:dio/dio.dart';

class AuthInterceptor extends Interceptor {
  final String? Function() tokenProvider;

  AuthInterceptor({required this.tokenProvider});

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = tokenProvider();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // 401 handling is done at the repository level to trigger re-auth
    handler.next(err);
  }
}
