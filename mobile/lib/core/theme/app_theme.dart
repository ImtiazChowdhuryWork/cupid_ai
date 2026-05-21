import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:cupid_ai/gen/colors.gen.dart';
import 'package:cupid_ai/gen/fonts.gen.dart';
import 'package:cupid_ai/core/theme/app_text_styles.dart';

export 'package:cupid_ai/gen/colors.gen.dart';
export 'package:cupid_ai/core/theme/app_text_styles.dart';

class AppTheme {
  AppTheme._();

  // Convenience color aliases — delegate to AppColors.
  static const Color primaryColor = AppColors.primary;
  static const Color primaryLight = AppColors.primaryLight;
  static const Color primaryDark = AppColors.primaryDark;
  static const Color secondaryColor = AppColors.secondary;
  static const Color accentColor = AppColors.accent;
  static const Color background = AppColors.background;
  static const Color surface = AppColors.surface;
  static const Color surfaceVariant = AppColors.surfaceVariant;
  static const Color textPrimary = AppColors.textPrimary;
  static const Color textSecondaryColor = AppColors.textSecondary;
  static const Color textHint = AppColors.textHint;
  static const Color successColor = AppColors.success;
  static const Color errorColor = AppColors.error;
  static const Color warningColor = AppColors.warning;
  static const Color infoColor = AppColors.info;

  static const LinearGradient primaryGradient = AppColors.primaryGradient;
  static const LinearGradient backgroundGradient = AppColors.backgroundGradient;

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: AppColors.surface,
        error: AppColors.error,
      ),
      scaffoldBackgroundColor: AppColors.scaffoldBackground,
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontFamily: FontFamily.poppins,
          fontSize: 18.sp,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: const BorderSide(color: AppColors.secondary),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: const BorderSide(color: AppColors.secondary),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.r),
          borderSide: const BorderSide(color: AppColors.error, width: 2),
        ),
        hintStyle: TextStyle(
          fontFamily: FontFamily.poppins,
          color: AppColors.textHint,
          fontSize: 14.sp,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.textHint,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.r),
          ),
          minimumSize: Size(double.infinity, 56.h),
          elevation: 0,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 2,
        shadowColor: AppColors.primary.withValues(alpha: 0.1),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.r),
        ),
      ),
      fontFamily: FontFamily.poppins,
    );
  }

  // Shim getters used by existing widgets — delegate to AppTextStyles.
  static TextStyle get headlineLarge => AppTextStyles.displayLarge;
  static TextStyle get headlineMedium => AppTextStyles.displayMedium;
  static TextStyle get headlineSmall => AppTextStyles.displaySmall;
  static TextStyle get bodyTextStyle => AppTextStyles.bodyMedium;
  static TextStyle get labelTextStyle => AppTextStyles.label;
  static TextStyle get captionTextStyle => AppTextStyles.caption;
}
