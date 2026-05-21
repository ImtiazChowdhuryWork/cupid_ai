import 'package:flutter/material.dart';
import 'package:cupid_ai/core/theme/app_theme.dart';

enum SnackBarType { success, error, warning, info }

class AppSnackBar {
  AppSnackBar._();

  static void show(
    BuildContext context, {
    required String message,
    SnackBarType type = SnackBarType.info,
    Duration duration = const Duration(seconds: 3),
  }) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(_icon(type), color: Colors.white, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  message,
                  style: const TextStyle(
                    color: Colors.white,
                    fontFamily: 'Poppins',
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
          backgroundColor: _color(type),
          duration: duration,
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
  }

  static void success(BuildContext context, String message) =>
      show(context, message: message, type: SnackBarType.success);

  static void error(BuildContext context, String message) =>
      show(context, message: message, type: SnackBarType.error);

  static void info(BuildContext context, String message) =>
      show(context, message: message, type: SnackBarType.info);

  static IconData _icon(SnackBarType type) => switch (type) {
        SnackBarType.success => Icons.check_circle_outline,
        SnackBarType.error => Icons.error_outline,
        SnackBarType.warning => Icons.warning_amber_outlined,
        SnackBarType.info => Icons.info_outline,
      };

  static Color _color(SnackBarType type) => switch (type) {
        SnackBarType.success => AppTheme.successColor,
        SnackBarType.error => AppTheme.errorColor,
        SnackBarType.warning => AppTheme.warningColor,
        SnackBarType.info => AppTheme.primaryColor,
      };
}
