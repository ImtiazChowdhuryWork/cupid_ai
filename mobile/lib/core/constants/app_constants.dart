class AppConstants {
  AppConstants._();

  // App info
  static const String appName = 'Cupid AI';
  static const String appVersion = '1.0.0';

  // API
  // Dev: PC's local IP so physical Android device can reach the backend
  // Production: change to your deployed server URL
  // Dev: use localhost for Chrome, 192.168.1.115 for physical Android device
  static const String baseUrl = 'http://127.0.0.1:8080/api/v1';
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Storage keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userIdKey = 'user_id';
  static const String onboardingCompleteKey = 'onboarding_complete';

  // Subscription tiers
  static const String tierFree = 'free';
  static const String tierBasic = 'basic';
  static const String tierMonthly = 'monthly';
  static const String tierPremium = 'premium';

  // Free tier limits
  static const int freeAnalysesPerDay = 3;
  static const int freeResponsesPerAnalysis = 5;

  // Response modes
  static const List<String> responseModes = [
    'witty',
    'sincere',
    'confident',
    'thoughtful',
    'casual',
  ];

  // Animation durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);

  // Pagination
  static const int defaultPageSize = 20;

  // Cache TTL
  static const Duration responseCacheTtl = Duration(hours: 24);
  static const Duration userCacheTtl = Duration(minutes: 30);
}
