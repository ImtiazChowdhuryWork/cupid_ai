sealed class AppError implements Exception {
  final String message;
  final String? code;

  const AppError({required this.message, this.code});

  @override
  String toString() => message;
}

class NetworkError extends AppError {
  const NetworkError({super.message = 'Network error. Check your connection.', super.code});
}

class TimeoutError extends AppError {
  const TimeoutError({super.message = 'Request timed out. Please try again.', super.code});
}

class UnauthorizedError extends AppError {
  const UnauthorizedError({super.message = 'Session expired. Please log in again.', super.code});
}

class NotFoundError extends AppError {
  const NotFoundError({super.message = 'Resource not found.', super.code});
}

class ValidationError extends AppError {
  final Map<String, String>? fieldErrors;

  const ValidationError({
    super.message = 'Validation failed.',
    super.code,
    this.fieldErrors,
  });
}

class AIServiceError extends AppError {
  const AIServiceError({
    super.message = 'AI service is unavailable. Please try again.',
    super.code,
  });
}

class QuotaExceededError extends AppError {
  const QuotaExceededError({
    super.message = 'Daily limit reached. Upgrade to continue.',
    super.code,
  });
}

class ServerError extends AppError {
  const ServerError({super.message = 'Something went wrong. Please try again.', super.code});
}

class CacheError extends AppError {
  const CacheError({super.message = 'Cache error.', super.code});
}

class UnknownError extends AppError {
  const UnknownError({super.message = 'An unexpected error occurred.', super.code});
}
