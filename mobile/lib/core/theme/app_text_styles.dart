import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:cupid_ai/gen/colors.gen.dart';
import 'package:cupid_ai/gen/fonts.gen.dart';

// Uses the locally bundled Poppins font declared in pubspec.yaml.
// All sizes use .sp so they scale with the device via flutter_screenutil.
class AppTextStyles {
  AppTextStyles._();

  static TextStyle get displayLarge => TextStyle(
        fontFamily: FontFamily.poppins,
        fontSize: 32.sp,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
        height: 1.2,
      );

  static TextStyle get displayMedium => TextStyle(
        fontFamily: FontFamily.poppins,
        fontSize: 24.sp,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
        height: 1.3,
      );

  static TextStyle get displaySmall => TextStyle(
        fontFamily: FontFamily.poppins,
        fontSize: 20.sp,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
        height: 1.4,
      );

  static TextStyle get bodyLarge => TextStyle(
        fontFamily: FontFamily.poppins,
        fontSize: 16.sp,
        fontWeight: FontWeight.w400,
        color: AppColors.textPrimary,
        height: 1.5,
      );

  static TextStyle get bodyMedium => TextStyle(
        fontFamily: FontFamily.poppins,
        fontSize: 14.sp,
        fontWeight: FontWeight.w400,
        color: AppColors.textPrimary,
        height: 1.5,
      );

  static TextStyle get bodySmall => TextStyle(
        fontFamily: FontFamily.poppins,
        fontSize: 12.sp,
        fontWeight: FontWeight.w400,
        color: AppColors.textSecondary,
        height: 1.4,
      );

  static TextStyle get label => TextStyle(
        fontFamily: FontFamily.poppins,
        fontSize: 14.sp,
        fontWeight: FontWeight.w500,
        color: AppColors.textPrimary,
      );

  static TextStyle get labelSmall => TextStyle(
        fontFamily: FontFamily.poppins,
        fontSize: 11.sp,
        fontWeight: FontWeight.w500,
        color: AppColors.textSecondary,
        height: 1.0,
      );

  static TextStyle get buttonLabel => TextStyle(
        fontFamily: FontFamily.poppins,
        fontSize: 16.sp,
        fontWeight: FontWeight.w600,
        color: Colors.white,
      );

  static TextStyle get caption => TextStyle(
        fontFamily: FontFamily.poppins,
        fontSize: 12.sp,
        fontWeight: FontWeight.w400,
        color: AppColors.textSecondary,
      );

  static TextStyle get badge => TextStyle(
        fontFamily: FontFamily.poppins,
        fontSize: 11.sp,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.5,
      );

  static TextStyle get navLabel => TextStyle(
        fontFamily: FontFamily.poppins,
        fontSize: 11.sp,
        fontWeight: FontWeight.w500,
        height: 1.0,
      );
}
