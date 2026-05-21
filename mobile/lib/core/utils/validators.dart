class Validators {
  Validators._();

  static String? email(String? value) {
    if (value == null || value.isEmpty) return 'Email is required';
    final isValid = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    ).hasMatch(value);
    if (!isValid) return 'Enter a valid email address';
    return null;
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return null;
  }

  static String? confirmPassword(String? value, String password) {
    if (value == null || value.isEmpty) return 'Please confirm your password';
    if (value != password) return 'Passwords do not match';
    return null;
  }

  static String? required(String? value, {String fieldName = 'This field'}) {
    if (value == null || value.trim().isEmpty) return '$fieldName is required';
    return null;
  }

  static String? minLength(String? value, int min, {String fieldName = 'This field'}) {
    if (value == null || value.isEmpty) return '$fieldName is required';
    if (value.length < min) return '$fieldName must be at least $min characters';
    return null;
  }

  static String? maxLength(String? value, int max, {String fieldName = 'This field'}) {
    if (value != null && value.length > max) {
      return '$fieldName must be at most $max characters';
    }
    return null;
  }

  static String? displayName(String? value) {
    if (value == null || value.isEmpty) return 'Display name is required';
    if (value.length < 2) return 'Display name must be at least 2 characters';
    if (value.length > 100) return 'Display name must be at most 100 characters';
    return null;
  }

  static String? conversationText(String? value) {
    if (value == null || value.trim().isEmpty) return 'Please paste a conversation';
    if (value.trim().length < 10) return 'Conversation is too short to analyze';
    return null;
  }
}
