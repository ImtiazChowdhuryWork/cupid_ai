// dart format width=80
// GENERATED CODE - DO NOT MODIFY BY HAND
// Run: flutter pub run build_runner build

// coverage:ignore-file
// ignore_for_file: type=lint

import 'package:flutter/painting.dart';
import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary brand
  static const Color primary = Color(0xFFE8426F);
  static const Color primaryLight = Color(0xFFFF6B9D);
  static const Color primaryDark = Color(0xFFC2185B);
  static const Color secondary = Color(0xFFFFB3C6);
  static const Color accent = Color(0xFFFF8FA3);

  // Gradient
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, primaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  static const LinearGradient backgroundGradient = LinearGradient(
    colors: [background, surfaceVariant],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  // Backgrounds
  static const Color background = Color(0xFFFFF5F7);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFFCE4EC);

  // Text
  static const Color textPrimary = Color(0xFF1A1A2E);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textHint = Color(0xFFADB5BD);

  // Status
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);

  // Nav
  static const Color navBarBg = Color(0xFFFFFFFF);
  static const Color navIconSelected = Color(0xFFE8426F);
  static const Color navIconUnselected = Color(0xFFADB5BD);

  // Scaffold
  static const Color scaffoldBackground = Color(0xFFFFF5F7);
}
